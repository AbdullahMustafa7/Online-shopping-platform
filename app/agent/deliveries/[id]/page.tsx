import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { DeliveryAgent } from "@/lib/models/DeliveryAgent";
import { Order } from "@/lib/models/Order";
import { formatINR } from "@/lib/currency";
import type { OrderStatus } from "@/lib/types";
import { DeliveryActions } from "./DeliveryActions";

export default async function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/agent/deliveries");
  const { id } = await params;
  await connectDB();
  const agent: any = await DeliveryAgent.findOne({ userId: session.user.id }).lean();

  if (!agent) redirect("/agent/dashboard");

  const order: any = await Order.findOne({ _id: id, agentId: agent._id }).lean();
  if (!order) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/agent/deliveries" className="text-sm font-medium text-zinc-700">
          ← Back to deliveries
        </Link>
        <Link
          href="/agent/dashboard"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Dashboard
        </Link>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Delivery #{String(order._id).slice(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Status: <span className="font-medium">{String(order.status)}</span>
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

        <div className="mt-6">
          <DeliveryActions orderId={String(order._id)} status={order.status as OrderStatus} />
        </div>
      </div>
    </div>
  );
}

