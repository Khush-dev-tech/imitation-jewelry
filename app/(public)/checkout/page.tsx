import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Checkout" };

// Payment-enabled toggle must be read live (TRD §5/§11 — no stale value cached at build time).
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const siteSettings = await prisma.siteSetting.findFirst();
  const paymentEnabled = siteSettings?.paymentGatewayEnabled ?? false;

  return (
    <Container className="py-8">
      <h1 className="mb-6 font-heading text-2xl text-charcoal">Checkout</h1>
      <CheckoutForm paymentEnabled={paymentEnabled} />
    </Container>
  );
}
