import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ProductCard, type ProductCardData } from "./ProductCard";

/**
 * Product grid — UI/UX Brief §4: 2 columns mobile, 3 tablet, 4 desktop.
 * Empty state is a clear message with a next action, never a blank page
 * (PRD §8.2 acceptance criteria).
 */
export function ProductGrid({
  products,
  emptyMessage = "No products found.",
  showClearFilters = false,
}: {
  products: ProductCardData[];
  emptyMessage?: string;
  showClearFilters?: boolean;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="font-body text-charcoal-muted">{emptyMessage}</p>
        {showClearFilters ? (
          <Link href="?">
            <Button variant="secondary">Clear filters</Button>
          </Link>
        ) : (
          <Link href="/shop">
            <Button variant="secondary">Browse all jewellery</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
