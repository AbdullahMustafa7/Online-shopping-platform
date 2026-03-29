"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatINR } from "@/lib/currency";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function InnerCheckoutForm({
  initialAddress,
  amount,
}: {
  initialAddress: string;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [deliveryAddress, setDeliveryAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatted = useMemo(() => {
    return formatINR(amount / 100);
  }, [amount]);

  async function onPay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!stripe || !elements) return;
    if (!deliveryAddress.trim()) {
      setError("Delivery address is required.");
      return;
    }
    setLoading(true);
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) throw submitError;

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

      if (confirmError) throw confirmError;
      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        throw new Error("Payment did not complete.");
      }

      const res = await fetch("/api/orders/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deliveryAddress }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Could not create order.");

      router.push(`/orders/${json.orderId}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onPay} className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-medium text-zinc-900">Delivery address</div>
        <input
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Street, City"
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-zinc-900">Payment</div>
          {formatted ? (
            <div className="text-sm font-semibold text-zinc-900">{formatted}</div>
          ) : null}
        </div>
        <div className="mt-3">
          <PaymentElement />
        </div>
      </div>

      <button
        disabled={loading || !stripe}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Processing..." : "Pay & place order"}
      </button>
    </form>
  );
}

export function CheckoutClient({ initialAddress }: { initialAddress: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function createIntent() {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (!alive) return;
      if (!res.ok) {
        setError(json?.error ?? "Could not start checkout.");
        return;
      }
      setClientSecret(json.clientSecret);
      setAmount(json.amount);
    }
    void createIntent();
    return () => {
      alive = false;
    };
  }, []);

  if (!clientSecret || amount == null) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
        {error ? <div className="text-red-700">{error}</div> : "Preparing checkout..."}
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <InnerCheckoutForm initialAddress={initialAddress} amount={amount} />
    </Elements>
  );
}

