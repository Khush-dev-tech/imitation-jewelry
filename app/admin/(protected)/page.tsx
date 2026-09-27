import Link from "next/link";
import { Card } from "@/components/ui/Card";

/** Admin Dashboard — App Flow Screen 17: navigational landing point. */
export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl text-charcoal">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/products">
          <Card className="p-5 transition-colors hover:bg-beige">
            <p className="font-body text-base font-semibold text-charcoal">Products</p>
            <p className="mt-1 font-body text-sm text-charcoal-muted">
              Manage the catalogue: create, edit, and toggle stock status.
            </p>
          </Card>
        </Link>
        <Link href="/admin/categories">
          <Card className="p-5 transition-colors hover:bg-beige">
            <p className="font-body text-base font-semibold text-charcoal">Categories</p>
            <p className="mt-1 font-body text-sm text-charcoal-muted">
              Manage the category taxonomy products are organized under.
            </p>
          </Card>
        </Link>
        <Link href="/admin/orders">
          <Card className="p-5 transition-colors hover:bg-beige">
            <p className="font-body text-base font-semibold text-charcoal">Orders</p>
            <p className="mt-1 font-body text-sm text-charcoal-muted">
              Review retail orders placed through checkout.
            </p>
          </Card>
        </Link>
        <Link href="/admin/wholesale-leads">
          <Card className="p-5 transition-colors hover:bg-beige">
            <p className="font-body text-base font-semibold text-charcoal">Wholesale Leads</p>
            <p className="mt-1 font-body text-sm text-charcoal-muted">
              Review and follow up on bulk-order enquiries.
            </p>
          </Card>
        </Link>
        <Link href="/admin/settings">
          <Card className="p-5 transition-colors hover:bg-beige">
            <p className="font-body text-base font-semibold text-charcoal">Settings</p>
            <p className="mt-1 font-body text-sm text-charcoal-muted">
              Turn the online payment gateway on or off.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
