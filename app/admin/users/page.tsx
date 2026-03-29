import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Vendor } from "@/lib/models/Vendor";
import { DeliveryAgent } from "@/lib/models/DeliveryAgent";
import { ToggleAgentActive, ToggleVendorApproved } from "./ApproveButtons";

export default async function AdminUsersPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/admin/users");

  await connectDB();
  const [users, vendors, agents] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).limit(200).lean(),
    Vendor.find({}).lean(),
    DeliveryAgent.find({}).lean(),
  ]);

  const vendorByUser = new Map<string, any>(
    (vendors ?? []).map((v: any) => [String(v.userId), v]),
  );
  const agentByUser = new Map<string, any>(
    (agents ?? []).map((a: any) => [String(a.userId), a]),
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
            {(users ?? []).map((u: any) => {
              const vendor = vendorByUser.get(String(u._id));
              const agent = agentByUser.get(String(u._id));
              return (
                <tr key={String(u._id)} className="border-t border-zinc-100">
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
                      Created: {new Date(String(u.createdAt)).toLocaleString()}
                    </div>
                    {vendor ? (
                      <div className="mt-2">
                        Vendor: {vendor.shopName} (
                        {vendor.approved ? "approved" : "pending"})
                      </div>
                    ) : null}
                    {agent ? (
                      <div className="mt-2">
                        Agent: {agent.available ? "active" : "inactive"} •{" "}
                        {agent.totalDeliveries} deliveries • $
                        {Number(agent.earnings ?? 0).toFixed(2)}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {u.role === "vendor" && vendor ? (
                        <ToggleVendorApproved
                          vendorId={String(vendor._id)}
                          approved={!!vendor.approved}
                        />
                      ) : u.role === "agent" && agent ? (
                        <ToggleAgentActive
                          agentId={String(agent._id)}
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

