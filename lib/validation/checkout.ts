import { z } from "zod";

/**
 * Checkout submission (PRD §8.6) — guest checkout only in this phase;
 * account login/registration (PRD §8.11) is not yet built (flagged as a
 * still-open item, not silently dropped).
 */
export const checkoutSchema = z.object({
  contactName: z.string().trim().min(1, "Name is required"),
  contactPhone: z.string().trim().min(6, "Enter a valid phone number"),
  contactEmail: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  deliveryLine1: z.string().trim().min(1, "Address line 1 is required"),
  deliveryLine2: z.string().trim().optional().or(z.literal("")),
  deliveryCity: z.string().trim().min(1, "City is required"),
  deliveryState: z.string().trim().min(1, "State is required"),
  deliveryPincode: z.string().trim().min(4, "Enter a valid PIN code"),
  deliveryCountry: z.string().trim().min(1).default("India"),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().nullable(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
