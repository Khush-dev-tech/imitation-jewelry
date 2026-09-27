import { describe, expect, it } from "vitest";
import { formatINR } from "./utils";

describe("formatINR", () => {
  it("formats a number with Indian digit grouping and no decimals", () => {
    expect(formatINR(124999)).toBe("₹1,24,999");
  });

  it("accepts a numeric string (Prisma Decimal serializes as a string)", () => {
    expect(formatINR("5499")).toBe("₹5,499");
  });

  it("formats small amounts correctly", () => {
    expect(formatINR(499)).toBe("₹499");
  });

  it("rounds to whole rupees (maximumFractionDigits: 0)", () => {
    expect(formatINR(499.5)).toBe("₹500");
  });
});
