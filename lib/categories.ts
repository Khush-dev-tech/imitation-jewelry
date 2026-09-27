/**
 * The approved v1 category taxonomy — PRD §6, seeded exactly per
 * docs/05-backend-schema.md §13. These are structural/taxonomic and
 * already client-approved (distinct from product data like prices, stock,
 * or photos, which are not invented anywhere in this codebase).
 * "New Arrivals" / "Best Sellers" / "Sale" are deliberately excluded —
 * they're product-level flags, not categories (Backend Schema §13).
 */
export interface NavCategory {
  name: string;
  slug: string;
}

export const CATEGORIES: NavCategory[] = [
  { name: "Necklace Sets", slug: "necklace-sets" },
  { name: "Bridal Jewellery", slug: "bridal-jewellery" },
  { name: "Earrings", slug: "earrings" },
  { name: "Bangles and Bracelets", slug: "bangles-and-bracelets" },
  { name: "Rings", slug: "rings" },
  { name: "Pendants", slug: "pendants" },
  { name: "Mangalsutra", slug: "mangalsutra" },
  { name: "Maang Tikka", slug: "maang-tikka" },
  { name: "Kundan Jewellery", slug: "kundan-jewellery" },
  { name: "Temple Jewellery", slug: "temple-jewellery" },
  { name: "Daily-wear Jewellery", slug: "daily-wear-jewellery" },
];
