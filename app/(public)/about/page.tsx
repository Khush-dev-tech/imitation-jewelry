import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "About Maruti Imitation Jewelry, a Rajkot-based manufacturer of imitation and micro gold-plated jewellery.",
};

/**
 * About Us — App Flow Screen 9 / App Brief. Flagged as an open item: the
 * PRD lists this page but its detailed content/story isn't specified
 * beyond the App Brief's confirmed facts (business type, specialty,
 * location, audience). No founding story, years of experience, or
 * craftsmanship narrative is invented here — that content needs to come
 * from the business.
 */
export default function AboutPage() {
  return (
    <Container className="flex max-w-2xl flex-col gap-6 py-12">
      <h1 className="font-heading text-3xl text-charcoal">About Maruti Imitation Jewelry</h1>

      <p className="font-body text-charcoal-muted">
        Maruti Imitation Jewelry is a Rajkot-based manufacturer of imitation jewellery, specializing
        in micro gold-plated pieces. We serve retail customers shopping for daily wear, gifting,
        weddings, festivals, and special occasions, as well as boutique owners, resellers, and
        jewellery retailers looking for wholesale and bulk-order pricing.
      </p>

      <div className="rounded-md border border-hairline bg-beige p-4 font-body text-sm text-charcoal-muted">
        Our full story — how we started, our craftsmanship, and what makes our pieces different — is
        coming soon.
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/shop">
          <Button variant="primary">Shop Collection</Button>
        </Link>
        <Link href="/wholesale">
          <Button variant="secondary">Wholesale Enquiry</Button>
        </Link>
        <Link href="/contact">
          <Button variant="tertiary">Contact Us</Button>
        </Link>
      </div>
    </Container>
  );
}
