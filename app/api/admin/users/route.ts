import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession, isRole } from "@/lib/apiAuth";
import { User } from "@/lib/models/User";
import { Vendor } from "@/lib/models/Vendor";
import { DeliveryAgent } from "@/lib/models/DeliveryAgent";

export async function GET() {
  await connectDB();
  const session = await requireSession();
  if (!session || !isRole(session.user.role, ["admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await User.find({}).sort({ createdAt: -1 }).lean();
  const vendors = await Vendor.find({}).lean();
  const agents = await DeliveryAgent.find({}).lean();
  return NextResponse.json({ users, vendors, agents });
}

export async function PUT(request: Request) {
  await connectDB();
  const session = await requireSession();
  if (!session || !isRole(session.user.role, ["admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  if (body.type === "vendor") {
    const doc = await Vendor.findByIdAndUpdate(body.id, { approved: !!body.approved }, { new: true });
    return NextResponse.json(doc);
  }
  if (body.type === "agent") {
    const doc = await DeliveryAgent.findByIdAndUpdate(body.id, { available: !!body.available }, { new: true });
    return NextResponse.json(doc);
  }
  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}

