import Link from "next/link";
import Image from "next/image";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { PlaceholderImage } from "./PlaceholderImage";
import { formatINR } from "@/lib/utils";

export interface ProductCardData {
  slug: string;
  name: string;
  price: string | number;
  compareAtPrice: string | number | null;
  stockStatus: "in_stock" | "out_of_stock";
  isNewArrival: boolean;
  isBestSeller: boolean;
  images: { url: string; altText: string }[];
}

/**
 * Product card — UI/UX Brief §5.4. Badges only render when true (never a
 * fabricated "Sale" or "New" label); out-of-stock is a text badge on the
 * card itself, never colour/dimming alone (§10 accessibility rule).
 */
export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];
  const isOutOfStock = product.stockStatus === "out_of_stock";
  const isOnSale =
    product.compareAtPrice != null && Number(product.compareAtPrice) > Number(product.price);

  let badge: BadgeVariant | null = null;
  if (isOutOfStock) badge = "outOfStock";
  else if (isOnSale) badge = "sale";
  else if (product.isBestSeller) badge = "bestSeller";
  else if (product.isNewArrival) badge = "new";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
    >
      <div className="relative aspect-square overflow-hidden rounded-md border border-hairline bg-ivory">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <PlaceholderImage className="h-full w-full" />
        )}
        {badge ? (
          <span className="absolute left-2 top-2">
            <Badge variant={badge} />
          </span>
        ) : null}
      </div>
      <div>
        <p className="font-body text-sm font-medium text-charcoal">{product.name}</p>
        <p className="mt-0.5 flex items-baseline gap-2">
          <span className="font-body text-base font-semibold text-maroon">
            {formatINR(product.price)}
          </span>
          {isOnSale ? (
            <span className="font-body text-sm text-charcoal-muted line-through">
              {formatINR(product.compareAtPrice!)}
            </span>
          ) : null}
        </p>
      </div>
    </Link>
  );
}
