import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/admin/products");

  const supabase = await supabaseServer();
  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,price,stock,vendor_id,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-zinc-600">All products.</p>
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
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">{p.name}</td>
                <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3 text-xs text-zinc-600">
                  {String(p.vendor_id).slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-600">
                  {new Date(String(p.created_at)).toLocaleString()}
                </td>
              </tr>
            ))}
            {products && products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-zinc-600">
                  No products found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

