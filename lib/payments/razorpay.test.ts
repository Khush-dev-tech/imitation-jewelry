import crypto from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { verifyPaymentSignature, verifyWebhookSignature, isRazorpayConfigured } from "./razorpay";

/**
 * These verify the actual cryptographic logic without needing a live
 * Razorpay account — the same self-signed-payload approach used to
 * manually verify this module during Phase 6, now permanent.
 */
beforeEach(() => {
  process.env.RAZORPAY_KEY_SECRET = "test_local_only_key_secret";
  process.env.RAZORPAY_WEBHOOK_SECRET = "test_local_only_webhook_secret";
});

describe("isRazorpayConfigured", () => {
  it("is false when key id/secret are missing", () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    expect(isRazorpayConfigured()).toBe(false);
  });

  it("is true when both are set", () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_123";
    process.env.RAZORPAY_KEY_SECRET = "secret";
    expect(isRazorpayConfigured()).toBe(true);
  });
});

describe("verifyPaymentSignature", () => {
  it("accepts a correctly signed order_id|payment_id pair", () => {
    const razorpayOrderId = "order_test456";
    const razorpayPaymentId = "pay_test123";
    const razorpaySignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    expect(verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })).toBe(
      true,
    );
  });

  it("rejects a signature computed for a different payment id", () => {
    const razorpayOrderId = "order_test456";
    const razorpaySignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|pay_original`)
      .digest("hex");

    expect(
      verifyPaymentSignature({
        razorpayOrderId,
        razorpayPaymentId: "pay_swapped",
        razorpaySignature,
      }),
    ).toBe(false);
  });

  it("returns false (not throws) when the key secret is missing", () => {
    delete process.env.RAZORPAY_KEY_SECRET;
    expect(
      verifyPaymentSignature({
        razorpayOrderId: "order_test456",
        razorpayPaymentId: "pay_test123",
        razorpaySignature: "anything",
      }),
    ).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  const payload = JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity: { id: "pay_test123", order_id: "order_test456" } } },
  });

  it("accepts a correctly signed raw body", () => {
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");
    expect(verifyWebhookSignature(payload, signature)).toBe(true);
  });

  it("rejects a tampered payload even with the original signature", () => {
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");
    const tampered = payload.replace("payment.captured", "payment.failed ");
    expect(verifyWebhookSignature(tampered, signature)).toBe(false);
  });

  it("rejects a null signature header", () => {
    expect(verifyWebhookSignature(payload, null)).toBe(false);
  });

  it("does not throw on a garbage signature of mismatched length", () => {
    expect(verifyWebhookSignature(payload, "not-a-real-signature")).toBe(false);
  });
});
