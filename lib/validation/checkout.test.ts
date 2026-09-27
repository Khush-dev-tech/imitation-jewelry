import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./checkout";

const validItem = {
  productId: "11111111-1111-4111-8111-111111111111",
  variantId: null,
  quantity: 1,
};

const validInput = {
  contactName: "Priya Sharma",
  contactPhone: "9876543210",
  contactEmail: "priya@example.com",
  deliveryLine1: "12 Green Park Colony",
  deliveryCity: "Rajkot",
  deliveryState: "Gujarat",
  deliveryPincode: "360001",
  deliveryCountry: "India",
  items: [validItem],
};

describe("checkoutSchema", () => {
  it("accepts a fully valid submission", () => {
    expect(checkoutSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects an empty cart (App Flow: checkout requires a non-empty cart)", () => {
    const result = checkoutSchema.safeParse({ ...validInput, items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects a missing required field (name)", () => {
    const result = checkoutSchema.safeParse({ ...validInput, contactName: "" });
    expect(result.success).toBe(false);
  });

  it("allows contactEmail to be omitted (optional per PRD §8.6)", () => {
    const { contactEmail, ...withoutEmail } = validInput;
    void contactEmail;
    expect(checkoutSchema.safeParse(withoutEmail).success).toBe(true);
  });

  it("rejects an invalid email when one is provided", () => {
    const result = checkoutSchema.safeParse({ ...validInput, contactEmail: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid productId (never trusts client-shaped ids blindly)", () => {
    const result = checkoutSchema.safeParse({
      ...validInput,
      items: [{ ...validItem, productId: "not-a-uuid" }],
    });
    expect(result.success).toBe(false);
  });
});
