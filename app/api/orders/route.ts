import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession, isRole } from "@/lib/apiAuth";
import { Cart } from "@/lib/models/Cart";
import { Product } from "@/lib/models/Product";
import { Vendor } from "@/lib/models/Vendor";
import { Order } from "@/lib/models/Order";
import { OrderItem } from "@/lib/models/OrderItem";
import { DeliveryAgent } from "@/lib/models/DeliveryAgent";

export async function GET() {
  await connectDB();
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const query: any = {};
  if (session.user.role === "customer") query.customerId = session.user.id;
  if (session.user.role === "vendor") {
    const vendor = await Vendor.findOne({ userId: session.user.id }).lean();
    query.vendorId = vendor?._id;
  }
  if (session.user.role === "agent") {
    const agent = await DeliveryAgent.findOne({ userId: session.user.id }).lean();
    query.agentId = agent?._id;
  }

  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await requireSession();
  if (!session || !isRole(session.user.role, ["customer"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const deliveryAddress = String(body.deliveryAddress || "").trim();
  if (!deliveryAddress) return NextResponse.json({ error: "Address required" }, { status: 400 });

  const rows = await Cart.find({ userId: session.user.id }).lean();
  if (!rows.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  const products = await Product.find({ _id: { $in: rows.map((r: any) => r.productId) } }).lean();
  const byId = new Map(products.map((p: any) => [String(p._id), p]));

  const vendorIds = new Set<string>();
  let total = 0;
  const items: any[] = [];
  for (const row of rows) {
    const p: any = byId.get(String(row.productId));
    if (!p) continue;
    vendorIds.add(String(p.vendorId));
    total += Number(p.price) * Number(row.quantity);
    items.push({
      productId: p._id,
      quantity: row.quantity,
      price: p.price,
    });
  }
  if (vendorIds.size !== 1) {
    return NextResponse.json({ error: "Cart must contain one vendor only" }, { status: 400 });
  }

  const order = await Order.create({
    customerId: session.user.id,
    vendorId: Array.from(vendorIds)[0],
    status: "pending",
    total,
    deliveryAddress,
  });
  await OrderItem.insertMany(items.map((it) => ({ ...it, orderId: order._id })));
  await Cart.deleteMany({ userId: session.user.id });

  return NextResponse.json(order, { status: 201 });
}

