import { z } from "zod";

/** Wholesale enquiry form — PRD §8.9, Backend Schema §4.16. */
export const wholesaleLeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  city: z.string().trim().min(1, "City is required"),
  businessName: z.string().trim().min(1, "Business name is required"),
  quantityRequirement: z.string().trim().min(1, "Let us know roughly how much you need"),
  productInterest: z.string().trim().min(1, "Let us know which products you're interested in"),
  preferredContactTime: z.string().trim().optional().or(z.literal("")),
});

export type WholesaleLeadInput = z.infer<typeof wholesaleLeadSchema>;
