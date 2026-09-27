import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/passwords";
import { createAdminSession } from "@/lib/auth/admin-session";
import { isRateLimited, recordFailedAttempt, clearAttempts } from "@/lib/auth/rate-limit";
import { adminLoginSchema } from "@/lib/validation/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateLimitKey = `${email}:${forwardedFor}`;

  // App Flow Screen 16 edge case: repeated failures are rate-limited
  // (TRD §7). Generic message — never reveal whether the account exists.
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  const adminUser = await prisma.adminUser.findUnique({ where: { email } });

  const isValid = adminUser?.isActive
    ? await verifyPassword(password, adminUser.passwordHash)
    : false;

  if (!adminUser || !isValid) {
    recordFailedAttempt(rateLimitKey);
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  clearAttempts(rateLimitKey);
  await createAdminSession(adminUser.id);

  return NextResponse.json({ ok: true });
}
