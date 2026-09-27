import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterSortBar } from "@/components/product/FilterSortBar";
import { SearchBar } from "@/components/product/SearchBar";
import { Button } from "@/components/ui/Button";
import { getFilteredProducts, type ProductSort } from "@/lib/products";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Maruti Imitation Jewelry catalogue.",
};

// Live stock/price must reflect immediately (PRD §8.2/§8.4 acceptance criteria).
export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const products = query
    ? await getFilteredProducts({
        query,
        sort: (params.sort as ProductSort) || "newest",
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        inStockOnly: params.inStockOnly === "true",
      })
    : [];

  const serialized = products.map((p) => ({
    ...p,
    price: p.price.toString(),
    compareAtPrice: p.compareAtPrice?.toString() ?? null,
  }));

  const hasActiveFilters = Boolean(params.minPrice || params.maxPrice || params.inStockOnly);

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="font-heading text-3xl text-charcoal">Search</h1>
        <div className="mt-4 max-w-xl">
          <SearchBar />
        </div>
      </div>

      {!query ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="font-body text-charcoal-muted">
            Enter a search term above to find jewellery by name.
          </p>
          <Link href="/shop">
            <Button variant="secondary">Browse All Jewellery</Button>
          </Link>
        </div>
      ) : (
        <>
          <FilterSortBar resultCount={serialized.length} />
          <ProductGrid
            products={serialized}
            emptyMessage={
              hasActiveFilters
                ? `No results for "${query}" match your filters.`
                : `No results for "${query}". Try a different term or browse categories instead.`
            }
            showClearFilters={hasActiveFilters}
          />
        </>
      )}
    </Container>
  );
}
