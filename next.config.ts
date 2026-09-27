import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {};

// withSentryConfig itself no-ops the sourcemap-upload step (its only
// build-time effect) when SENTRY_AUTH_TOKEN is unset — safe to wrap
// unconditionally even without a real Sentry project yet.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
});
