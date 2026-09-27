import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { buildGeneralEnquiryLink } from "@/lib/whatsapp";

/**
 * Policy pages — App Flow Screen 12. Shipping/Returns/Privacy/Terms are
 * all explicitly unconfirmed as of the approved docs (App Brief's "do not
 * claim ... free shipping, COD, delivery timelines, returns, or
 * exchanges unless confirmed by the client"). Every page here shows the
 * same honest "not yet finalized" state rather than inventing shipping
 * costs, return windows, or legal text the business hasn't reviewed.
 */
const POLICIES: Record<string, { title: string }> = {
  shipping: { title: "Shipping Policy" },
  returns: { title: "Returns Policy" },
  privacy: { title: "Privacy Policy" },
  terms: { title: "Terms of Service" },
};

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  return { title: policy?.title ?? "Policy" };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = POLICIES[slug];

  if (!policy) {
    notFound();
  }

  return (
    <Container className="flex max-w-2xl flex-col gap-4 py-12">
      <h1 className="font-heading text-3xl text-charcoal">{policy.title}</h1>
      <div className="rounded-md border border-hairline bg-beige p-4 font-body text-sm text-charcoal-muted">
        This policy is still being finalized with the business and isn&apos;t published yet. For
        questions about a specific order, please{" "}
        <a
          href={buildGeneralEnquiryLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-maroon hover:underline"
        >
          contact us on WhatsApp
        </a>
        .
      </div>
    </Container>
  );
}
