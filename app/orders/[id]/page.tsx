import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { OrderItem } from "@/lib/models/OrderItem";
import { Product } from "@/lib/models/Product";
import { formatINR } from "@/lib/currency";
import type { OrderStatus } from "@/lib/types";
import { OrderStatusTracker } from "./OrderStatusTracker";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/orders");

  const { id } = await params;
  await connectDB();
  const order: any = await Order.findOne({ _id: id, customerId: userId }).lean();
  if (!order) return notFound();
  const items: any[] = await OrderItem.find({ orderId: id }).lean();
  const productIds = items.map((i) => i.productId);
  const products: any[] = productIds.length
    ? await Product.find({ _id: { $in: productIds } }).select("name").lean()
    : [];
  const byId = new Map<string, any>(products.map((p) => [String(p._id), p]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/orders" className="text-sm font-medium text-zinc-700">
          ← Back to orders
        </Link>
        <Link
          href="/products"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Shop more
        </Link>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Order #{String(order._id).slice(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Placed {new Date(String(order.createdAt)).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-600">Total</div>
            <div className="text-2xl font-semibold">
              {formatINR(Number(order.total))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-zinc-700">
          <span className="font-medium text-zinc-900">Deliver to:</span>{" "}
          {order.deliveryAddress}
        </div>
      </div>

      <OrderStatusTracker
        orderId={String(order._id)}
        initialStatus={order.status as OrderStatus}
      />

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-medium text-zinc-900">Items</div>
        <div className="mt-3 space-y-2">
          {(items ?? []).map((it) => (
            <div
              key={String(it._id)}
              className="flex items-center justify-between text-sm"
            >
              <div className="text-zinc-800">
                {byId.get(String(it.productId))?.name ?? String(it.productId)}
                <span className="ml-2 text-zinc-500">× {it.quantity}</span>
              </div>
              <div className="font-medium text-zinc-900">
                {formatINR(Number(it.price) * Number(it.quantity))}
              </div>
            </div>
          ))}
          {items && items.length === 0 ? (
            <div className="text-sm text-zinc-600">No items found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

