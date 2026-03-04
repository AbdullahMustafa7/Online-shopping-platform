import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";

export default async function VendorDashboardPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/vendor/dashboard");
    return;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("email", user.email)
    .limit(1)
    .maybeSingle();

  if (!profile) {
    redirect("/login?next=/vendor/dashboard");
    return;
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id,shop_name,approved,created_at")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!vendor) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
        No vendor profile found for this account.
      </div>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id,total,status,created_at")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const totalOrders = orders?.length ?? 0;
  const revenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const pending = (orders ?? []).filter((o) => String(o.status) === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Vendor dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            {vendor.shop_name}{" "}
            {!vendor.approved ? (
              <span className="inline-block mt-2 sm:mt-0 sm:ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Pending approval
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Link
            href="/vendor/products"
            className="flex items-center justify-center min-h-[44px] rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Manage products
          </Link>
          <Link
            href="/vendor/orders"
            className="flex items-center justify-center min-h-[44px] rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            View orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Stat label="Total orders" value={String(totalOrders)} />
        <Stat label="Pending" value={String(pending)} />
        <Stat label="Revenue" value={`$${revenue.toFixed(2)}`} />
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

