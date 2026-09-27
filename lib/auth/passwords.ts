import bcrypt from "bcryptjs";

// bcryptjs (pure JS, no native compilation) — chosen so it installs and
// deploys reliably on Windows dev machines and Vercel's serverless
// functions alike, without native-binding build issues.
const SALT_ROUNDS = 12;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
