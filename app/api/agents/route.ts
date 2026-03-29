import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { DeliveryAgent } from "@/lib/models/DeliveryAgent";
import { requireSession, isRole } from "@/lib/apiAuth";

export async function GET() {
  await connectDB();
  const agents = await DeliveryAgent.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(agents);
}

export async function PUT(request: Request) {
  await connectDB();
  const session = await requireSession();
  if (!session || !isRole(session.user.role, ["admin", "agent"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const id = body.id;
  const updates = body.updates || {};
  const agent = await DeliveryAgent.findByIdAndUpdate(id, updates, { new: true }).lean();
  return NextResponse.json(agent);
}

