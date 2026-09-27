import Script from "next/script";

/**
 * Google Analytics 4 (TRD §4 — confirmed choice, not gated on business
 * sign-off the way payment gateway was). Renders nothing when
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is unset (the default for local dev) —
 * never loads a broken/empty tracking script. Code-complete but
 * unverified: no real GA4 property existed at build time, so no traffic
 * has actually been confirmed reaching Google Analytics.
 */
export function Analytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
