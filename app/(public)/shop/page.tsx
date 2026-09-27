import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterSortBar } from "@/components/product/FilterSortBar";
import { getFilteredProducts, type ProductSort } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop All Jewellery",
  description:
    "Browse the full Maruti Imitation Jewelry collection — necklace sets, bridal jewellery, earrings, bangles, and more.",
};

interface ShopPageProps {
  searchParams: Promise<{
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const products = await getFilteredProducts({
    sort: (params.sort as ProductSort) || "newest",
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    inStockOnly: params.inStockOnly === "true",
  });

  const serialized = products.map((p) => ({
    ...p,
    price: p.price.toString(),
    compareAtPrice: p.compareAtPrice?.toString() ?? null,
  }));

  const hasActiveFilters = Boolean(params.minPrice || params.maxPrice || params.inStockOnly);

  return (
    <Container className="flex flex-col gap-6 py-8">
      <h1 className="font-heading text-3xl text-charcoal">Shop All Jewellery</h1>
      <FilterSortBar resultCount={serialized.length} />
      <ProductGrid
        products={serialized}
        emptyMessage={
          hasActiveFilters ? "No products match your filters." : "No products available yet."
        }
        showClearFilters={hasActiveFilters}
      />
    </Container>
  );
}
