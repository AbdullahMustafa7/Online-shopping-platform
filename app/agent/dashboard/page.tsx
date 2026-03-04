import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";
import { AcceptOrderButton } from "./AcceptOrderButton";

export default async function AgentDashboardPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/agent/dashboard");
    return;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("email", user.email)
    .limit(1)
    .maybeSingle();

  if (!profile) {
    redirect("/login?next=/agent/dashboard");
    return;
  }

  const { data: agent } = await supabase
    .from("delivery_agents")
    .select("id,available,total_deliveries,earnings")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!agent) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
        No delivery agent profile found for this account.
      </div>
    );
  }

  const { data: availableOrders } = await supabase
    .from("orders")
    .select("id,total,delivery_address,created_at")
    .eq("status", "ready")
    .is("agent_id", null)
    .order("created_at", { ascending: true })
    .limit(50);

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
        <Stat label="Total deliveries" value={String(agent.total_deliveries ?? 0)} />
        <Stat label="Earnings" value={`$${Number(agent.earnings ?? 0).toFixed(2)}`} />
        <Stat label="Available orders" value={String(availableOrders?.length ?? 0)} />
      </div>

      <div className="space-y-3">
        {(availableOrders ?? []).map((o) => (
          <div
            key={o.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-900">
                  Order #{String(o.id).slice(0, 8)}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {new Date(String(o.created_at)).toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-zinc-700">
                  <span className="font-medium">Deliver to:</span>{" "}
                  {o.delivery_address}
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 md:flex-col md:items-end">
                <div className="text-sm font-semibold text-zinc-900">
                  ${Number(o.total).toFixed(2)}
                </div>
                <AcceptOrderButton orderId={o.id} agentId={agent.id} />
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

