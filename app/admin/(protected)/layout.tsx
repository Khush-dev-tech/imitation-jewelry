import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/admin-session";
import { LogoutButton } from "@/components/admin/LogoutButton";

/**
 * Protected admin layout — App Flow Screen 16 edge case: unauthenticated
 * access to any /admin/(protected)/* route redirects to Admin Login,
 * never showing admin content first.
 */
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-48px)] flex-col lg:flex-row">
      <aside className="border-b border-hairline bg-ivory px-4 py-4 lg:w-56 lg:border-b-0 lg:border-r">
        <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto lg:flex-col">
          <Link
            href="/admin"
            className="whitespace-nowrap rounded-md px-3 py-2 font-body text-sm font-medium text-charcoal hover:bg-beige"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="whitespace-nowrap rounded-md px-3 py-2 font-body text-sm font-medium text-charcoal hover:bg-beige"
          >
            Products
          </Link>
          <Link
            href="/admin/categories"
            className="whitespace-nowrap rounded-md px-3 py-2 font-body text-sm font-medium text-charcoal hover:bg-beige"
          >
            Categories
          </Link>
          <Link
            href="/admin/orders"
            className="whitespace-nowrap rounded-md px-3 py-2 font-body text-sm font-medium text-charcoal hover:bg-beige"
          >
            Orders
          </Link>
          <Link
            href="/admin/wholesale-leads"
            className="whitespace-nowrap rounded-md px-3 py-2 font-body text-sm font-medium text-charcoal hover:bg-beige"
          >
            Wholesale Leads
          </Link>
          <Link
            href="/admin/settings"
            className="whitespace-nowrap rounded-md px-3 py-2 font-body text-sm font-medium text-charcoal hover:bg-beige"
          >
            Settings
          </Link>
          <div className="mt-0 border-t-0 pt-0 lg:mt-4 lg:border-t lg:border-hairline lg:pt-4">
            <LogoutButton />
          </div>
        </nav>
      </aside>
      <div className="flex-1 p-4 lg:p-8">{children}</div>
    </div>
  );
}
