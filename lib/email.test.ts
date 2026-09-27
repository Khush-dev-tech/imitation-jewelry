import { describe, expect, it } from "vitest";
import { buildOrderConfirmationEmail, isEmailConfigured } from "./email";

describe("isEmailConfigured", () => {
  it("is false when the API key or from-address is missing", () => {
    delete process.env.EMAIL_API_KEY;
    delete process.env.EMAIL_FROM_ADDRESS;
    expect(isEmailConfigured()).toBe(false);
  });
});

describe("buildOrderConfirmationEmail", () => {
  const baseData = {
    orderNumber: "MIJ-20260920-TEST01",
    contactName: "Priya Sharma",
    contactEmail: "priya@example.com",
    total: "5499",
    items: [{ name: "Antique Kundan Choker Set (Antique Gold)", quantity: 1, lineTotal: "5499" }],
    deliveryAddress: "12 Green Park Colony\nRajkot, Gujarat 360001\nIndia",
  };

  it("includes the order number in the subject", () => {
    const { subject } = buildOrderConfirmationEmail({
      ...baseData,
      status: "pending_confirmation",
    });
    expect(subject).toBe("Order Confirmation — MIJ-20260920-TEST01");
  });

  it("explains pending-confirmation status without claiming payment was received", () => {
    const { text } = buildOrderConfirmationEmail({ ...baseData, status: "pending_confirmation" });
    expect(text).toContain("your order isn't paid yet");
    expect(text).not.toContain("Payment received");
  });

  it("confirms payment received for the paid status, not the pending message", () => {
    const { text } = buildOrderConfirmationEmail({ ...baseData, status: "paid" });
    expect(text).toContain("Payment received");
    expect(text).not.toContain("your order isn't paid yet");
  });

  it("includes every line item and the total", () => {
    const { text } = buildOrderConfirmationEmail({
      ...baseData,
      status: "paid",
      items: [
        { name: "Necklace Set", quantity: 2, lineTotal: "10998" },
        { name: "Earrings", quantity: 1, lineTotal: "899" },
      ],
      total: "11897",
    });
    expect(text).toContain("Necklace Set x2 — ₹10,998");
    expect(text).toContain("Earrings x1 — ₹899");
    expect(text).toContain("Total: ₹11,897");
  });
});
