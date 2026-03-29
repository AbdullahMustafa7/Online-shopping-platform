import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Vendor } from "@/lib/models/Vendor";
import { requireSession, isRole } from "@/lib/apiAuth";

export async function GET() {
  await connectDB();
  const vendors = await Vendor.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(vendors);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await requireSession();
  if (!session || !isRole(session.user.role, ["vendor", "admin"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const vendor = await Vendor.create({
    userId: body.userId || session.user.id,
    shopName: body.shopName,
    shopAddress: body.shopAddress || null,
    approved: !!body.approved,
  });
  return NextResponse.json(vendor, { status: 201 });
}

