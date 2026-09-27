import { prisma } from "@/lib/prisma";
import { ProductList } from "@/components/admin/ProductList";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      categories: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Decimal fields aren't directly serializable to a Client Component.
  const serialized = products.map((product) => ({
    ...product,
    price: product.price.toString(),
    compareAtPrice: product.compareAtPrice?.toString() ?? null,
  }));

  return <ProductList products={serialized} />;
}
