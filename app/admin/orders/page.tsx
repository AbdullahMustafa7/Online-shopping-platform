import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";

type SearchParams = { status?: string };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/admin/orders");

  const sp = await searchParams;
  const status = (sp.status ?? "").trim();

  const supabase = await supabaseServer();
  let query = supabase
    .from("orders")
    .select("id,status,total,customer_id,vendor_id,agent_id,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("status", status);

  const { data: orders, error } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-zinc-600">All orders in the system.</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <form
        method="GET"
        className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <label className="block">
          <span className="text-xs font-medium text-zinc-600">Filter by status</span>
          <select
            name="status"
            defaultValue={status}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="ready">ready</option>
            <option value="picked_up">picked_up</option>
            <option value="on_the_way">on_the_way</option>
            <option value="delivered">delivered</option>
          </select>
        </label>
        <button className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          Apply
        </button>
      </form>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-medium text-zinc-600">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Agent</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {String(o.id).slice(0, 8)}
                  <div className="text-xs text-zinc-500">
                    {new Date(String(o.created_at)).toLocaleString()}
                  </div>
                </td>
                <td className="px-4 py-3">{String(o.status)}</td>
                <td className="px-4 py-3">${Number(o.total).toFixed(2)}</td>
                <td className="px-4 py-3 text-xs text-zinc-600">
                  {String(o.customer_id).slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-600">
                  {String(o.vendor_id).slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-600">
                  {o.agent_id ? String(o.agent_id).slice(0, 8) : "—"}
                </td>
              </tr>
            ))}
            {orders && orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-zinc-600">
                  No orders found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

