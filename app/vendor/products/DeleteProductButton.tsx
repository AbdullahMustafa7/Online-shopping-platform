"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function del() {
    if (!confirm("Delete this product?")) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete.");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Could not delete.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-right">
      <button
        onClick={del}
        disabled={loading}
        className="rounded-md px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
      {error ? <div className="mt-1 text-xs text-red-700">{error}</div> : null}
    </div>
  );
}

