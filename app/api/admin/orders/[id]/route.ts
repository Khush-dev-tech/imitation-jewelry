import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { orderStatusSchema } from "@/lib/validation/admin";

/** Admin: update an order's status — App Flow Screen 21, PRD §8.13. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    // Audit log (Backend Schema §4.18 — admin accountability for
    // status-changing actions; recommended, not a confirmed requirement,
    // but this is a natural first real use of it).
    await tx.auditLog.create({
      data: {
        adminUserId: auth.admin.id,
        action: "order.status_change",
        entityType: "order",
        entityId: id,
        metadata: { from: existing.status, to: parsed.data.status },
      },
    });
    return updated;
  });

  return NextResponse.json({ order });
}
