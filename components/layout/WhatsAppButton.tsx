"use client";

import { usePathname } from "next/navigation";
import { buildGeneralEnquiryLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

/**
 * Floating WhatsApp button — UI/UX Brief §8, §11. Present on public pages
 * generally. Per the flagged conflict in UI/UX Brief §14 (item 1), it is
 * deliberately suppressed on Product Detail pages (`/product/[slug]`),
 * where WhatsApp access instead lives inside the sticky mobile action bar
 * (built in the Product Pages phase) — this avoids stacking two fixed
 * bottom-of-screen elements on one 360px screen.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  const isProductDetailPage = pathname?.startsWith("/product/");

  if (isProductDetailPage) {
    return null;
  }

  return (
    <a
      href={buildGeneralEnquiryLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-none transition-colors hover:bg-whatsapp-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
