import type { captureRequestError } from "@sentry/nextjs";

/**
 * Sentry server/edge error monitoring (TRD §4 — confirmed choice).
 * Next.js calls `register()` once on server/edge startup. No-ops when
 * SENTRY_DSN is unset (the default for local dev) — never initializes
 * with an empty DSN. Code-complete but unverified: no real Sentry
 * project existed at build time, so no error has actually been confirmed
 * reaching Sentry. Only a type-only import of the SDK happens eagerly;
 * the actual package is loaded dynamically, only when configured.
 */
export async function register() {
  if (!process.env.SENTRY_DSN) return;

  const Sentry = await import("@sentry/nextjs");
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}

export const onRequestError: typeof captureRequestError = async (...args) => {
  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
