import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";
import { OrderStatusTracker } from "./OrderStatusTracker";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/orders");

  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id,status,total,delivery_address,created_at")
    .eq("id", id)
    .eq("customer_id", userId)
    .limit(1)
    .maybeSingle();

  if (error || !order) return notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("id,quantity,price,product_id")
    .eq("order_id", order.id);

  const productIds = (items ?? []).map((i) => i.product_id);
  const { data: products } =
    productIds.length === 0
      ? { data: [] as any[] }
      : await supabase.from("products").select("id,name").in("id", productIds);

  const byId = new Map<string, any>((products ?? []).map((p) => [p.id, p]));

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
              Order #{String(order.id).slice(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Placed {new Date(String(order.created_at)).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-600">Total</div>
            <div className="text-2xl font-semibold">
              ${Number(order.total).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-zinc-700">
          <span className="font-medium text-zinc-900">Deliver to:</span>{" "}
          {order.delivery_address}
        </div>
      </div>

      <OrderStatusTracker
        orderId={order.id}
        initialStatus={order.status as OrderStatus}
      />

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-medium text-zinc-900">Items</div>
        <div className="mt-3 space-y-2">
          {(items ?? []).map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="text-zinc-800">
                {byId.get(it.product_id)?.name ?? it.product_id}
                <span className="ml-2 text-zinc-500">× {it.quantity}</span>
              </div>
              <div className="font-medium text-zinc-900">
                ${(Number(it.price) * Number(it.quantity)).toFixed(2)}
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

