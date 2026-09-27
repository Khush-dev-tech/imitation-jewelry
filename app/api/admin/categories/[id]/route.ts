import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { categorySchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);

  // Full replace (name/slug/description/imageUrl) or just the isActive
  // toggle (deactivate = soft-delete, Backend Schema §8) — both go
  // through this one endpoint.
  if (body && typeof body.isActive === "boolean" && Object.keys(body).length === 1) {
    const category = await prisma.category.update({
      where: { id },
      data: { isActive: body.isActive },
    });
    return NextResponse.json({ category });
  }

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existingSlug = await prisma.category.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (existingSlug) {
    return NextResponse.json(
      { error: "A category with this slug already exists." },
      { status: 409 },
    );
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  return NextResponse.json({ category });
}
