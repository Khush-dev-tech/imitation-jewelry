import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Badge — UI/UX Brief §5.6. Small, outlined (never solid-filled), never
 * gold text on a light badge. "outOfStock" is text-based, never colour
 * alone, per §10 accessibility requirement.
 */
const VARIANT_CLASSES = {
  new: "border-gold text-charcoal",
  bestSeller: "border-gold text-charcoal",
  sale: "border-maroon text-maroon",
  outOfStock: "border-charcoal-muted text-charcoal-muted",
} as const;

export type BadgeVariant = keyof typeof VARIANT_CLASSES;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

const LABELS: Record<BadgeVariant, string> = {
  new: "New",
  bestSeller: "Best Seller",
  sale: "Sale",
  outOfStock: "Out of Stock",
};

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 font-body text-xs font-semibold uppercase tracking-wide",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children ?? LABELS[variant]}
    </span>
  );
}
