import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { categorySchema } from "@/lib/validation/admin";

export async function GET() {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existingSlug = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existingSlug) {
    return NextResponse.json(
      { error: "A category with this slug already exists." },
      { status: 409 },
    );
  }

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}
