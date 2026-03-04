import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";
import { OrderActions } from "./OrderActions";

export default async function VendorOrdersPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/vendor/orders");
    return;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("email", user.email)
    .limit(1)
    .maybeSingle();

  if (!profile) {
    redirect("/login?next=/vendor/orders");
    return;
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id,shop_name")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!vendor) redirect("/vendor/dashboard");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,status,total,delivery_address,created_at")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-zinc-600">{vendor.shop_name}</p>
        </div>
        <Link
          href="/vendor/dashboard"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <div className="space-y-3">
        {(orders ?? []).map((o) => (
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
                <div className="text-right">
                  <div className="text-sm font-semibold text-zinc-900">
                    ${Number(o.total).toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs font-medium text-emerald-700">
                    {String(o.status)}
                  </div>
                </div>
                <OrderActions
                  orderId={o.id}
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

