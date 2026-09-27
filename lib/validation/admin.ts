import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().optional().nullable(),
  // Accepts either a full external URL (e.g. a hosted image link) or a
  // same-origin relative path like the uploads API returns (`/uploads/...`).
  // A relative path is what next/image needs here — an absolute
  // `http://<host>/...` URL requires that exact host to be allow-listed in
  // next.config.ts's images.remotePatterns, which breaks the moment the
  // host differs (e.g. localhost in dev vs. the real domain in production).
  imageUrl: z
    .string()
    .trim()
    .refine((val) => val === "" || val.startsWith("/") || /^https?:\/\//.test(val), {
      message: "Must be a valid URL or an uploaded file path",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
});

export const productImageSchema = z.object({
  url: z.string().trim().min(1, "Image is required"),
  altText: z.string().trim().min(1, "Alt text is required for every image"),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const productVariantSchema = z.object({
  sku: z.string().trim().min(1, "Variant SKU is required"),
  // Flexible attributes (e.g. {"colour":"Antique Gold","size":"M"}) —
  // Backend Schema §4.9: no fixed attribute taxonomy.
  attributes: z.record(z.string(), z.string()).default({}),
  priceOverride: z.number().positive().optional().nullable(),
  stockStatus: z.enum(["in_stock", "out_of_stock"]).optional().nullable(),
});

// PRD §8.12 acceptance criteria: name, price, and at least one image are
// the only save-blocking required fields. SKU is optional (Backend
// Schema §4.7 — does not expand that required-field list).
export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  sku: z.string().trim().optional().nullable().or(z.literal("")),
  description: z.string().trim().optional().nullable(),
  materialDetails: z.string().trim().optional().nullable(),
  careInstructions: z.string().trim().optional().nullable(),
  price: z.number().positive("Price must be greater than 0"),
  compareAtPrice: z.number().positive().optional().nullable(),
  stockStatus: z.enum(["in_stock", "out_of_stock"]).default("in_stock"),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  metaTitle: z.string().trim().optional().nullable(),
  metaDescription: z.string().trim().optional().nullable(),
  categoryIds: z.array(z.string().uuid()).default([]),
  images: z.array(productImageSchema).min(1, "At least one product image is required"),
  variants: z.array(productVariantSchema).default([]),
});

export const productSchemaWithChecks = productSchema.refine(
  (data) => !data.compareAtPrice || data.compareAtPrice > data.price,
  {
    message: "Compare-at price must be greater than the selling price",
    path: ["compareAtPrice"],
  },
);

// Site Settings §4.17 — only the payment toggle is editable via admin UI
// in this phase; the other fields (business contact details) are seeded
// once and not yet exposed for editing here.
export const siteSettingsSchema = z.object({
  paymentGatewayEnabled: z.boolean(),
});

// Orders §4.13 — App Flow Screen 21 "Update order status". The proposed
// enum itself (not this schema) is what's flagged as unconfirmed
// vocabulary (Backend Schema §16); admin can set any of the five defined
// values here.
export const orderStatusSchema = z.object({
  status: z.enum(["pending_confirmation", "paid", "payment_failed", "cancelled", "fulfilled"]),
});

// Wholesale Leads §4.16 — App Flow Screen 22 "Mark as followed-up/contacted".
export const wholesaleLeadStatusSchema = z.object({
  status: z.enum(["new", "contacted", "closed"]),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type WholesaleLeadStatusInput = z.infer<typeof wholesaleLeadStatusSchema>;
