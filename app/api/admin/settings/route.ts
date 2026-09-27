import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { siteSettingsSchema } from "@/lib/validation/admin";
import { isRazorpayConfigured } from "@/lib/payments/razorpay";

export async function GET() {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  const settings = await prisma.siteSetting.findFirst();
  return NextResponse.json({ settings, razorpayConfigured: isRazorpayConfigured() });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Never let the storefront start accepting "payment" when the gateway
  // credentials aren't even set — that would fail every checkout with a
  // 500 the moment a customer tries to pay (TRD §5/§13 — unverified
  // integration, no sandbox credentials available at build time).
  if (parsed.data.paymentGatewayEnabled && !isRazorpayConfigured()) {
    return NextResponse.json(
      {
        error:
          "Razorpay isn't configured yet (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are missing). Add real credentials before enabling online payment.",
      },
      { status: 409 },
    );
  }

  const existing = await prisma.siteSetting.findFirst();
  const settings = existing
    ? await prisma.siteSetting.update({
        where: { id: existing.id },
        data: { paymentGatewayEnabled: parsed.data.paymentGatewayEnabled },
      })
    : await prisma.siteSetting.create({
        data: { paymentGatewayEnabled: parsed.data.paymentGatewayEnabled },
      });

  return NextResponse.json({ settings });
}
