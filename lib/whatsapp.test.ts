import { describe, expect, it } from "vitest";
import {
  buildGeneralEnquiryLink,
  buildProductEnquiryLink,
  buildWholesaleEnquiryLink,
} from "./whatsapp";

/**
 * These templates are client-confirmed verbatim (TRD §6 — "no ad hoc
 * rewording during implementation"). Locking them in as tests means any
 * future edit to lib/whatsapp.ts that drifts from the approved wording
 * fails loudly instead of silently shipping.
 */
describe("buildGeneralEnquiryLink", () => {
  it("matches the exact client-confirmed URL", () => {
    expect(buildGeneralEnquiryLink()).toBe(
      "https://wa.me/918849999457?text=Hello%20Maruti%20Imitation%20Jewelry%2C%20I%20would%20like%20to%20know%20more%20about%20your%20jewellery.",
    );
  });
});

describe("buildProductEnquiryLink", () => {
  it("includes product name, SKU, and price per the confirmed template", () => {
    const url = buildProductEnquiryLink({
      name: "Antique Kundan Choker Set",
      sku: "AKC-001",
      price: 5499,
    });
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toBe(
      "Hello Maruti Imitation Jewelry, I am interested in:\n\n" +
        "Product: Antique Kundan Choker Set\n" +
        "Product Code: AKC-001\n" +
        "Price: ₹5,499\n\n" +
        "Please share availability and delivery details.",
    );
  });

  it("omits the Product Code line entirely when sku is null (never sends a literal empty value)", () => {
    const url = buildProductEnquiryLink({
      name: "Simple Gold Hoop Earrings",
      sku: null,
      price: 899,
    });
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).not.toContain("Product Code");
    expect(text).toBe(
      "Hello Maruti Imitation Jewelry, I am interested in:\n\n" +
        "Product: Simple Gold Hoop Earrings\n" +
        "Price: ₹899\n\n" +
        "Please share availability and delivery details.",
    );
  });
});

describe("buildWholesaleEnquiryLink", () => {
  it("matches the confirmed template", () => {
    const url = buildWholesaleEnquiryLink({
      name: "Rohan Mehta",
      city: "Ahmedabad",
      businessName: "Mehta Fashion Jewellers",
      productInterest: "Necklace sets and earrings",
      quantityRequirement: "200 pieces, mixed designs",
      preferredContactTime: "Weekday mornings",
    });
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toBe(
      "Hello Maruti Imitation Jewelry, I am interested in a wholesale / bulk order.\n\n" +
        "Name: Rohan Mehta\n" +
        "City: Ahmedabad\n" +
        "Business name: Mehta Fashion Jewellers\n" +
        "Products required: Necklace sets and earrings\n" +
        "Approximate quantity: 200 pieces, mixed designs\n" +
        "Preferred contact time: Weekday mornings",
    );
  });

  it("omits the Preferred contact time line entirely when left blank", () => {
    const url = buildWholesaleEnquiryLink({
      name: "Rohan Mehta",
      city: "Ahmedabad",
      businessName: "Mehta Fashion Jewellers",
      productInterest: "Necklace sets",
      quantityRequirement: "100 pieces",
      preferredContactTime: null,
    });
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).not.toContain("Preferred contact time");
  });
});
