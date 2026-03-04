import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";
import { ToggleAgentActive, ToggleVendorApproved } from "./ApproveButtons";

export default async function AdminUsersPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/admin/users");

  const supabase = await supabaseServer();

  const { data: users, error } = await supabase
    .from("users")
    .select("id,email,name,phone,role,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: vendors } = await supabase
    .from("vendors")
    .select("id,user_id,shop_name,approved");

  const { data: agents } = await supabase
    .from("delivery_agents")
    .select("id,user_id,available,total_deliveries,earnings");

  const vendorByUser = new Map<string, any>(
    (vendors ?? []).map((v) => [String(v.user_id), v]),
  );
  const agentByUser = new Map<string, any>(
    (agents ?? []).map((a) => [String(a.user_id), a]),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Approve vendors and activate/deactivate agents.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
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

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-medium text-zinc-600">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => {
              const vendor = vendorByUser.get(String(u.id));
              const agent = agentByUser.get(String(u.id));
              return (
                <tr key={u.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">
                      {u.name ?? "—"}
                    </div>
                    <div className="text-xs text-zinc-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600">
                    <div>Phone: {u.phone ?? "—"}</div>
                    <div>
                      Created: {new Date(String(u.created_at)).toLocaleString()}
                    </div>
                    {vendor ? (
                      <div className="mt-2">
                        Vendor: {vendor.shop_name} (
                        {vendor.approved ? "approved" : "pending"})
                      </div>
                    ) : null}
                    {agent ? (
                      <div className="mt-2">
                        Agent: {agent.available ? "active" : "inactive"} •{" "}
                        {agent.total_deliveries} deliveries • $
                        {Number(agent.earnings ?? 0).toFixed(2)}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {u.role === "vendor" && vendor ? (
                        <ToggleVendorApproved
                          vendorId={vendor.id}
                          approved={!!vendor.approved}
                        />
                      ) : u.role === "agent" && agent ? (
                        <ToggleAgentActive
                          agentId={agent.id}
                          active={!!agent.available}
                        />
                      ) : (
                        <span className="text-xs text-zinc-500">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {users && users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-zinc-600">
                  No users found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

