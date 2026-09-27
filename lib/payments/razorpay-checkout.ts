/**
 * Client-side loader for Razorpay's Checkout.js — the hosted payment
 * modal (TRD §5, §7: card/UPI/etc. details never touch the app itself).
 * Minimal typing for just the surface this project uses; see
 * https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
 * NOT yet run against a live Razorpay account (no sandbox credentials —
 * see lib/payments/razorpay.ts).
 */

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; contact?: string; email?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayCheckoutInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: { error: { description: string } }) => void,
  ) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckoutInstance;
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let loadPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the payment provider."));
    document.body.appendChild(script);
  });

  return loadPromise;
}

export async function openRazorpayCheckout(
  options: RazorpayOptions,
): Promise<RazorpayCheckoutInstance> {
  await loadScript();
  if (!window.Razorpay) {
    throw new Error("Payment provider failed to load.");
  }
  const instance = new window.Razorpay(options);
  instance.open();
  return instance;
}
