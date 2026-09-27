import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { AdminUser } from "@prisma/client";

/**
 * Admin session management — Backend Schema §2/§4.3. Deliberately NOT
 * Auth.js (that's reserved for optional customer accounts, TRD §1) so the
 * admin identity domain never shares code paths, tables, or session
 * formats with customers.
 */

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours — shorter than a typical customer session, TRD §7

export async function createAdminSession(adminUserId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.adminSession.create({
    data: { adminUserId, sessionToken: token, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    await prisma.adminSession.deleteMany({ where: { sessionToken: token } });
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

/**
 * Reads the session cookie and returns the authenticated admin user, or
 * null if there's no valid, unexpired session. Expired sessions are
 * opportunistically deleted rather than left to a separate cleanup job.
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { sessionToken: token },
    include: { adminUser: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date() || !session.adminUser.isActive) {
    await prisma.adminSession.delete({ where: { id: session.id } });
    return null;
  }

  return session.adminUser;
}
