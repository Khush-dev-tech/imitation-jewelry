import { Resend } from "resend";
import { formatINR } from "./utils";

/**
 * Transactional email — Resend (TRD §4, §5's assumption; not gated the
 * way payment-gateway choice was, so this is built now rather than held
 * for confirmation — see docs/02-trd.md line ~175). Satisfies PRD §8.7's
 * "customer should still receive an email confirmation as a fallback"
 * requirement, independent of whether the customer's browser ever
 * renders the order-confirmation page.
 *
 * NOT yet verified against a live Resend account — no API key was
 * available at build time. `isEmailConfigured()` gates every send;
 * `sendOrderConfirmationEmail` never throws on failure (a broken email
 * provider must never break checkout — TRD §7 "no unnecessary coupling
 * to external services").
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.EMAIL_API_KEY && process.env.EMAIL_FROM_ADDRESS);
}

export interface OrderConfirmationEmailData {
  orderNumber: string;
  contactName: string;
  contactEmail: string;
  status: "pending_confirmation" | "paid";
  total: string;
  items: { name: string; quantity: number; lineTotal: string }[];
  deliveryAddress: string;
}

/** Pure content builder — testable without a network call or API key. */
export function buildOrderConfirmationEmail(data: OrderConfirmationEmailData): {
  subject: string;
  text: string;
} {
  const statusLine =
    data.status === "paid"
      ? "Payment received — thank you! We'll start preparing your order."
      : "We've received your order. Our team will reach out on WhatsApp or phone shortly to confirm details and arrange payment/delivery — your order isn't paid yet.";

  const itemLines = data.items
    .map((item) => `  ${item.name} x${item.quantity} — ${formatINR(item.lineTotal)}`)
    .join("\n");

  const text = [
    `Hi ${data.contactName},`,
    "",
    `Thank you for your order with Maruti Imitation Jewelry.`,
    "",
    `Order number: ${data.orderNumber}`,
    `Status: ${data.status === "paid" ? "Paid" : "Pending Confirmation"}`,
    "",
    statusLine,
    "",
    "Order summary:",
    itemLines,
    "",
    `Total: ${formatINR(data.total)}`,
    "",
    "Delivery address:",
    data.deliveryAddress,
    "",
    "Questions? Reply to this email or message us on WhatsApp at +91 88499 99457.",
  ].join("\n");

  return { subject: `Order Confirmation — ${data.orderNumber}`, text };
}

/**
 * Sends the order confirmation email. No-ops (logs a warning) when Resend
 * isn't configured or the order has no contact email — both are expected,
 * routine states (guest checkout's email field is optional), not errors.
 */
export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<void> {
  if (!data.contactEmail) return;

  if (!isEmailConfigured()) {
    console.warn(
      `[email] Skipped order confirmation for ${data.orderNumber} — EMAIL_API_KEY/EMAIL_FROM_ADDRESS not configured.`,
    );
    return;
  }

  const { subject, text } = buildOrderConfirmationEmail(data);

  try {
    const resend = new Resend(process.env.EMAIL_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS!,
      to: data.contactEmail,
      subject,
      text,
    });
  } catch (error) {
    // A broken email provider must never break checkout or payment
    // confirmation — the order itself is already durably saved.
    console.error(`[email] Failed to send order confirmation for ${data.orderNumber}:`, error);
  }
}
