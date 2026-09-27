import { formatINR } from "./utils";

/**
 * WhatsApp deep-link builder — the single source of truth for every
 * `wa.me` message on the site. Every template here is copied verbatim
 * from docs/02-trd.md §6 (client-confirmed). Do not reword these
 * templates anywhere else in the codebase; import from here instead.
 */

const WHATSAPP_NUMBER = "918849999457"; // App Brief — confirmed business number

function buildWaLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** General enquiry — floating WhatsApp button, no product/wholesale context. */
export function buildGeneralEnquiryLink(): string {
  const message = "Hello Maruti Imitation Jewelry, I would like to know more about your jewellery.";
  return buildWaLink(message);
}

export interface ProductEnquiryDetails {
  name: string;
  sku: string | null;
  price: number | string;
}

/**
 * Product enquiry — per-product "Enquire on WhatsApp" button.
 * The "Product Code" line is omitted entirely when sku is null, per
 * docs/05-backend-schema.md §4.7's documented fallback (never send a
 * literal empty value).
 */
export function buildProductEnquiryLink(product: ProductEnquiryDetails): string {
  const lines = [
    "Hello Maruti Imitation Jewelry, I am interested in:",
    "",
    `Product: ${product.name}`,
  ];

  if (product.sku) {
    lines.push(`Product Code: ${product.sku}`);
  }

  lines.push(
    `Price: ${formatINR(product.price)}`,
    "",
    "Please share availability and delivery details.",
  );

  return buildWaLink(lines.join("\n"));
}

export interface WholesaleEnquiryDetails {
  name: string;
  city: string;
  businessName: string;
  productInterest: string;
  quantityRequirement: string;
  preferredContactTime?: string | null;
}

/**
 * Wholesale enquiry — Wholesale form's WhatsApp handoff. Phone is
 * deliberately not included in the message body (TRD §6 — WhatsApp
 * already identifies the sender's number to the business).
 * "Preferred contact time" is omitted entirely when left blank, matching
 * the optional field defined in docs/05-backend-schema.md §4.16.
 */
export function buildWholesaleEnquiryLink(details: WholesaleEnquiryDetails): string {
  const lines = [
    "Hello Maruti Imitation Jewelry, I am interested in a wholesale / bulk order.",
    "",
    `Name: ${details.name}`,
    `City: ${details.city}`,
    `Business name: ${details.businessName}`,
    `Products required: ${details.productInterest}`,
    `Approximate quantity: ${details.quantityRequirement}`,
  ];

  if (details.preferredContactTime) {
    lines.push(`Preferred contact time: ${details.preferredContactTime}`);
  }

  return buildWaLink(lines.join("\n"));
}
