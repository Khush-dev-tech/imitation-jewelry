import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wholesaleLeadSchema } from "@/lib/validation/wholesale";

/**
 * Wholesale lead submission (PRD §8.9). Public — no auth. The lead is
 * written synchronously here, before the client attempts the WhatsApp
 * handoff, so the lead is durable even if the buyer closes WhatsApp
 * without sending the pre-filled message (Backend Schema §12).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = wholesaleLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const lead = await prisma.wholesaleLead.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      city: parsed.data.city,
      businessName: parsed.data.businessName,
      quantityRequirement: parsed.data.quantityRequirement,
      productInterest: parsed.data.productInterest,
      preferredContactTime: parsed.data.preferredContactTime || null,
    },
  });

  return NextResponse.json({ leadId: lead.id }, { status: 201 });
}
