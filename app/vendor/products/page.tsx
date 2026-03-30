import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Vendor } from "@/lib/models/Vendor";
import { Product } from "@/lib/models/Product";
import { formatINR } from "@/lib/currency";
import { DeleteProductButton } from "./DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function VendorProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/vendor/products");
  await connectDB();
  const vendor: any = await Vendor.findOne({ userId: session.user.id }).lean();

  if (!vendor) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
        No vendor profile found for this account.
      </div>
    );
  }

  const products: any[] = await Product.find({ vendorId: vendor._id }).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-zinc-600">{vendor.shopName}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Link
            href="/vendor/dashboard"
            className="flex items-center justify-center min-h-[44px] rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Back
          </Link>
          <Link
            href="/vendor/products/new"
            className="flex items-center justify-center min-h-[44px] rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add product
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm min-w-[500px]">
          <thead className="bg-zinc-50 text-xs font-medium text-zinc-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={String(p._id)} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {p.name}
                </td>
                <td className="px-4 py-3">{formatINR(Number(p.price))}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/vendor/products/${p._id}/edit`}
                      className="flex items-center justify-center min-h-[44px] rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton productId={String(p._id)} />
                  </div>
                </td>
              </tr>
            ))}
            {products && products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-zinc-600">
                  No products yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

