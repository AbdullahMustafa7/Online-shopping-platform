"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export function AcceptOrderButton({
  orderId,
  agentId,
}: {
  orderId: string;
  agentId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setError(null);
    setLoading(true);
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase
        .from("orders")
        .update({ agent_id: agentId, status: "picked_up" })
        .eq("id", orderId)
        .is("agent_id", null);
      if (error) throw error;
      router.push(`/agent/deliveries/${orderId}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Could not accept delivery.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1 text-right">
      <button
        onClick={accept}
        disabled={loading}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Accepting..." : "Accept"}
      </button>
      {error ? <div className="text-xs text-red-700">{error}</div> : null}
    </div>
  );
}

