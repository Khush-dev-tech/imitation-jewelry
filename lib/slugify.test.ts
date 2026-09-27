import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Necklace Sets")).toBe("necklace-sets");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugify("Bangles & Bracelets!!")).toBe("bangles-bracelets");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  -Temple Jewellery-  ")).toBe("temple-jewellery");
  });
});
