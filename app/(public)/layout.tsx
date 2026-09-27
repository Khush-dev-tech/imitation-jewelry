import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

/**
 * Public storefront shell — Header, Footer, floating WhatsApp button.
 * Deliberately scoped to the (public) route group, not the root layout,
 * so admin routes (app/admin/*) never inherit the boutique storefront
 * chrome (UI/UX Brief §7 — admin is a distinct, utilitarian surface).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-maroon focus:px-4 focus:py-2 focus:text-ivory"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
