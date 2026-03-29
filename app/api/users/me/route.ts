import { NextResponse } from "next/server";
import { requireSession } from "@/lib/apiAuth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function GET() {
  await connectDB();
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await User.findById(session.user.id).lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    address: user.address,
  });
}

