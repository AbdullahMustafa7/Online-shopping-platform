import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/lib/models/Cart";
import { Product } from "@/lib/models/Product";
import { requireSession } from "@/lib/apiAuth";

export async function GET() {
  await connectDB();
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await Cart.find({ userId: session.user.id }).lean();
  const productIds = rows.map((r: any) => r.productId);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const byId = new Map(products.map((p: any) => [String(p._id), p]));

  const items = rows.map((r: any) => {
    const p = byId.get(String(r.productId));
    return {
      _id: String(r._id),
      quantity: r.quantity,
      productId: String(r.productId),
      product: p
        ? {
            _id: String(p._id),
            name: p.name,
            price: p.price,
            stock: p.stock,
            vendorId: String(p.vendorId),
          }
        : null,
    };
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();

  const productId = String(body.productId);
  const quantity = Math.max(1, Number(body.quantity || 1));
  const existing = await Cart.findOne({ userId: session.user.id, productId });
  if (existing) {
    existing.quantity += quantity;
    await existing.save();
    return NextResponse.json(existing);
  }
  const row = await Cart.create({ userId: session.user.id, productId, quantity });
  return NextResponse.json(row, { status: 201 });
}

export async function DELETE(request: Request) {
  await connectDB();
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    await Cart.deleteOne({ _id: id, userId: session.user.id });
  } else {
    await Cart.deleteMany({ userId: session.user.id });
  }
  return NextResponse.json({ ok: true });
}

