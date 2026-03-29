import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Vendor } from "@/lib/models/Vendor";
import { Order } from "@/lib/models/Order";
import { formatINR } from "@/lib/currency";
import type { OrderStatus } from "@/lib/types";
import { OrderActions } from "./OrderActions";

export default async function VendorOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/vendor/orders");
  await connectDB();
  const vendor: any = await Vendor.findOne({ userId: session.user.id }).lean();

  if (!vendor) redirect("/vendor/dashboard");

  const orders: any[] = await Order.find({ vendorId: vendor._id }).sort({ createdAt: -1 }).limit(100).lean();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-zinc-600">{vendor.shopName}</p>
        </div>
        <Link
          href="/vendor/dashboard"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <div className="space-y-3">
        {(orders ?? []).map((o) => (
          <div
            key={String(o._id)}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-900">
                  Order #{String(o._id).slice(0, 8)}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {new Date(String(o.createdAt)).toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-zinc-700">
                  <span className="font-medium">Deliver to:</span>{" "}
                  {o.deliveryAddress}
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 md:flex-col md:items-end">
                <div className="text-right">
                  <div className="text-sm font-semibold text-zinc-900">
                    {formatINR(Number(o.total))}
                  </div>
                  <div className="mt-1 text-xs font-medium text-emerald-700">
                    {String(o.status)}
                  </div>
                </div>
                <OrderActions
                  orderId={String(o._id)}
                  status={o.status as OrderStatus}
                />
              </div>
            </div>
          </div>
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

