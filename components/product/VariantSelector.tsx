"use client";

import { cn } from "@/lib/utils";

export interface VariantOption {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  priceOverride: number | null;
  stockStatus: "in_stock" | "out_of_stock" | null;
}

/**
 * Variant selector — Backend Schema §4.9: variants carry freeform
 * `attributes` (colour/size/set vary per product, no fixed taxonomy), so
 * each variant renders as a single selectable chip summarising its own
 * attributes, rather than per-attribute-type dropdowns that would assume
 * a taxonomy the schema deliberately doesn't impose.
 */
export function variantLabel(attributes: Record<string, string>): string {
  return Object.values(attributes).join(" / ") || "Option";
}

export function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: {
  variants: VariantOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (variants.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-sm font-medium text-charcoal">Select option</span>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select a variant">
        {variants.map((variant) => {
          const outOfStock = variant.stockStatus === "out_of_stock";
          const selected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={
                outOfStock
                  ? `${variantLabel(variant.attributes)} — out of stock`
                  : variantLabel(variant.attributes)
              }
              onClick={() => onSelect(variant.id)}
              className={cn(
                "rounded-md border px-4 py-2 font-body text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal",
                selected
                  ? "border-maroon bg-maroon/5 text-maroon"
                  : "border-hairline text-charcoal hover:border-charcoal",
                outOfStock ? "opacity-50" : undefined,
              )}
            >
              {variantLabel(variant.attributes)}
              {outOfStock ? " (Out of Stock)" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
