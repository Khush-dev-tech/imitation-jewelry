"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import type { ProductSort } from "@/lib/products";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

/**
 * Filter/sort bar — UI/UX Brief §7/§8: inline on desktop (≥640px),
 * full-screen bottom sheet on mobile (never an inline expandable panel
 * on mobile). State lives in the URL (shareable/bookmarkable, supports
 * SEO — App Flow Screen 2).
 */
export function FilterSortBar({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStockOnly") === "true");
  const sort = (searchParams.get("sort") as ProductSort) || "newest";

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    if (inStockOnly) params.set("inStockOnly", "true");
    else params.delete("inStockOnly");
    router.push(`${pathname}?${params.toString()}`);
    setMobileOpen(false);
  }

  function changeSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") params.delete("sort");
    else params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    router.push(pathname);
    setMobileOpen(false);
  }

  const filterFields = (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <label className="flex-1 font-body text-sm text-charcoal">
          Min price
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="mt-1 w-full rounded-md border border-hairline bg-ivory px-3 py-2 font-body text-sm"
          />
        </label>
        <label className="flex-1 font-body text-sm text-charcoal">
          Max price
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="mt-1 w-full rounded-md border border-hairline bg-ivory px-3 py-2 font-body text-sm"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 font-body text-sm text-charcoal">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
        />
        In stock only
      </label>
      <div className="flex gap-2">
        <Button variant="primary" onClick={applyFilters} className="flex-1">
          Apply
        </Button>
        <Button variant="tertiary" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 border-b border-hairline pb-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-body text-sm text-charcoal-muted">
          {resultCount} {resultCount === 1 ? "product" : "products"}
        </p>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="sort-select">
            Sort by
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => changeSort(e.target.value)}
            className="rounded-md border border-hairline bg-ivory px-3 py-2 font-body text-sm text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={() => setMobileOpen(true)}
            className="sm:hidden"
            aria-label="Filters"
          >
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="hidden sm:block">{filterFields}</div>

      <Drawer open={mobileOpen} onOpenChange={setMobileOpen} side="bottom" title="Filters">
        {filterFields}
      </Drawer>
    </div>
  );
}
