import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Vendor } from "@/lib/models/Vendor";
import { requireSession, isRole } from "@/lib/apiAuth";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const min = Number(searchParams.get("min") || "");
  const max = Number(searchParams.get("max") || "");

  const filter: any = {};
  if (q) filter.name = { $regex: q, $options: "i" };
  if (category) filter.categoryId = category;
  if (!Number.isNaN(min) || !Number.isNaN(max)) {
    filter.price = {};
    if (!Number.isNaN(min)) filter.price.$gte = min;
    if (!Number.isNaN(max)) filter.price.$lte = max;
  }

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isRole(session.user.role, ["vendor", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  let vendorId = body.vendorId;
  if (session.user.role === "vendor") {
    const vendor = await Vendor.findOne({ userId: session.user.id }).lean();
    if (!vendor) return NextResponse.json({ error: "Vendor profile missing" }, { status: 400 });
    vendorId = String(vendor._id);
  }

  const product = await Product.create({
    vendorId,
    categoryId: body.categoryId,
    name: body.name,
    description: body.description || null,
    price: Number(body.price),
    stock: Number(body.stock),
    imageUrl: body.imageUrl || null,
  });
  return NextResponse.json(product, { status: 201 });
}

