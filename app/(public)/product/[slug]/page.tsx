import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductDetailView, type ProductDetailData } from "@/components/product/ProductDetailView";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.description ?? undefined,
  };
}

// Live stock/price must reflect immediately (PRD §8.4/§8.12 acceptance
// criteria), same reasoning as the Shop/Category/Home pages.
export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const categorySlugs = product.categories.map((c) => c.category.slug);
  const related = await getRelatedProducts(product.id, categorySlugs);

  const detailData: ProductDetailData = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : null,
    stockStatus: product.stockStatus,
    images: product.images.map((img) => ({ id: img.id, url: img.url, altText: img.altText })),
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      attributes: v.attributes as Record<string, string>,
      priceOverride: v.priceOverride != null ? Number(v.priceOverride) : null,
      stockStatus: v.stockStatus,
    })),
  };

  const hasDetails = product.description || product.materialDetails || product.careInstructions;

  return (
    <Container className="flex flex-col gap-12 py-8 pb-28 sm:pb-8">
      <ProductDetailView product={detailData} />

      {hasDetails ? (
        <div className="flex max-w-2xl flex-col gap-6 border-t border-hairline pt-8">
          {product.description ? (
            <div>
              <h2 className="font-heading text-lg text-charcoal">Description</h2>
              <p className="mt-2 whitespace-pre-line font-body text-sm text-charcoal-muted">
                {product.description}
              </p>
            </div>
          ) : null}
          {product.materialDetails ? (
            <div>
              <h2 className="font-heading text-lg text-charcoal">Material / Plating Details</h2>
              <p className="mt-2 whitespace-pre-line font-body text-sm text-charcoal-muted">
                {product.materialDetails}
              </p>
            </div>
          ) : null}
          {product.careInstructions ? (
            <div>
              <h2 className="font-heading text-lg text-charcoal">Care Instructions</h2>
              <p className="mt-2 whitespace-pre-line font-body text-sm text-charcoal-muted">
                {product.careInstructions}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {related.length > 0 ? (
        <div className="border-t border-hairline pt-8">
          <h2 className="font-heading text-2xl text-charcoal">You May Also Like</h2>
          <div className="mt-6">
            <ProductGrid
              products={related.map((p) => ({
                ...p,
                price: p.price.toString(),
                compareAtPrice: p.compareAtPrice?.toString() ?? null,
              }))}
            />
          </div>
        </div>
      ) : null}
    </Container>
  );
}
