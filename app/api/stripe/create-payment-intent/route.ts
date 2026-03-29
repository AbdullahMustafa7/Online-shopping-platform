import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireSession } from "@/lib/apiAuth";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/lib/models/Cart";
import { Product } from "@/lib/models/Product";

export async function POST() {
  await connectDB();
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cartRows: any[] = await Cart.find({ userId: session.user.id }).lean();
  const productIds = cartRows.map((r) => r.productId);
  if (productIds.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const products: any[] = await Product.find({ _id: { $in: productIds } }).lean();
  const byId = new Map<string, any>(products.map((p) => [String(p._id), p]));

  const vendorIds = new Set<string>();
  let total = 0;
  for (const row of cartRows) {
    const p = byId.get(String(row.productId));
    if (!p) continue;
    vendorIds.add(String(p.vendorId));
    total += Number(p.price) * Number(row.quantity || 0);
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
    metadata: { user_id: session.user.id },
  });

  return NextResponse.json({
    clientSecret: intent.client_secret,
    amount,
    currency: "usd",
  });
}

