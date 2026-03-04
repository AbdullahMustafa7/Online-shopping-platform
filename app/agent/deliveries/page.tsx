import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AgentDeliveriesPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/agent/deliveries");
    return;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("email", user.email)
    .limit(1)
    .maybeSingle();

  if (!profile) {
    redirect("/login?next=/agent/deliveries");
    return;
  }

  const { data: agent } = await supabase
    .from("delivery_agents")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!agent) redirect("/agent/dashboard");

  const { data: orders } = await supabase
    .from("orders")
    .select("id,status,total,delivery_address,created_at")
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false })
    .limit(100);

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
            key={o.id}
            href={`/agent/deliveries/${o.id}`}
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
                <div className="mt-2 text-sm text-zinc-700">
                  <span className="font-medium">Deliver to:</span>{" "}
                  {o.delivery_address}
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
        ))
      )}
    </section>
  );
}

