"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export type CartItemView = {
  cart_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  vendor_id: string;
};

export function CartClient({ initialItems }: { initialItems: CartItemView[] }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItemView[]>(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  async function setQuantity(cartId: string, nextQty: number) {
    setError(null);
    setBusyId(cartId);
    try {
      const supabase = supabaseBrowser();
      if (nextQty <= 0) {
        const { error } = await supabase.from("cart").delete().eq("id", cartId);
        if (error) throw error;
        setItems((cur) => cur.filter((i) => i.cart_id !== cartId));
      } else {
        const { error } = await supabase
          .from("cart")
          .update({ quantity: nextQty })
          .eq("id", cartId);
        if (error) throw error;
        setItems((cur) =>
          cur.map((i) => (i.cart_id === cartId ? { ...i, quantity: nextQty } : i)),
        );
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Could not update cart.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Update quantities and proceed to checkout.
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center justify-center min-h-[44px] rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Continue shopping
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          Your cart is empty.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            {items.map((i) => (
              <div
                key={i.cart_id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-zinc-900">
                      {i.name}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">
                      ${i.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setQuantity(i.cart_id, i.quantity - 1)}
                      disabled={busyId === i.cart_id}
                      className="flex h-11 w-11 items-center justify-center rounded-md border border-zinc-300 bg-white text-sm hover:bg-zinc-50 disabled:opacity-60"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {i.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(i.cart_id, i.quantity + 1)}
                      disabled={busyId === i.cart_id}
                      className="flex h-11 w-11 items-center justify-center rounded-md border border-zinc-300 bg-white text-sm hover:bg-zinc-50 disabled:opacity-60"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setQuantity(i.cart_id, 0)}
                      disabled={busyId === i.cart_id}
                      className="ml-2 flex min-h-[44px] items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-right text-sm text-zinc-700">
                  Line total:{" "}
                  <span className="font-semibold text-zinc-900">
                    ${(i.price * i.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="h-fit rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-zinc-900">Summary</div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-zinc-600">Total</span>
              <span className="font-semibold text-zinc-900">
                ${total.toFixed(2)}
              </span>
            </div>
            <Link
              href="/checkout"
              className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

