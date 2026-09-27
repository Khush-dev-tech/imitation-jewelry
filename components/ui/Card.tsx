import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Card — base surface primitive (UI/UX Brief §5.4/§5.5): ivory/beige
 * surface, hairline border, minimal rounding, no drop shadows, no
 * glassmorphism. Product/collection-specific card composition happens on
 * top of this in the Storefront phase.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md border border-hairline bg-ivory", className)} {...props} />;
}
