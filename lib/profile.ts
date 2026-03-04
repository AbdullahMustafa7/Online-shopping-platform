import { supabaseServer } from "./supabase/server";
import type { UserProfile, UserRole } from "./types";

export async function getSessionUserId() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export async function getMyProfile(): Promise<UserProfile | null> {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id,email,name,phone,role,address,created_at")
    .eq("email", userData.user?.email)
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data as UserProfile;
}

export function roleHomePath(role: UserRole) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "vendor") return "/vendor/dashboard";
  if (role === "agent") return "/agent/dashboard";
  return "/";
}

