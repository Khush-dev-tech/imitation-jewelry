import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type ProductSort = "newest" | "price-asc" | "price-desc";

export interface ProductFilters {
  categorySlug?: string;
  /** Free-text search across name/description (PRD §8.3 — ILIKE at this scale, per TRD §1). */
  query?: string;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}

const SORT_MAP: Record<ProductSort, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
};

/**
 * Shared product query for Shop and Category pages (PRD §8.2) — same
 * filter/sort behaviour on both, since Category is just Shop pre-scoped
 * to one category (App Flow Screen 3: "Same behaviour as Shop, scoped to
 * the category").
 */
export async function getFilteredProducts(filters: ProductFilters) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (filters.categorySlug) {
    where.categories = { some: { category: { slug: filters.categorySlug } } };
  }

  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query, mode: "insensitive" } },
      { description: { contains: filters.query, mode: "insensitive" } },
    ];
  }

  if (filters.inStockOnly) {
    where.stockStatus = "in_stock";
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  const products = await prisma.product.findMany({
    where,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: SORT_MAP[filters.sort ?? "newest"],
  });

  return products;
}

/** Homepage "New Arrivals" section (PRD §8.1) — hidden entirely if empty. */
export async function getNewArrivals(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isNewArrival: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Homepage "Best Sellers" section (PRD §8.1) — hidden entirely if empty. */
export async function getBestSellers(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isBestSeller: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Product Detail page (PRD §8.4) — full detail including variants. */
export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
      categories: { include: { category: true } },
    },
  });
}

/** Product Detail page "related products" (App Flow Screen 5) — same category, excluding the current product. */
export async function getRelatedProducts(productId: string, categorySlugs: string[], limit = 4) {
  if (categorySlugs.length === 0) return [];
  return prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      categories: { some: { category: { slug: { in: categorySlugs } } } },
    },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
