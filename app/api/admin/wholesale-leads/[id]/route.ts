import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { wholesaleLeadStatusSchema } from "@/lib/validation/admin";

/** Admin: mark a wholesale lead as contacted/closed — App Flow Screen 22. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = wholesaleLeadStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.wholesaleLead.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  const lead = await prisma.$transaction(async (tx) => {
    const updated = await tx.wholesaleLead.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    await tx.auditLog.create({
      data: {
        adminUserId: auth.admin.id,
        action: "wholesale_lead.status_change",
        entityType: "wholesale_lead",
        entityId: id,
        metadata: { from: existing.status, to: parsed.data.status },
      },
    });
    return updated;
  });

  return NextResponse.json({ lead });
}
