import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session;
}

export function isRole(role: string | undefined, allowed: string[]) {
  return !!role && allowed.includes(role);
}

