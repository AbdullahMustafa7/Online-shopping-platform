import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { connectDB } from "./mongodb";
import { User } from "./models/User";

export async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function getMyProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  await connectDB();
  const user: any = await User.findById(session.user.id).lean();
  if (!user) return null;
  return {
    id: String(user._id),
    email: user.email ?? null,
    name: user.name ?? null,
    phone: user.phone ?? null,
    role: user.role ?? "customer",
    address: user.address ?? null,
    created_at: user.createdAt ? new Date(user.createdAt).toISOString() : null,
  };
}

