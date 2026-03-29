import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { formatINR } from "@/lib/currency";
import { AddToCartButton } from "./AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const product: any = await Product.findById(id).lean();
  if (!product) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/products" className="text-sm font-medium text-zinc-700">
          ← Back to products
        </Link>
        <Link
          href="/cart"
          className="flex items-center justify-center min-h-[44px] rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          View cart
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div className="aspect-square rounded-2xl border border-zinc-200 bg-zinc-50" />
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {product.name}
            </h1>
            <div className="mt-2 text-2xl font-semibold text-zinc-900">
              {formatINR(Number(product.price))}
            </div>
            <div className="mt-2 text-sm text-zinc-600">
              {product.stock === 0
                ? "Out of stock"
                : `${product.stock} in stock`}
            </div>
          </div>

          {product.description ? (
            <p className="text-sm leading-6 text-zinc-700">
              {product.description}
            </p>
          ) : (
            <p className="text-sm text-zinc-500">No description.</p>
          )}

          <AddToCartButton productId={String(product._id)} disabled={product.stock === 0} />

          <div className="text-xs text-zinc-500">
            Product ID: {String(product._id)}
          </div>
        </div>
      </div>
    </div>
  );
}

