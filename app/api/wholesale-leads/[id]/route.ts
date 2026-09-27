import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public, narrow-purpose endpoint: marks that the buyer's browser
 * attempted the WhatsApp handoff after submitting the form. Best-effort
 * only — Backend Schema §4.16 is explicit that lead durability never
 * depends on this being true, so this never blocks or fails the form
 * flow if it doesn't succeed. Deliberately can't set anything else.
 */
export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.wholesaleLead.update({
      where: { id },
      data: { whatsappDeepLinkOpened: true },
    });
  } catch {
    // Best-effort — an invalid id here shouldn't surface as an error to
    // the buyer, who has already successfully submitted their lead.
  }
  return NextResponse.json({ ok: true });
}
