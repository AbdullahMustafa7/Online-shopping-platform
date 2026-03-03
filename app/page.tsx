import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default function Home() {
  // Server component: safe to fetch categories/products directly.
  return (
    <HomePage />
  );
}

async function HomePage() {
  const supabase = await supabaseServer();
  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,image_url")
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: featured } = await supabase
    .from("products")
    .select("id,name,price,image_url")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Fresh groceries, fast delivery
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
              Shop fresh. Delivered to your door.
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-600">
              Browse categories, find great products, add to cart, and check out
              securely with Stripe.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/products"
              className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Browse products
            </Link>
            <Link
              href="/cart"
              className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              View cart
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Categories</h2>
          <Link href="/products" className="text-sm font-medium text-zinc-700">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${encodeURIComponent(String(c.id))}`}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-300"
            >
              <div className="text-sm font-medium text-zinc-900">{c.name}</div>
              <div className="mt-1 text-xs text-zinc-500">Explore</div>
            </Link>
          ))}
          {(!categories || categories.length === 0) && (
            <div className="col-span-full rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              No categories yet. Add some in Supabase to populate the homepage.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Featured products
          </h2>
          <Link href="/products" className="text-sm font-medium text-zinc-700">
            Shop all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {(featured ?? []).map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-300"
            >
              <div className="text-sm font-medium text-zinc-900">{p.name}</div>
              <div className="mt-2 text-sm font-semibold text-zinc-900">
                ${Number(p.price).toFixed(2)}
              </div>
            </Link>
          ))}
          {(!featured || featured.length === 0) && (
            <div className="col-span-full rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              No products yet. Add some in Supabase to populate featured items.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
