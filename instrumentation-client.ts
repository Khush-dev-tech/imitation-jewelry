import * as Sentry from "@sentry/nextjs";

/**
 * Sentry client-side error monitoring. Next.js auto-loads this file.
 * NEXT_PUBLIC_SENTRY_DSN mirrors the server-side SENTRY_DSN (must be the
 * public "client key" DSN — Sentry issues the same DSN format for both,
 * but it needs the NEXT_PUBLIC_ prefix to reach the browser bundle).
 * No-ops when unset — never initializes with an empty DSN.
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}

// Required by the SDK to instrument client-side route transitions —
// a no-op internally when Sentry.init() above never ran (DSN unset).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
