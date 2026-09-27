import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { productSchemaWithChecks } from "@/lib/validation/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      categories: { include: { category: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);

  // Fast path: the stock toggle (Admin Products List) sends only
  // { stockStatus }. PRD §8.12 acceptance criteria: this must take
  // effect immediately, so it's a single-field update, not a full
  // product re-save.
  if (
    body &&
    typeof body.stockStatus === "string" &&
    Object.keys(body).length === 1 &&
    (body.stockStatus === "in_stock" || body.stockStatus === "out_of_stock")
  ) {
    const product = await prisma.product.update({
      where: { id },
      data: { stockStatus: body.stockStatus },
    });
    return NextResponse.json({ product });
  }

  // Same shape as categories' isActive toggle — deactivate/reactivate
  // (soft-delete, Backend Schema §8) without touching anything else.
  if (body && typeof body.isActive === "boolean" && Object.keys(body).length === 1) {
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: body.isActive },
    });
    return NextResponse.json({ product });
  }

  const parsed = productSchemaWithChecks.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const existingSlug = await prisma.product.findFirst({
    where: { slug: data.slug, NOT: { id } },
  });
  if (existingSlug) {
    return NextResponse.json(
      { error: { formErrors: ["A product with this slug already exists."] } },
      { status: 409 },
    );
  }

  if (data.sku) {
    const existingSku = await prisma.product.findFirst({
      where: { sku: data.sku, NOT: { id } },
    });
    if (existingSku) {
      return NextResponse.json(
        { error: { formErrors: ["A product with this SKU already exists."] } },
        { status: 409 },
      );
    }
  }

  // Full re-save: replace images/variants/categories wholesale rather
  // than diffing — simplest correct approach for a v1 admin tool.
  const product = await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productVariant.deleteMany({ where: { productId: id } });
    await tx.productCategory.deleteMany({ where: { productId: id } });

    return tx.product.update({
      where: { id },
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
  });

  return NextResponse.json({ product });
}
