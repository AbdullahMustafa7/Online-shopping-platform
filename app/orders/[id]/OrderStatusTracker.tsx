"use client";

import { useEffect, useMemo, useState } from "react";
import type { OrderStatus } from "@/lib/types";

const FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "ready",
  "picked_up",
  "on_the_way",
  "delivered",
];

function nice(s: string) {
  return s.replaceAll("_", " ");
}

export function OrderStatusTracker({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  useEffect(() => {
    const timer = setInterval(async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json().catch(() => null);
      if (res.ok && data?.status) setStatus(data.status as OrderStatus);
    }, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [orderId]);

  const currentIdx = useMemo(() => FLOW.indexOf(status), [status]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-900">Live status</div>
        <div className="text-sm font-semibold text-emerald-700">{nice(status)}</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {FLOW.map((s, idx) => {
          const done = idx <= currentIdx;
          return (
            <div
              key={s}
              className={[
                "rounded-xl border px-3 py-2 text-xs font-medium",
                done
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600",
              ].join(" ")}
            >
              {nice(s)}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Updates in real-time when vendor/agent changes the order status.
      </p>
    </div>
  );
}

