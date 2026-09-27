import { NextResponse } from "next/server";
import { getAdminSession } from "./admin-session";
import type { AdminUser } from "@prisma/client";

/**
 * Every admin API route must call this independently — the page-level
 * layout redirect (app/admin/(protected)/layout.tsx) only protects
 * navigated pages, not direct requests to the API routes themselves.
 * TRD §7: "no admin functionality is reachable by an unauthenticated request."
 */
export async function requireAdminSession(): Promise<
  { admin: AdminUser } | { error: NextResponse }
> {
  const admin = await getAdminSession();
  if (!admin) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { admin };
}
