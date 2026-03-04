import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";
import { DeliveryActions } from "./DeliveryActions";

export default async function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/agent/deliveries");
    return;
  }
  const { id } = await params;
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

  const { data: order, error } = await supabase
    .from("orders")
    .select("id,status,total,delivery_address,created_at")
    .eq("id", id)
    .eq("agent_id", agent.id)
    .limit(1)
    .maybeSingle();

  if (error || !order) return notFound();

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
              Delivery #{String(order.id).slice(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Status: <span className="font-medium">{String(order.status)}</span>
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

        <div className="mt-6">
          <DeliveryActions orderId={order.id} status={order.status as OrderStatus} />
        </div>
      </div>
    </div>
  );
}

