import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm, type ProductFormInitialValues } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        categories: { select: { categoryId: true } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const initialValues: ProductFormInitialValues = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku ?? "",
    description: product.description ?? "",
    materialDetails: product.materialDetails ?? "",
    careInstructions: product.careInstructions ?? "",
    price: product.price.toString(),
    compareAtPrice: product.compareAtPrice?.toString() ?? "",
    stockStatus: product.stockStatus,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    categoryIds: product.categories.map((c) => c.categoryId),
    images: product.images.map((img) => ({ url: img.url, altText: img.altText })),
    variants: product.variants.map((variant) => {
      const attributes = (variant.attributes as Record<string, string>) ?? {};
      return {
        sku: variant.sku,
        colour: attributes.colour ?? "",
        size: attributes.size ?? "",
        set: attributes.set ?? "",
        priceOverride: variant.priceOverride?.toString() ?? "",
        stockStatus: variant.stockStatus ?? "",
      };
    }),
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl text-charcoal">Edit Product</h1>
      <ProductForm categories={categories} initialValues={initialValues} />
    </div>
  );
}
