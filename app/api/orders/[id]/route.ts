import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession, isRole } from "@/lib/apiAuth";
import { Order } from "@/lib/models/Order";
import { OrderItem } from "@/lib/models/OrderItem";
import { Vendor } from "@/lib/models/Vendor";
import { DeliveryAgent } from "@/lib/models/DeliveryAgent";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const order: any = await Order.findById(id).lean();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role === "customer" && String(order.customerId) !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const items = await OrderItem.find({ orderId: id }).lean();
  return NextResponse.json({ ...order, items });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (isRole(session.user.role, ["vendor"])) {
    const vendor = await Vendor.findOne({ userId: session.user.id }).lean();
    if (!vendor || String(order.vendorId) !== String(vendor._id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  if (isRole(session.user.role, ["agent"])) {
    const agent = await DeliveryAgent.findOne({ userId: session.user.id }).lean();
    if (!agent) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!order.agentId) order.agentId = agent._id as any;
    if (String(order.agentId) !== String(agent._id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  if (!isRole(session.user.role, ["vendor", "agent", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  order.status = body.status ?? order.status;
  await order.save();
  return NextResponse.json(order);
}

