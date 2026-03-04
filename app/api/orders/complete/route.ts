import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type Body = { deliveryAddress: string };

function supabaseFromRequest(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // No-op for API routes.
        },
      },
    },
  );
}

export async function POST(request: NextRequest) {
  const supabase = supabaseFromRequest(request);
  const body = (await request.json().catch(() => null)) as Body | null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deliveryAddress = (body?.deliveryAddress ?? "").trim();
  if (!deliveryAddress) {
    return NextResponse.json(
      { error: "Delivery address is required." },
      { status: 400 },
    );
  }

  const { data: cartRows, error: cartError } = await supabase
    .from("cart")
    .select("id,product_id,quantity")
    .eq("user_id", user.id);

  if (cartError) {
    return NextResponse.json({ error: cartError.message }, { status: 400 });
  }

  const productIds = (cartRows ?? []).map((r) => r.product_id);
  if (productIds.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id,price,vendor_id,stock")
    .in("id", productIds);

  if (prodError) {
    return NextResponse.json({ error: prodError.message }, { status: 400 });
  }

  const byId = new Map<string, any>((products ?? []).map((p) => [p.id, p]));

  const vendorIds = new Set<string>();
  let total = 0;
  const orderItems: Array<{ product_id: string; quantity: number; price: number }> =
    [];

  for (const row of cartRows ?? []) {
    const p = byId.get(row.product_id);
    if (!p) continue;
    const qty = Number(row.quantity ?? 0);
    if (qty <= 0) continue;
    if (Number(p.stock ?? 0) < qty) {
      return NextResponse.json(
        { error: `Insufficient stock for product ${p.id}.` },
        { status: 400 },
      );
    }
    vendorIds.add(String(p.vendor_id));
    total += Number(p.price) * qty;
    orderItems.push({ product_id: String(p.id), quantity: qty, price: Number(p.price) });
  }

  if (vendorIds.size !== 1) {
    return NextResponse.json(
      {
        error:
          "Your cart contains items from multiple vendors. Please check out one vendor at a time.",
      },
      { status: 400 },
    );
  }

  const vendorId = Array.from(vendorIds)[0];

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      vendor_id: vendorId,
      status: "pending",
      total,
      delivery_address: deliveryAddress,
    })
    .select("id")
    .limit(1)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "Failed to create order." }, { status: 400 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItems.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity,
      price: i.price,
    })),
  );
  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 400 });
  }

  // Clear cart
  const cartIds = (cartRows ?? []).map((r) => r.id);
  if (cartIds.length) {
    await supabase.from("cart").delete().in("id", cartIds);
  }

  return NextResponse.json({ orderId: order.id });
}

