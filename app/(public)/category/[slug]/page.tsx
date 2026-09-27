import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterSortBar } from "@/components/product/FilterSortBar";
import { getFilteredProducts, type ProductSort } from "@/lib/products";
import { prisma } from "@/lib/prisma";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findFirst({ where: { slug, isActive: true } });
  if (!category) return {};
  return {
    title: category.name,
    description:
      category.description ?? `Shop ${category.name} from Maruti Imitation Jewelry, Rajkot.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;

  // App Flow Screen 3 edge case: invalid/unknown category slug →
  // 404-style "category not found," not a broken empty grid.
  const category = await prisma.category.findFirst({ where: { slug, isActive: true } });
  if (!category) {
    notFound();
  }

  const products = await getFilteredProducts({
    categorySlug: slug,
    sort: (searchParamsResolved.sort as ProductSort) || "newest",
    minPrice: searchParamsResolved.minPrice ? Number(searchParamsResolved.minPrice) : undefined,
    maxPrice: searchParamsResolved.maxPrice ? Number(searchParamsResolved.maxPrice) : undefined,
    inStockOnly: searchParamsResolved.inStockOnly === "true",
  });

  const serialized = products.map((p) => ({
    ...p,
    price: p.price.toString(),
    compareAtPrice: p.compareAtPrice?.toString() ?? null,
  }));

  const hasActiveFilters = Boolean(
    searchParamsResolved.minPrice ||
    searchParamsResolved.maxPrice ||
    searchParamsResolved.inStockOnly,
  );

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="font-heading text-3xl text-charcoal">{category.name}</h1>
        {category.description ? (
          <p className="mt-2 max-w-2xl font-body text-charcoal-muted">{category.description}</p>
        ) : null}
      </div>
      <FilterSortBar resultCount={serialized.length} />
      <ProductGrid
        products={serialized}
        emptyMessage={
          hasActiveFilters ? "No products match your filters." : "No products in this category yet."
        }
        showClearFilters={hasActiveFilters}
      />
    </Container>
  );
}
