import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";

export default async function OrdersPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/orders");

  const supabase = await supabaseServer();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,status,total,created_at")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your orders</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Track status updates from vendor to delivery.
          </p>
        </div>
        <Link
          href="/products"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Shop more
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <div className="space-y-3">
        {(orders ?? []).map((o) => (
          <Link
            key={o.id}
            href={`/orders/${o.id}`}
            className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-300"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-900">
                  Order #{String(o.id).slice(0, 8)}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {new Date(String(o.created_at)).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-zinc-900">
                  ${Number(o.total).toFixed(2)}
                </div>
                <div className="mt-1 text-xs font-medium text-emerald-700">
                  {String(o.status)}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {orders && orders.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
            No orders yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}

