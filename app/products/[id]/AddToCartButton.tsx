"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
      const meRes = await fetch("/api/users/me");
      if (!meRes.ok) {
        router.push(`/login?next=${encodeURIComponent(`/products/${productId}`)}`);
        return;
      }
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Could not add to cart.");
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

