import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { Analytics } from "@/components/Analytics";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// UI/UX Brief §3: elegant serif for headings, clean sans-serif for body.
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Maruti Imitation Jewelry",
    template: "%s | Maruti Imitation Jewelry",
  },
  description:
    "Premium imitation and micro gold-plated jewellery from Maruti Imitation Jewelry, Rajkot. Necklace sets, bridal jewellery, earrings, bangles, and more.",
};

/**
 * Root layout — deliberately minimal. Storefront chrome (Header/Footer/
 * WhatsApp button) lives in app/(public)/layout.tsx; admin chrome lives
 * in app/admin/layout.tsx. Keeping them separate is what stops admin
 * pages from inheriting the public boutique shell (UI/UX Brief §7).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col font-body text-charcoal antialiased">
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
