import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyProfile, getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";
import { CheckoutClient } from "./CheckoutClient";

export default async function CheckoutPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/checkout");

  const profile = await getMyProfile();
  const supabase = await supabaseServer();

  const { data: cartRows } = await supabase
    .from("cart")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (!cartRows || cartRows.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          Your cart is empty.
        </div>
        <Link
          href="/products"
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Secure payment powered by Stripe.
        </p>
      </div>
      <CheckoutClient initialAddress={profile?.address ?? ""} />
    </div>
  );
}

