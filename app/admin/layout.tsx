import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Maruti Imitation Jewelry Admin",
  },
  robots: { index: false, follow: false },
};

/**
 * Admin shell — utilitarian, data-dense, functional (UI/UX Brief §7),
 * deliberately not the boutique aesthetic used on public pages. Applies
 * to every /admin/* route including the (unauthenticated) login page;
 * the session-gated nav chrome lives one level down, in
 * app/admin/(protected)/layout.tsx.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-beige">
      <div className="border-b border-hairline bg-charcoal px-4 py-3">
        <p className="font-body text-sm font-medium text-ivory">Maruti Imitation Jewelry — Admin</p>
      </div>
      {children}
    </div>
  );
}
