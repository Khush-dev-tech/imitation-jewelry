import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton — UI/UX Brief §5.10. Matches the shape of the content it
 * replaces via className (e.g. h-48 for an image block, h-4 w-3/4 for a
 * text line). The shimmer respects prefers-reduced-motion globally (see
 * app/globals.css), collapsing to a static placeholder automatically.
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-beige", className)}
      {...props}
    />
  );
}
