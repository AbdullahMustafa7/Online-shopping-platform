"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import type { UserRole } from "@/lib/types";
import { Button, Card, ErrorText, Input, Label } from "../components/ui";

function roleHomePath(role: UserRole) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "vendor") return "/vendor/dashboard";
  if (role === "agent") return "/agent/dashboard";
  return "/";
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next"), [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!result || result.error) throw new Error(result?.error || "Login failed.");

      const meRes = await fetch("/api/users/me");
      const me = await meRes.json().catch(() => null);
      const role = (me?.role as UserRole) ?? "customer";
      router.push(next || roleHomePath(role));
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70dvh] items-center justify-center">
      <Card
        title="Welcome back"
        description="Log in to shop, manage orders, or deliver."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? <ErrorText>{error}</ErrorText> : null}

          <label className="block">
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <Label>Password</Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Log in"}
          </Button>

          <p className="text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-zinc-900">
              Sign up
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70dvh] items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

