import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import { formatINR } from "@/lib/currency";

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

  await connectDB();
  const categories: any[] = await Category.find({}).sort({ name: 1 }).lean();
  const filter: any = {};
  if (q) filter.name = { $regex: q, $options: "i" };
  if (category) filter.categoryId = category;
  if (min !== null && !Number.isNaN(min)) filter.price = { ...(filter.price || {}), $gte: min };
  if (max !== null && !Number.isNaN(max)) filter.price = { ...(filter.price || {}), $lte: max };
  const products: any[] = await Product.find(filter).sort({ createdAt: -1 }).limit(60).lean();

  return (
    <div className="min-h-screen bg-green-50 p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-green-900">Products</h1>
          <p className="mt-1 text-sm text-green-700">
            Search and filter by category and price.
          </p>
        </div>
        <Link
          href="/cart"
          className="flex items-center justify-center min-h-[44px] rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          View cart
        </Link>
      </div>

      <form
        method="GET"
        className="grid grid-cols-1 gap-3 rounded-2xl border border-green-200 bg-white p-4 shadow-sm md:grid-cols-4"
      >
        <label className="block">
          <span className="text-xs font-medium text-green-700">Search</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Milk, apples, bread..."
            className="mt-1 w-full rounded-md border border-green-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-green-700">Category</span>
          <select
            name="category"
            defaultValue={category}
            className="mt-1 w-full rounded-md border border-green-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All</option>
            {(categories ?? []).map((c) => (
              <option key={String(c._id)} value={String(c._id)}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-green-700">Min price</span>
          <input
            name="min"
            defaultValue={sp.min ?? ""}
            inputMode="decimal"
            placeholder="0"
            className="mt-1 w-full rounded-md border border-green-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-green-700">Max price</span>
          <input
            name="max"
            defaultValue={sp.max ?? ""}
            inputMode="decimal"
            placeholder="500"
            className="mt-1 w-full rounded-md border border-green-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </label>
        <div className="md:col-span-4 mt-2">
          <button className="flex items-center justify-center min-h-[44px] w-full md:w-auto rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700">
            Apply filters
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {(products ?? []).map((p) => (
          <Link
            key={String(p._id)}
            href={`/products/${p._id}`}
            className="rounded-2xl border border-green-200 bg-white p-4 shadow-sm transition-all hover:border-green-400 hover:shadow-md"
          >
            <div className="text-sm font-medium text-green-900 break-words">
              {p.name}
            </div>
            {p.stock === 0 ? (
              <div className="mt-1 text-xs font-medium text-red-700">
                Out of stock
              </div>
            ) : (
              <div className="mt-1 text-xs text-green-600">
                {p.stock} in stock
              </div>
            )}
            <div className="mt-3 text-sm font-semibold text-green-700">
              {formatINR(Number(p.price))}
            </div>
          </Link>
        ))}
        {products && products.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-green-200 bg-white p-4 text-sm text-green-600">
            No products match your filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}