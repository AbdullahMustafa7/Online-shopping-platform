import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";
import { DeleteProductButton } from "./DeleteProductButton";

export default async function VendorProductsPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/vendor/products");
    return;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("email", user.email)
    .limit(1)
    .maybeSingle();

  if (!profile) {
    redirect("/login?next=/vendor/products");
    return;
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id,shop_name")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!vendor) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
        No vendor profile found for this account.
      </div>
    );
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,price,stock,created_at")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-zinc-600">{vendor.shop_name}</p>
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

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

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
              <tr key={p.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {p.name}
                </td>
                <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/vendor/products/${p.id}/edit`}
                      className="flex items-center justify-center min-h-[44px] rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton productId={p.id} />
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

