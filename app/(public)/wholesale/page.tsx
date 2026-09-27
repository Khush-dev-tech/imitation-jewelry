import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { WholesaleForm } from "@/components/wholesale/WholesaleForm";

export const metadata: Metadata = {
  title: "Wholesale / Bulk Enquiry",
  description:
    "Request bulk pricing and product availability from Maruti Imitation Jewelry, Rajkot.",
};

export default function WholesalePage() {
  return (
    <Container className="flex flex-col gap-10 py-8 lg:flex-row lg:gap-16">
      <div className="flex flex-1 flex-col gap-4">
        <h1 className="font-heading text-3xl text-charcoal">Wholesale / Bulk Enquiry</h1>
        <p className="font-body text-charcoal-muted">
          Maruti Imitation Jewelry works with boutique owners, resellers, jewellery retailers, and
          bulk buyers looking for imitation and micro gold-plated jewellery.
        </p>
        <p className="font-body text-charcoal-muted">
          Tell us what you&apos;re looking for and roughly how much you need, and our team will get
          back to you with pricing and availability — by WhatsApp, phone, or email.
        </p>
        <p className="font-body text-sm text-charcoal-muted">
          Prefer to talk directly?{" "}
          <a
            href="https://wa.me/918849999457"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-maroon hover:underline"
          >
            Message us on WhatsApp
          </a>{" "}
          or use the form below.
        </p>
      </div>

      <div className="flex-1 lg:max-w-md">
        <WholesaleForm />
      </div>
    </Container>
  );
}
