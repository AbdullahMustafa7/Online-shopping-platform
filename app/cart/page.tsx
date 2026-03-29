import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/lib/models/Cart";
import { Product } from "@/lib/models/Product";
import { CartClient, type CartItemView } from "./CartClient";

export default async function CartPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/cart");

  await connectDB();
  const cartRows: any[] = await Cart.find({ userId }).sort({ createdAt: -1 }).lean();
  const productIds = cartRows.map((r) => r.productId);
  const products: any[] = productIds.length
    ? await Product.find({ _id: { $in: productIds } }).lean()
    : [];
  const byId = new Map<string, any>(products.map((p) => [String(p._id), p]));

  const items: CartItemView[] = cartRows
    .map((r) => {
      const p = byId.get(String(r.productId));
      if (!p) return null;
      return {
        cart_id: String(r._id),
        product_id: String(r.productId),
        name: p.name as string,
        price: Number(p.price),
        quantity: Number(r.quantity || 0),
        vendor_id: String(p.vendorId),
      };
    })
    .filter(Boolean) as CartItemView[];

  return <CartClient initialItems={items} />;
}

