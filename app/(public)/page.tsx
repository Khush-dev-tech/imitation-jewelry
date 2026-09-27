import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Gem, CreditCard } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { CollectionCard } from "@/components/product/CollectionCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { prisma } from "@/lib/prisma";
import { getNewArrivals, getBestSellers } from "@/lib/products";

// Editorial reference photography (licensed Adobe Stock, free tier) used
// only for decorative/mood sections — hero and bridal banner — never for
// a specific named product listing, which would misrepresent inventory.
const HERO_IMAGE = "/uploads/products/087075f9-ba8b-4338-8732-15137e7148be.jpg";
const BRIDAL_BANNER_IMAGE = "/uploads/products/f8985e8b-5b81-4be9-881d-4952bc4bac46.jpg";

// Forced dynamic (not statically generated at build time): stock status
// and catalogue changes must be reflected immediately, per PRD §8.12's
// explicit acceptance criterion. A statically-frozen homepage would
// violate that the moment admin toggles a product's stock.
export const dynamic = "force-dynamic";

// PRD §8.1 trust content — confirmed facts only (App Brief trust
// indicators). No shipping/returns/guarantee claims, none of which are
// confirmed by the client yet (PRD §6/§9 constraint).
const TRUST_POINTS = [
  { icon: Gem, label: "Manufacturer of imitation jewellery" },
  { icon: ShieldCheck, label: "Micro gold-plated jewellery" },
  { icon: CreditCard, label: "Secure payments" },
  { icon: WhatsAppIcon, label: "Direct WhatsApp support" },
];

function serialize<T extends { price: unknown; compareAtPrice: unknown }>(products: T[]) {
  return products.map((p) => ({
    ...p,
    price: String(p.price),
    compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : null,
  })) as unknown as (T & { price: string; compareAtPrice: string | null })[];
}

export default async function HomePage() {
  const [categories, newArrivals, bestSellers] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    getNewArrivals(),
    getBestSellers(),
  ]);

  const bridalCategory = categories.find((c) => c.slug === "bridal-jewellery");

  return (
    <div className="flex flex-col gap-16 pb-16 sm:gap-24">
      {/* Hero — UI/UX Brief §7: full-bleed, single clear maroon CTA */}
      <section className="border-b border-hairline bg-beige">
        <Container className="grid grid-cols-1 items-center gap-8 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20">
          <div className="flex flex-col items-start gap-4">
            <p className="font-body text-sm font-semibold uppercase tracking-wide text-maroon">
              Maruti Imitation Jewelry
            </p>
            <h1 className="max-w-xl font-heading text-4xl text-charcoal sm:text-5xl">
              Imitation jewellery, crafted with a rich gold-jewellery appearance
            </h1>
            <p className="max-w-lg font-body text-charcoal-muted">
              Manufacturer of imitation and micro gold-plated jewellery, based in Rajkot.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link href="/shop">
                <Button variant="primary">Shop Collection</Button>
              </Link>
              <Link href="/wholesale">
                <Button variant="secondary">Wholesale / Bulk Enquiry</Button>
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Shop by category (PRD §8.1) */}
      {categories.length > 0 ? (
        <Container>
          <h2 className="font-heading text-2xl text-charcoal">Shop by Category</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {categories.map((category) => (
              <CollectionCard
                key={category.id}
                name={category.name}
                slug={category.slug}
                imageUrl={category.imageUrl}
              />
            ))}
          </div>
        </Container>
      ) : null}

      {/* New Arrivals — hidden entirely if empty (PRD §8.1 empty state) */}
      {newArrivals.length > 0 ? (
        <Container>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl text-charcoal">New Arrivals</h2>
            <Link href="/shop" className="font-body text-sm text-maroon hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={serialize(newArrivals)} />
          </div>
        </Container>
      ) : null}

      {/* Best Sellers — hidden entirely if empty */}
      {bestSellers.length > 0 ? (
        <Container>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl text-charcoal">Best Sellers</h2>
            <Link href="/shop" className="font-body text-sm text-maroon hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={serialize(bestSellers)} />
          </div>
        </Container>
      ) : null}

      {/* Bridal/festive banner — only shown if that category actually exists */}
      {bridalCategory ? (
        <section className="bg-charcoal">
          <Container className="grid grid-cols-1 items-center gap-8 py-12 text-ivory lg:grid-cols-2 lg:gap-14 lg:py-16">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md lg:order-2">
              <Image
                src={BRIDAL_BANNER_IMAGE}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col items-start gap-4 lg:order-1">
              <p className="font-body text-sm font-semibold uppercase tracking-wide text-gold">
                Bridal Collection
              </p>
              <h2 className="max-w-lg font-heading text-3xl">
                Bridal and festive jewellery, for your most important occasions
              </h2>
              <Link href={`/category/${bridalCategory.slug}`}>
                <Button variant="primary">Explore Bridal Jewellery</Button>
              </Link>
            </div>
          </Container>
        </section>
      ) : null}

      {/* Trust strip (PRD §8.1) — confirmed facts only */}
      <Container>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <Icon aria-hidden="true" className="h-6 w-6 text-maroon" />
              <p className="font-body text-sm text-charcoal">{label}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
