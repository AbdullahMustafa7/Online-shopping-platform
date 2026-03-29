"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewVendorProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Array<{ _id: string; id: string; name: string }>>(
    [],
  );
  const [vendorId, setVendorId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      const [vRes, cRes] = await Promise.all([fetch("/api/vendors"), fetch("/api/categories")]);
      const vendors = await vRes.json().catch(() => []);
      const cats = await cRes.json().catch(() => []);
      if (!alive) return;
      setVendorId(vendors?.[0]?._id ?? null);
      setCategories(
        (cats ?? []).map((c: any) => ({ _id: String(c._id), id: String(c._id), name: c.name })) as any,
      );
      if (cats && cats[0]?._id) setCategoryId(String(cats[0]._id));
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!vendorId) {
      setError("Vendor profile not found.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
        vendorId: vendorId,
        categoryId: categoryId || null,
        name,
        description: description || null,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl || null,
      }),
      });
      if (!res.ok) throw new Error("Could not create product.");
      router.push("/vendor/products");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Could not create product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add product</h1>
          <p className="mt-1 text-sm text-zinc-600">Create a new product.</p>
        </div>
        <Link
          href="/vendor/products"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-zinc-800">Name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-800">Category</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c._id?.toString()} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-800">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            rows={4}
          />
        </label>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-zinc-800">Price</span>
            <input
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-800">Stock</span>
            <input
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              inputMode="numeric"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-zinc-800">Image URL</span>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </label>

        <button
          disabled={loading}
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Create product"}
        </button>
      </form>
    </div>
  );
}

