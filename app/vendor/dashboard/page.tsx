import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Vendor } from "@/lib/models/Vendor";
import { Order } from "@/lib/models/Order";
import { formatINR } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function VendorDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/vendor/dashboard");
  await connectDB();
  const vendor: any = await Vendor.findOne({ userId: session.user.id }).lean();

  if (!vendor) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
        No vendor profile found for this account.
      </div>
    );
  }

  const orders: any[] = await Order.find({ vendorId: vendor._id }).sort({ createdAt: -1 }).limit(200).lean();

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
            {vendor.shopName}{" "}
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
        <Stat label="Revenue" value={formatINR(revenue)} />
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

