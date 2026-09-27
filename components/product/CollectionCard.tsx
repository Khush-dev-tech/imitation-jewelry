import Link from "next/link";
import Image from "next/image";
import { PlaceholderImage } from "./PlaceholderImage";

/** Collection/category card — UI/UX Brief §5.5. */
export function CollectionCard({
  name,
  slug,
  imageUrl,
}: {
  name: string;
  slug: string;
  imageUrl: string | null;
}) {
  return (
    <Link
      href={`/category/${slug}`}
      className="group flex flex-col overflow-hidden rounded-md border border-hairline bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-beige">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <PlaceholderImage label={null} className="absolute inset-0 h-full w-full" />
        )}
      </div>
      <span className="px-3 py-3 text-center font-heading text-base text-charcoal sm:text-lg">
        {name}
      </span>
    </Link>
  );
}
