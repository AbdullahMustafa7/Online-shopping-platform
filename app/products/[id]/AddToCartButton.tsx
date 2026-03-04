"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addToCart() {
    setError(null);
    setLoading(true);
    try {
      const supabase = supabaseBrowser();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(`/products/${productId}`)}`);
        return;
      }

      // Upsert-like behavior: if exists, increment.
      const { data: existing } = await supabase
        .from("cart")
        .select("id,quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing?.id) {
        const { error: updErr } = await supabase
          .from("cart")
          .update({ quantity: (existing.quantity ?? 0) + 1 })
          .eq("id", existing.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase.from("cart").insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1,
        });
        if (insErr) throw insErr;
      }

      router.push("/cart");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Could not add to cart.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={addToCart}
        disabled={disabled || loading}
        className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center rounded-md bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add to cart"}
      </button>
      {error ? <div className="text-sm text-red-700">{error}</div> : null}
    </div>
  );
}

