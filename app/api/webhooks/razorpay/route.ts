import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

/**
 * Razorpay webhook — server-to-server confirmation, independent of
 * whether the customer's browser ever returns to the checkout success
 * handler (closed tab, network drop after paying). This is the
 * reliability backstop behind `/api/orders/[id]/verify-payment`'s
 * client-triggered path; both write the same idempotent state, so
 * whichever arrives first wins and the other is a no-op.
 *
 * Configure this URL (`/api/webhooks/razorpay`) in the Razorpay dashboard
 * once a real account exists, with events at least: payment.captured,
 * payment.failed. RAZORPAY_WEBHOOK_SECRET must match the secret set
 * there — this is a *separate* secret from the webhook signing key,
 * not the API key secret (TRD §7).
 *
 * Must read the raw body (not `request.json()`) — HMAC verification
 * breaks if the JSON is re-serialized before checking the signature.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const entity = event?.payload?.payment?.entity;

  if (!entity?.order_id) {
    // Signature is valid but this isn't an event shape we act on —
    // acknowledge it anyway so Razorpay doesn't keep retrying.
    return NextResponse.json({ received: true });
  }

  const attempt = await prisma.paymentAttempt.findFirst({
    where: { gatewayOrderId: entity.order_id },
  });
  if (!attempt) {
    return NextResponse.json({ received: true });
  }

  if (event.event === "payment.captured" && attempt.status !== "success") {
    await prisma.$transaction([
      prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "success",
          gatewayTransactionId: entity.id,
          webhookSignatureVerified: true,
        },
      }),
      prisma.order.update({
        where: { id: attempt.orderId },
        data: { status: "paid", paymentStatus: "paid" },
      }),
    ]);

    const order = await prisma.order.findUnique({
      where: { id: attempt.orderId },
      include: { items: true },
    });
    if (order) {
      await sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        contactName: order.contactName,
        contactEmail: order.contactEmail ?? "",
        status: "paid",
        total: order.total.toString(),
        items: order.items.map((item) => ({
          name: item.productNameSnapshot,
          quantity: item.quantity,
          lineTotal: item.lineTotal.toString(),
        })),
        deliveryAddress: [
          order.deliveryLine1,
          order.deliveryLine2,
          `${order.deliveryCity}, ${order.deliveryState} ${order.deliveryPincode}`,
          order.deliveryCountry,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    }
  } else if (event.event === "payment.failed" && attempt.status !== "success") {
    await prisma.$transaction([
      prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "failed",
          failureReason: entity.error_description ?? "Payment failed",
          webhookSignatureVerified: true,
        },
      }),
      prisma.order.update({
        where: { id: attempt.orderId },
        data: { paymentStatus: "failed" },
      }),
    ]);
  }

  return NextResponse.json({ received: true });
}
