import { prisma } from "./prisma";

/**
 * Human-readable order number (Backend Schema §4.13) — distinct from the
 * internal UUID `id`, shown to the customer. Format: MIJ-YYYYMMDD-XXXXXX.
 * Retries on the (extremely unlikely) unique collision rather than trusting
 * randomness alone.
 */
export async function generateOrderNumber(): Promise<string> {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  for (let attempt = 0; attempt < 5; attempt++) {
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    const orderNumber = `MIJ-${datePart}-${randomPart}`;
    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (!existing) return orderNumber;
  }

  throw new Error("Could not generate a unique order number");
}

/** Order Confirmation (App Flow Screen 8) — customer-facing, items only. */
export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

/** Admin Order Detail — also includes the payment attempt history. */
export async function getOrderForAdmin(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, paymentAttempts: { orderBy: { createdAt: "asc" } } },
  });
}
