"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/types";

function nextForVendor(status: OrderStatus): OrderStatus | null {
  if (status === "pending") return "confirmed";
  if (status === "confirmed") return "ready";
  return null;
}

export function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = nextForVendor(status);

  async function advance() {
    if (!next) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase
        .from("orders")
        .update({ status: next })
        .eq("id", orderId);
      if (error) throw error;
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Could not update order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1 text-right">
      {next ? (
        <button
          onClick={advance}
          disabled={loading}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading ? "Saving..." : `Mark ${next.replaceAll("_", " ")}`}
        </button>
      ) : (
        <div className="text-xs text-zinc-500">No actions</div>
      )}
      {error ? <div className="text-xs text-red-700">{error}</div> : null}
    </div>
  );
}

