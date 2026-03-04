import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type SearchParams = {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const category = (sp.category ?? "").trim();
  const min = sp.min ? Number(sp.min) : null;
  const max = sp.max ? Number(sp.max) : null;

  const supabase = await supabaseServer();

  const { data: categories } = await supabase
    .from("categories")
    .select("id,name")
    .order("name", { ascending: true });

  let query = supabase
    .from("products")
    .select("id,name,description,price,stock,image_url,category_id")
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);
  if (category) query = query.eq("category_id", category);
  if (min !== null && !Number.isNaN(min)) query = query.gte("price", min);
  if (max !== null && !Number.isNaN(max)) query = query.lte("price", max);

  const { data: products, error } = await query.limit(60);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Search and filter by category and price.
          </p>
        </div>
        <Link
          href="/cart"
          className="flex items-center justify-center min-h-[44px] rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          View cart
        </Link>
      </div>

      <form
        method="GET"
        className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-4"
      >
        <label className="block">
          <span className="text-xs font-medium text-zinc-600">Search</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Milk, apples, bread..."
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-zinc-600">Category</span>
          <select
            name="category"
            defaultValue={category}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-zinc-600">Min price</span>
          <input
            name="min"
            defaultValue={sp.min ?? ""}
            inputMode="decimal"
            placeholder="0"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-zinc-600">Max price</span>
          <input
            name="max"
            defaultValue={sp.max ?? ""}
            inputMode="decimal"
            placeholder="50"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <div className="md:col-span-4 mt-2">
          <button className="flex items-center justify-center min-h-[44px] w-full md:w-auto rounded-md bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800">
            Apply filters
          </button>
        </div>
      </form>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {(products ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-300"
          >
            <div className="text-sm font-medium text-zinc-900">{p.name}</div>
            {p.stock === 0 ? (
              <div className="mt-1 text-xs font-medium text-red-700">
                Out of stock
              </div>
            ) : (
              <div className="mt-1 text-xs text-zinc-500">
                {p.stock} in stock
              </div>
            )}
            <div className="mt-3 text-sm font-semibold text-zinc-900">
              ${Number(p.price).toFixed(2)}
            </div>
          </Link>
        ))}
        {products && products.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No products match your filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}

