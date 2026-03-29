import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Vendor } from "@/lib/models/Vendor";
import { requireSession, isRole } from "@/lib/apiAuth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const product = await Product.findById(id).lean();
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isRole(session.user.role, ["vendor", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role === "vendor") {
    const vendor = await Vendor.findOne({ userId: session.user.id }).lean();
    if (!vendor || String(product.vendorId) !== String(vendor._id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  Object.assign(product, {
    name: body.name ?? product.name,
    description: body.description ?? product.description,
    price: body.price ?? product.price,
    stock: body.stock ?? product.stock,
    categoryId: body.categoryId ?? product.categoryId,
    imageUrl: body.imageUrl ?? product.imageUrl,
  });
  await product.save();
  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isRole(session.user.role, ["vendor", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role === "vendor") {
    const vendor = await Vendor.findOne({ userId: session.user.id }).lean();
    if (!vendor || String(product.vendorId) !== String(vendor._id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  await Product.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}

