import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { saveProductImage } from "@/lib/uploads";

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  try {
    const result = await saveProductImage(file);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
