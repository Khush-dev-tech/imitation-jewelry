import crypto from "node:crypto";
import Razorpay from "razorpay";

/**
 * Razorpay integration (TRD §5, recommended and client-confirmed for
 * this phase). NOT yet verified against a live Razorpay account — no
 * sandbox credentials were available at build time (RAZORPAY_KEY_ID/
 * RAZORPAY_KEY_SECRET/RAZORPAY_WEBHOOK_SECRET are blank in .env.example).
 * Every function here fails loudly and clearly when credentials are
 * missing rather than silently pretending to work — see
 * `isRazorpayConfigured`. Once real sandbox keys are added, this module
 * needs an actual test-mode checkout + webhook run before it can be
 * considered verified, the same way every other phase of this project
 * has been.
 */

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function getClient(): Razorpay {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay is not configured (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET missing).");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

/**
 * Creates a Razorpay order for a checkout attempt. Amount is in paise
 * (smallest currency unit), per Razorpay's API — the caller passes rupees.
 */
export async function createRazorpayOrder(params: {
  amountInRupees: number;
  receipt: string;
}): Promise<{ id: string; amount: number; currency: string }> {
  const client = getClient();
  const order = await client.orders.create({
    amount: Math.round(params.amountInRupees * 100),
    currency: "INR",
    receipt: params.receipt,
  });
  return { id: order.id, amount: Number(order.amount), currency: order.currency };
}

/**
 * Verifies the signature Razorpay's Checkout.js returns to the client on
 * a successful payment (`razorpay_order_id|razorpay_payment_id` HMAC-SHA256
 * signed with the key secret). This is the standard, secure Razorpay
 * pattern — the signature can't be forged without the secret, so a valid
 * signature is authoritative on its own (the webhook below is a
 * reliability backstop, not the only trusted path — Backend Schema §10's
 * "never trust an unverified callback" rule is satisfied by verifying
 * *this* signature, not by skipping verification).
 */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  if (!process.env.RAZORPAY_KEY_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.razorpaySignature));
}

/**
 * Verifies the `X-Razorpay-Signature` header on an incoming webhook
 * request against the raw request body, per Razorpay's webhook docs.
 * Must be run on the raw (unparsed) body — HMAC verification breaks if
 * the JSON is re-serialized first.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !signatureHeader) return false;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    // Buffers of different length — definitely not a match.
    return false;
  }
}
