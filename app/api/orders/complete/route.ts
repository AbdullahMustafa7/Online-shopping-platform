import { NextResponse } from "next/server";
import { requireSession } from "@/lib/apiAuth";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/lib/models/Cart";
import { Product } from "@/lib/models/Product";
import { Order } from "@/lib/models/Order";
import { OrderItem } from "@/lib/models/OrderItem";

type Body = { deliveryAddress: string };

export async function POST(request: Request) {
  await connectDB();
  const body = (await request.json().catch(() => null)) as Body | null;
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deliveryAddress = (body?.deliveryAddress ?? "").trim();
  if (!deliveryAddress) {
    return NextResponse.json(
      { error: "Delivery address is required." },
      { status: 400 },
    );
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
  const orderItems: Array<{ productId: string; quantity: number; price: number }> = [];

  for (const row of cartRows) {
    const p = byId.get(String(row.productId));
    if (!p) continue;
    const qty = Number(row.quantity || 0);
    if (qty <= 0) continue;
    if (Number(p.stock || 0) < qty) {
      return NextResponse.json(
        { error: `Insufficient stock for product ${p._id}.` },
        { status: 400 },
      );
    }
    vendorIds.add(String(p.vendorId));
    total += Number(p.price) * qty;
    orderItems.push({ productId: String(p._id), quantity: qty, price: Number(p.price) });
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
  const order = await Order.create({
    customerId: session.user.id,
    vendorId,
    status: "pending",
    total,
    deliveryAddress,
  });
  await OrderItem.insertMany(
    orderItems.map((i) => ({
      orderId: order._id,
      productId: i.productId,
      quantity: i.quantity,
      price: i.price,
    })),
  );

  // Clear cart
  await Cart.deleteMany({ userId: session.user.id });

  return NextResponse.json({ orderId: String(order._id) });
}

