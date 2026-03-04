import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUserId } from "@/lib/profile";
import { CartClient, type CartItemView } from "./CartClient";

export default async function CartPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/cart");

  const supabase = await supabaseServer();

  const { data: cartRows, error: cartError } = await supabase
    .from("cart")
    .select("id,product_id,quantity")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (cartError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {cartError.message}
      </div>
    );
  }

  const productIds = (cartRows ?? []).map((r) => r.product_id);
  const { data: products } =
    productIds.length === 0
      ? { data: [] as any[] }
      : await supabase
          .from("products")
          .select("id,name,price,vendor_id")
          .in("id", productIds);

  const byId = new Map<string, any>((products ?? []).map((p) => [p.id, p]));

  const items: CartItemView[] = (cartRows ?? [])
    .map((r) => {
      const p = byId.get(r.product_id);
      if (!p) return null;
      return {
        cart_id: r.id as string,
        product_id: r.product_id as string,
        name: p.name as string,
        price: Number(p.price),
        quantity: Number(r.quantity ?? 0),
        vendor_id: String(p.vendor_id),
      };
    })
    .filter(Boolean) as CartItemView[];

  return <CartClient initialItems={items} />;
}

