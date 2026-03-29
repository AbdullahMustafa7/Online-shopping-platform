import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession, isRole } from "@/lib/apiAuth";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { Vendor } from "@/lib/models/Vendor";
import { Product } from "@/lib/models/Product";

export async function GET() {
  await connectDB();
  const session = await requireSession();
  if (!session || !isRole(session.user.role, ["admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [orders, users, vendors, products] = await Promise.all([
    Order.find({}).lean(),
    User.find({}).lean(),
    Vendor.find({}).lean(),
    Product.find({}).lean(),
  ]);

  const revenue = orders.reduce((sum, o: any) => sum + Number(o.total || 0), 0);
  const pendingVendors = vendors.filter((v: any) => !v.approved).length;

  return NextResponse.json({
    totalOrders: orders.length,
    totalUsers: users.length,
    totalProducts: products.length,
    revenue,
    pendingVendors,
  });
}

