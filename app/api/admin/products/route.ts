import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { productSchemaWithChecks } from "@/lib/validation/admin";

export async function GET() {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = productSchemaWithChecks.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const existingSlug = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existingSlug) {
    return NextResponse.json(
      { error: { formErrors: ["A product with this slug already exists."] } },
      { status: 409 },
    );
  }

  if (data.sku) {
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      return NextResponse.json(
        { error: { formErrors: ["A product with this SKU already exists."] } },
        { status: 409 },
      );
    }
  }

  // PRD §8.6 (order snapshot integrity) doesn't apply here, but the same
  // "all or nothing" principle does: a product must never save with some
  // images/variants but not others because of a mid-request failure.
  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku || null,
        description: data.description || null,
        materialDetails: data.materialDetails || null,
        careInstructions: data.careInstructions || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        stockStatus: data.stockStatus,
        isNewArrival: data.isNewArrival,
        isBestSeller: data.isBestSeller,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        images: {
          create: data.images.map((image, index) => ({
            url: image.url,
            altText: image.altText,
            sortOrder: image.sortOrder ?? index,
          })),
        },
        variants: {
          create: data.variants.map((variant) => ({
            sku: variant.sku,
            attributes: variant.attributes,
            priceOverride: variant.priceOverride ?? null,
            stockStatus: variant.stockStatus ?? null,
          })),
        },
        categories: {
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      include: { images: true, variants: true, categories: { include: { category: true } } },
    });

    return created;
  });

  return NextResponse.json({ product }, { status: 201 });
}
