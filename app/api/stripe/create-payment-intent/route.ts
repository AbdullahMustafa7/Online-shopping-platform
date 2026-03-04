import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { stripe } from "@/lib/stripe";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: cartRows, error: cartError } = await supabase
    .from("cart")
    .select("product_id,quantity")
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
    .select("id,price,vendor_id")
    .in("id", productIds);

  if (prodError) {
    return NextResponse.json({ error: prodError.message }, { status: 400 });
  }

  const byId = new Map<string, any>((products ?? []).map((p) => [p.id, p]));

  const vendorIds = new Set<string>();
  let total = 0;
  for (const row of cartRows ?? []) {
    const p = byId.get(row.product_id);
    if (!p) continue;
    vendorIds.add(String(p.vendor_id));
    total += Number(p.price) * Number(row.quantity ?? 0);
  }

  if (vendorIds.size > 1) {
    return NextResponse.json(
      {
        error:
          "Your cart contains items from multiple vendors. Please check out one vendor at a time.",
      },
      { status: 400 },
    );
  }

  const amount = Math.max(0, Math.round(total * 100)); // cents
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { user_id: user.id },
  });

  return NextResponse.json({
    clientSecret: intent.client_secret,
    amount,
    currency: "usd",
  });
}

