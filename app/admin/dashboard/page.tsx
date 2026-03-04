import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/admin/dashboard");

  const supabase = await supabaseServer();

  const { data: orders } = await supabase
    .from("orders")
    .select("id,total,status")
    .limit(5000);

  const { data: users } = await supabase.from("users").select("id,role").limit(5000);

  const { data: vendors } = await supabase
    .from("vendors")
    .select("id,approved")
    .limit(5000);

  const totalOrders = orders?.length ?? 0;
  const revenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const pendingVendors = (vendors ?? []).filter((v) => !v.approved).length;
  const totalUsers = users?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Overview of orders, revenue, and users.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/users"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Manage users
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            View orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Stat label="Total orders" value={String(totalOrders)} />
        <Stat label="Revenue" value={`$${revenue.toFixed(2)}`} />
        <Stat label="Total users" value={String(totalUsers)} />
        <Stat label="Pending vendors" value={String(pendingVendors)} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <LinkCard title="Users" href="/admin/users" />
        <LinkCard title="Orders" href="/admin/orders" />
        <LinkCard title="Products" href="/admin/products" />
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

function LinkCard({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
    >
      <div className="text-sm font-medium text-zinc-900">{title}</div>
      <div className="mt-1 text-xs text-zinc-500">Open →</div>
    </Link>
  );
}

