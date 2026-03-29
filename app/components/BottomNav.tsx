"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type UserRole = "customer" | "vendor" | "agent" | "admin";

function roleHome(role: UserRole) {
    if (role === "admin") return "/admin/dashboard";
    if (role === "vendor") return "/vendor/dashboard";
    if (role === "agent") return "/agent/dashboard";
    return "/";
}

export function BottomNav() {
    const pathname = usePathname();
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

    const isAuthPage = pathname === "/login" || pathname === "/signup";
    if (isAuthPage) return null;

    return (
        <nav className="fixed bottom-0 left-0 z-50 w-full bg-white border-t border-zinc-200 sm:hidden pb-safe">
            <div className="flex h-16 items-center justify-around px-2">
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 hover:bg-zinc-50 ${pathname === "/" ? "text-green-600" : "text-zinc-500"
                        }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-[10px] font-medium">Home</span>
                </Link>
                <Link
                    href="/products"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 hover:bg-zinc-50 ${pathname === "/products" ? "text-green-600" : "text-zinc-500"
                        }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="text-[10px] font-medium">Shop</span>
                </Link>
                <Link
                    href="/cart"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 hover:bg-zinc-50 ${pathname === "/cart" ? "text-green-600" : "text-zinc-500"
                        }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-[10px] font-medium">Cart</span>
                </Link>

                {email && (
                    <Link
                        href="/orders"
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 hover:bg-zinc-50 ${pathname === "/orders" ? "text-green-600" : "text-zinc-500"
                            }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="text-[10px] font-medium">Orders</span>
                    </Link>
                )}

                {role && role !== "customer" && (
                    <Link
                        href={roleHome(role)}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 hover:bg-zinc-50 ${pathname.startsWith(`/${role}`) ? "text-green-600" : "text-zinc-500"
                            }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[10px] font-medium">Panel</span>
                    </Link>
                )}
            </div>
        </nav>
    );
}
