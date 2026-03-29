import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Vendor } from "@/lib/models/Vendor";
import { DeliveryAgent } from "@/lib/models/DeliveryAgent";

export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const role = String(body.role || "customer");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const existing = await User.findOne({ email }).lean();
  if (existing) return NextResponse.json({ error: "Email already exists." }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashed,
    role,
    name: body.name || null,
    phone: body.phone || null,
    address: body.address || null,
  });

  if (role === "vendor") {
    await Vendor.create({
      userId: user._id,
      shopName: body.name ? `${body.name}'s Shop` : "My Shop",
      shopAddress: body.address || null,
      approved: false,
    });
  }

  if (role === "agent") {
    await DeliveryAgent.create({
      userId: user._id,
      available: true,
      totalDeliveries: 0,
      earnings: 0,
    });
  }

  return NextResponse.json({ ok: true });
}

