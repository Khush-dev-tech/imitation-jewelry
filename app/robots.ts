import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/**
 * robots.txt — PRD §6 "SEO-friendly pages and metadata". Admin and API
 * routes are never indexable; checkout/cart/order-confirmation are
 * personal/transactional (no SEO value, and order-confirmation URLs are
 * bearer-credential links per Backend Schema §4.13 — never something a
 * crawler should discover or list).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/cart", "/checkout", "/order-confirmation"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
