"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ToggleVendorApproved({
  vendorId,
  approved,
}: {
  vendorId: string;
  approved: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "vendor", id: vendorId, approved: !approved }),
      });
      if (!res.ok) throw new Error("Could not update vendor.");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Could not update vendor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1 text-right">
      <button
        onClick={toggle}
        disabled={loading}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
      >
        {loading ? "Saving..." : approved ? "Unapprove" : "Approve"}
      </button>
      {error ? <div className="text-xs text-red-700">{error}</div> : null}
    </div>
  );
}

export function ToggleAgentActive({
  agentId,
  active,
}: {
  agentId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "agent", id: agentId, available: !active }),
      });
      if (!res.ok) throw new Error("Could not update agent.");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Could not update agent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1 text-right">
      <button
        onClick={toggle}
        disabled={loading}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
      >
        {loading ? "Saving..." : active ? "Deactivate" : "Activate"}
      </button>
      {error ? <div className="text-xs text-red-700">{error}</div> : null}
    </div>
  );
}

