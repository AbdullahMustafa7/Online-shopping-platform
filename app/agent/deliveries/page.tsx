import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { DeliveryAgent } from "@/lib/models/DeliveryAgent";
import { Order } from "@/lib/models/Order";
import { formatINR } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function AgentDeliveriesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/agent/deliveries");
  await connectDB();
  const agent: any = await DeliveryAgent.findOne({ userId: session.user.id }).lean();

  if (!agent) redirect("/agent/dashboard");

  const orders: any[] = await Order.find({ agentId: agent._id }).sort({ createdAt: -1 }).limit(100).lean();

  const active = (orders ?? []).filter((o) =>
    ["picked_up", "on_the_way"].includes(String(o.status)),
  );
  const past = (orders ?? []).filter((o) => String(o.status) === "delivered");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deliveries</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Active and past deliveries.
          </p>
        </div>
        <Link
          href="/agent/dashboard"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <Section title="Active" items={active} />
      <Section title="Past" items={past} />
    </div>
  );
}

function Section({ title, items }: { title: string; items: any[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
        {title}
      </h2>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          No {title.toLowerCase()} deliveries.
        </div>
      ) : (
        items.map((o) => (
          <Link
            key={String(o._id)}
            href={`/agent/deliveries/${o._id}`}
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
                <div className="mt-2 text-sm text-zinc-700">
                  <span className="font-medium">Deliver to:</span>{" "}
                  {o.deliveryAddress}
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
        ))
      )}
    </section>
  );
}

