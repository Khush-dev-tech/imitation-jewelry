import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  // Prisma's client generator writes to a custom path (lib/generated/prisma,
  // per the TRD) instead of node_modules/.prisma/client. Next's serverless
  // output tracing can't see the native query-engine binary it loads at
  // runtime (it's a dynamic require, not a static import), so without this
  // it silently gets left out of the deployed function bundle — works in
  // `next dev`, 500s in production.
  outputFileTracingIncludes: {
    "/**": ["./lib/generated/prisma/**/*"],
  },
};

// withSentryConfig itself no-ops the sourcemap-upload step (its only
// build-time effect) when SENTRY_AUTH_TOKEN is unset — safe to wrap
// unconditionally even without a real Sentry project yet.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
});
