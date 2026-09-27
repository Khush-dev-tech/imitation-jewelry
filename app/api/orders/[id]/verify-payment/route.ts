import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

/**
 * Called by the client immediately after Razorpay's Checkout.js reports a
 * successful payment. The signature is unforgeable without the key
 * secret, so a valid signature is authoritative on its own — this is the
 * fast path that lets the customer see confirmation immediately, without
 * waiting on the webhook (Backend Schema §10's "never trust an unverified
 * callback" rule is satisfied by verifying *this* signature, not by
 * skipping verification). The webhook (`/api/webhooks/razorpay`) is a
 * reliability backstop for the case where the customer's browser never
 * returns here (closed tab, network drop after paying).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { paymentAttempts: true, items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const attempt = order.paymentAttempts.find(
    (a) => a.gatewayOrderId === parsed.data.razorpayOrderId,
  );
  if (!attempt) {
    return NextResponse.json(
      { error: "No matching payment attempt for this order." },
      {
        status: 404,
      },
    );
  }

  // Already confirmed (e.g. the webhook processed it first) — idempotent.
  if (attempt.status === "success") {
    return NextResponse.json({ verified: true });
  }

  const valid = verifyPaymentSignature({
    razorpayOrderId: parsed.data.razorpayOrderId,
    razorpayPaymentId: parsed.data.razorpayPaymentId,
    razorpaySignature: parsed.data.razorpaySignature,
  });

  if (!valid) {
    await prisma.paymentAttempt.update({
      where: { id: attempt.id },
      data: { status: "failed", failureReason: "Signature verification failed" },
    });
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.paymentAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "success",
        gatewayTransactionId: parsed.data.razorpayPaymentId,
        webhookSignatureVerified: false, // this path verifies the *checkout* signature, not a webhook
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "paid", paymentStatus: "paid" },
    }),
  ]);

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

  return NextResponse.json({ verified: true });
}
