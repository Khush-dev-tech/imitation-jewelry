import { describe, expect, it } from "vitest";
import { wholesaleLeadSchema } from "./wholesale";

const validInput = {
  name: "Rohan Mehta",
  phone: "9822233344",
  city: "Ahmedabad",
  businessName: "Mehta Fashion Jewellers",
  quantityRequirement: "200 pieces, mixed designs",
  productInterest: "Necklace sets and earrings",
  preferredContactTime: "Weekday mornings",
};

describe("wholesaleLeadSchema", () => {
  it("accepts a fully valid submission", () => {
    expect(wholesaleLeadSchema.safeParse(validInput).success).toBe(true);
  });

  it("allows preferredContactTime to be omitted (the only optional field, PRD §8.9)", () => {
    const { preferredContactTime, ...required } = validInput;
    void preferredContactTime;
    expect(wholesaleLeadSchema.safeParse(required).success).toBe(true);
  });

  for (const field of [
    "name",
    "phone",
    "city",
    "businessName",
    "quantityRequirement",
    "productInterest",
  ] as const) {
    it(`rejects a missing required field: ${field}`, () => {
      const result = wholesaleLeadSchema.safeParse({ ...validInput, [field]: "" });
      expect(result.success).toBe(false);
    });
  }
});
