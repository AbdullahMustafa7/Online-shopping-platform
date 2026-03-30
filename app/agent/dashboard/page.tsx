import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { DeliveryAgent } from "@/lib/models/DeliveryAgent";
import { Order } from "@/lib/models/Order";
import { formatINR } from "@/lib/currency";
import { AcceptOrderButton } from "./AcceptOrderButton";

export const dynamic = "force-dynamic";

export default async function AgentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/agent/dashboard");
  await connectDB();
  const agent: any = await DeliveryAgent.findOne({ userId: session.user.id }).lean();

  if (!agent) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
        No delivery agent profile found for this account.
      </div>
    );
  }

  const availableOrders: any[] = await Order.find({ status: "ready", agentId: null })
    .sort({ createdAt: 1 })
    .limit(50)
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Agent dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            {agent.available ? "Available" : "Not available"}
          </p>
        </div>
        <Link
          href="/agent/deliveries"
          className="flex items-center justify-center min-h-[44px] rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          My deliveries
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Stat label="Total deliveries" value={String(agent.totalDeliveries ?? 0)} />
        <Stat label="Earnings" value={formatINR(Number(agent.earnings ?? 0))} />
        <Stat label="Available orders" value={String(availableOrders?.length ?? 0)} />
      </div>

      <div className="space-y-3">
        {(availableOrders ?? []).map((o) => (
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
                <div className="text-sm font-semibold text-zinc-900">
                  {formatINR(Number(o.total))}
                </div>
                <AcceptOrderButton orderId={String(o._id)} agentId={String(agent._id)} />
              </div>
            </div>
          </div>
        ))}
        {availableOrders && availableOrders.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
            No ready orders available right now.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-zinc-600">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
        {value}
      </div>
    </div>
  );
}

