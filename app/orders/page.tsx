import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { formatINR } from "@/lib/currency";

export default async function OrdersPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/orders");

  await connectDB();
  const orders: any[] = await Order.find({ customerId: userId }).sort({ createdAt: -1 }).limit(50).lean();

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

      <div className="space-y-3">
        {(orders ?? []).map((o) => (
          <Link
            key={String(o._id)}
            href={`/orders/${o._id}`}
            className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-300"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-900">
                  Order #{String(o._id).slice(0, 8)}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {new Date(String(o.createdAt)).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-zinc-900">
                  {formatINR(Number(o.total))}
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

