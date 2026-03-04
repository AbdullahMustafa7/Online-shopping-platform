"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

type UserRole = "customer" | "vendor" | "agent" | "admin";

function roleHome(role: UserRole) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "vendor") return "/vendor/dashboard";
  if (role === "agent") return "/agent/dashboard";
  return "/";
}

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();

    let alive = true;
    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!alive) return;
      setEmail(user?.email ?? null);

      if (!user) {
        setRole(null);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!alive) return;
      setRole((profile?.role as UserRole | undefined) ?? "customer");
    }

    void load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            FreshCart
          </Link>
          {!isAuthPage && (
            <nav className="hidden items-center gap-3 text-sm text-zinc-600 sm:flex">
              <Link href="/products" className="hover:text-zinc-900">
                Products
              </Link>
              <Link href="/cart" className="hover:text-zinc-900">
                Cart
              </Link>
              {email && (
                <Link href="/orders" className="hover:text-zinc-900">
                  Orders
                </Link>
              )}
              {role && role !== "customer" && (
                <Link href={roleHome(role)} className="hover:text-zinc-900">
                  Dashboard
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {email ? (
            <>
              <span className="hidden text-sm text-zinc-600 sm:inline">
                {email}
              </span>
              <button
                onClick={signOut}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Sign out
              </button>
            </>
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Sign up
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}

