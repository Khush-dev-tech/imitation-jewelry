/**
 * The site's canonical public URL — used for sitemap/robots absolute
 * URLs and (once set) `metadataBase`. No production domain is confirmed
 * yet (App Brief: hosting/budget "to be confirmed with client"), so this
 * falls back to localhost for dev rather than inventing a domain.
 * Set NEXT_PUBLIC_SITE_URL before deploying to staging/production.
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
