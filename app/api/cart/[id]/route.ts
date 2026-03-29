import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/lib/models/Cart";
import { requireSession } from "@/lib/apiAuth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const quantity = Number(body.quantity);
  if (quantity <= 0) {
    await Cart.deleteOne({ _id: id, userId: session.user.id });
    return NextResponse.json({ ok: true });
  }
  const row = await Cart.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { quantity },
    { new: true },
  ).lean();
  return NextResponse.json(row);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await Cart.deleteOne({ _id: id, userId: session.user.id });
  return NextResponse.json({ ok: true });
}

