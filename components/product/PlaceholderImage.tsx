import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shown wherever a product or category has no photo yet — the business
 * hasn't supplied catalogue photography (App Brief constraint: never use
 * jewellery images without commercial permission, so no stock photos are
 * substituted here). Deliberately reads as "no photo yet," not as a
 * broken image or a real (if generic) product shot.
 */
export function PlaceholderImage({
  label,
  className,
}: {
  /** Pass `null` to omit the caption entirely — e.g. when the surrounding
   * card already overlays its own text and a second caption would collide
   * with it (CollectionCard). */
  label?: string | null;
  className?: string;
}) {
  const caption = label === null ? null : (label ?? "Photo coming soon");
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 border border-dashed border-hairline bg-beige text-charcoal-muted",
        className,
      )}
    >
      <Gem aria-hidden="true" className="h-8 w-8 opacity-40" />
      {caption ? <span className="px-2 text-center font-body text-xs">{caption}</span> : null}
    </div>
  );
}
