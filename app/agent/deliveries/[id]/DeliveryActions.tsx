"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/types";

function nextForAgent(status: OrderStatus): OrderStatus | null {
  if (status === "picked_up") return "on_the_way";
  if (status === "on_the_way") return "delivered";
  return null;
}

export function DeliveryActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = nextForAgent(status);

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
      setError(err?.message ?? "Could not update status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {next ? (
        <button
          onClick={advance}
          disabled={loading}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading ? "Saving..." : `Mark ${next.replaceAll("_", " ")}`}
        </button>
      ) : (
        <div className="text-sm text-zinc-600">No actions available.</div>
      )}
      {error ? <div className="text-sm text-red-700">{error}</div> : null}
    </div>
  );
}

