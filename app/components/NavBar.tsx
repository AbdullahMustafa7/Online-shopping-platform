"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!session?.user?.id) {
        if (!alive) return;
        setEmail(null);
        setRole(null);
        return;
      }
      const res = await fetch("/api/users/me");
      const profile = await res.json().catch(() => null);
      if (!alive) return;
      setEmail(session.user.email ?? null);
      setRole((profile?.role as UserRole | undefined) ?? "customer");
    }

    void load();

    return () => {
      alive = false;
    };
  }, [session?.user?.id, session?.user?.email]);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <header className="border-b border-green-200 bg-white/95 backdrop-blur">
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
                onClick={handleSignOut}
                className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
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
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
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

