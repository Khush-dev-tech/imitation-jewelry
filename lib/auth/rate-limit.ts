/**
 * In-memory login rate limiter — TRD §7: "repeated failures should be
 * rate-limited." A fixed lockout window keyed by identifier (email +
 * client IP combined, so one doesn't lock out the other).
 *
 * Known limitation (flagged, not hidden): this is per-process memory, not
 * a shared store. It's fully correct for local dev, staging, and a
 * single long-running server, but on a multi-instance serverless
 * deployment (Vercel) each instance tracks attempts independently, so the
 * effective limit is "N attempts per warm instance," not a hard global
 * cap. Revisit with a shared store (e.g. Vercel KV) if that gap matters
 * in practice — not adding a new database table for this in v1 rather
 * than expanding the approved admin_users schema for it.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
}

const attempts = new Map<string, AttemptRecord>();

function keyFor(identifier: string): string {
  return identifier.toLowerCase().trim();
}

export function isRateLimited(identifier: string): boolean {
  const record = attempts.get(keyFor(identifier));
  if (!record) return false;

  if (Date.now() - record.firstAttemptAt > WINDOW_MS) {
    attempts.delete(keyFor(identifier));
    return false;
  }

  return record.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(identifier: string): void {
  const key = keyFor(identifier);
  const record = attempts.get(key);

  if (!record || Date.now() - record.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: Date.now() });
    return;
  }

  record.count += 1;
}

export function clearAttempts(identifier: string): void {
  attempts.delete(keyFor(identifier));
}
