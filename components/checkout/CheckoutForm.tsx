"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { formatINR } from "@/lib/utils";
import { openRazorpayCheckout } from "@/lib/payments/razorpay-checkout";

interface FormState {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  deliveryLine1: string;
  deliveryLine2: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  deliveryCountry: string;
}

const INITIAL_FORM: FormState = {
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  deliveryLine1: "",
  deliveryLine2: "",
  deliveryCity: "",
  deliveryState: "",
  deliveryPincode: "",
  deliveryCountry: "India",
};

interface UnavailableItem {
  productId: string;
  variantId: string | null;
  reason: string;
}

/**
 * Checkout form — App Flow Screen 7 / PRD §8.6. Guest checkout only in
 * this phase (account login/registration, PRD §8.11, is not yet built).
 * "Non-payment" checkout: when the payment gateway is disabled
 * (site_settings.payment_gateway_enabled = false, the default), the order
 * is placed as Pending Confirmation rather than processing payment.
 */
export function CheckoutForm({ paymentEnabled }: { paymentEnabled: boolean }) {
  const router = useRouter();
  const mounted = useHasMounted();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const clear = useCartStore((state) => state.clear);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [unavailableLines, setUnavailableLines] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  // Placing an order clears the cart, which would otherwise immediately
  // re-trigger the empty-cart guard below and redirect to /cart instead
  // of the order-confirmation page — this flag suppresses that race.
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (mounted && items.length === 0 && !orderPlaced) {
      router.replace("/cart");
    }
  }, [mounted, items.length, orderPlaced, router]);

  function updateField(field: keyof FormState) {
    return (event: ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function goToConfirmation(orderId: string) {
    setOrderPlaced(true);
    clear();
    router.push(`/order-confirmation/${orderId}`);
  }

  async function verifyPayment(
    orderId: string,
    response: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    setStatusMessage("Confirming your payment...");
    try {
      const verifyResponse = await fetch(`/api/orders/${orderId}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }),
      });
      if (!verifyResponse.ok) {
        setStatusMessage(null);
        setError(
          "We couldn't confirm your payment automatically. If you were charged, contact us on WhatsApp with your order details — otherwise your cart is intact and you can try again.",
        );
        return;
      }
      goToConfirmation(orderId);
    } catch {
      setStatusMessage(null);
      setError(
        "We couldn't confirm your payment automatically. If you were charged, contact us on WhatsApp with your order details — otherwise your cart is intact and you can try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setUnavailableLines(null);
    setStatusMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && Array.isArray(data.unavailable)) {
          const lines = (data.unavailable as UnavailableItem[]).map((problem) => {
            const item = items.find(
              (i) => i.productId === problem.productId && i.variantId === problem.variantId,
            );
            const label = item
              ? `${item.productName}${item.variantLabel ? ` (${item.variantLabel})` : ""}`
              : "An item in your cart";
            return `${label} — ${problem.reason}. Please remove it from your cart and try again.`;
          });
          setUnavailableLines(lines);
        }
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (!data.razorpay) {
        // Payment disabled — same non-payment flow as before.
        goToConfirmation(data.orderId);
        return;
      }

      // Payment enabled: the order now exists as "pending_confirmation" /
      // "pending" payment, and the cart is deliberately NOT cleared yet —
      // it only clears once payment is actually verified (App Flow's
      // PaymentFail/PaymentCancel both require "cart intact").
      setStatusMessage("Opening payment...");
      await openRazorpayCheckout({
        key: data.razorpay.keyId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        order_id: data.razorpay.orderId,
        name: "Maruti Imitation Jewelry",
        description: `Order ${data.orderNumber}`,
        prefill: {
          name: form.contactName,
          contact: form.contactPhone,
          email: form.contactEmail || undefined,
        },
        theme: { color: "#6E1423" },
        handler: (checkoutResponse) => {
          void verifyPayment(data.orderId, checkoutResponse);
        },
        modal: {
          ondismiss: () => {
            setStatusMessage(null);
            setLoading(false);
            setError("Payment was cancelled. Your cart has been kept — you can try again.");
          },
        },
      }).then((instance) => {
        instance.on("payment.failed", (failure) => {
          setStatusMessage(null);
          setLoading(false);
          setError(
            failure.error?.description
              ? `Payment failed: ${failure.error.description}. Your cart has been kept.`
              : "Payment failed. Your cart has been kept — you can try again.",
          );
        });
      });
      return;
    } catch {
      setError(
        "Network error — please check your connection and try again. Your cart has been kept.",
      );
    } finally {
      // Runs right after the Razorpay modal *opens* too (not when it
      // closes) — harmless, since the modal itself blocks the page
      // underneath; the dismiss/failed/success callbacks above set their
      // own final loading state once the modal actually resolves.
      setLoading(false);
    }
  }

  if (!mounted || items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="font-heading text-lg text-charcoal">Contact Details</h2>
        <Input
          label="Full Name"
          required
          value={form.contactName}
          onChange={updateField("contactName")}
        />
        <Input
          label="Phone Number"
          type="tel"
          required
          value={form.contactPhone}
          onChange={updateField("contactPhone")}
        />
        <Input
          label="Email (optional)"
          type="email"
          value={form.contactEmail}
          onChange={updateField("contactEmail")}
        />

        <h2 className="mt-4 font-heading text-lg text-charcoal">Delivery Address</h2>
        <Input
          label="Address Line 1"
          required
          value={form.deliveryLine1}
          onChange={updateField("deliveryLine1")}
        />
        <Input
          label="Address Line 2 (optional)"
          value={form.deliveryLine2}
          onChange={updateField("deliveryLine2")}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            required
            value={form.deliveryCity}
            onChange={updateField("deliveryCity")}
          />
          <Input
            label="State"
            required
            value={form.deliveryState}
            onChange={updateField("deliveryState")}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="PIN Code"
            required
            value={form.deliveryPincode}
            onChange={updateField("deliveryPincode")}
          />
          <Input
            label="Country"
            required
            value={form.deliveryCountry}
            onChange={updateField("deliveryCountry")}
          />
        </div>

        {!paymentEnabled ? (
          <p className="rounded-md border border-hairline bg-beige p-4 font-body text-sm text-charcoal">
            Online payment isn&apos;t live yet. Your order will be placed as{" "}
            <strong>Pending Confirmation</strong> — our team will reach out on WhatsApp or phone to
            confirm details and arrange payment/delivery.
          </p>
        ) : null}

        {statusMessage ? (
          <p aria-live="polite" className="font-body text-sm text-charcoal-muted">
            {statusMessage}
          </p>
        ) : null}

        {error ? (
          <div role="alert" className="flex flex-col gap-1 font-body text-sm text-error">
            <p className="flex items-center gap-1">
              <span aria-hidden="true">⚠</span> {error}
            </p>
            {unavailableLines ? (
              <ul className="ml-5 list-disc">
                {unavailableLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={Boolean(statusMessage)}
          className="w-full"
        >
          {paymentEnabled ? "Pay Now" : "Place Order"}
        </Button>
      </form>

      <div className="flex h-fit flex-col gap-3 rounded-md border border-hairline bg-beige p-6">
        <h2 className="font-heading text-lg text-charcoal">Order Summary</h2>
        <div className="flex flex-col divide-y divide-hairline">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex justify-between gap-3 py-2 first:pt-0 font-body text-sm"
            >
              <span className="text-charcoal">
                {item.productName}
                {item.variantLabel ? ` (${item.variantLabel})` : ""} × {item.quantity}
              </span>
              <span className="shrink-0 text-charcoal">
                {formatINR(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-hairline pt-3 font-body text-sm font-semibold text-charcoal">
          <span>Total</span>
          <span>{formatINR(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
