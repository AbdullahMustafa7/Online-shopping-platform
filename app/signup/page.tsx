"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import type { UserRole } from "@/lib/types";
import { Button, Card, ErrorText, Input, Label, Select } from "../components/ui";

function roleHomePath(role: UserRole) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "vendor") return "/vendor/dashboard";
  if (role === "agent") return "/agent/dashboard";
  return "/";
}

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>("customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          name: name || null,
          phone: phone || null,
          address: address || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Could not create account.");

      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!login || login.error) throw new Error(login?.error || "Login failed.");
      router.push(roleHomePath(role));
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
        title="Create your account"
        description="Choose a role and start using FreshCart."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? <ErrorText>{error}</ErrorText> : null}
          {success ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <label className="block">
            <Label>Role</Label>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="agent">Delivery Agent</option>
            </Select>
          </label>

          <label className="block">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>

          <label className="block">
            <Label>Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 123 4567"
              autoComplete="tel"
            />
          </label>

          <label className="block">
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City"
              autoComplete="street-address"
            />
          </label>

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
              placeholder="At least 6 characters"
              autoComplete="new-password"
              minLength={6}
            />
          </label>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Sign up"}
          </Button>

          <p className="text-sm text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-zinc-900">
              Log in
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

