import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";
import { OrderStatusFilter } from "@/components/admin/OrderStatusFilter";
import type { OrderStatus } from "@prisma/client";

/**
 * Admin: Orders — App Flow Screen 21 / PRD §8.13. Read-only visibility for
 * now (list + detail) so the business isn't blind to real orders created
 * once Checkout went live this phase — status-update workflow and the
 * fuller admin order-management scope land in a later phase (Order
 * Confirmation & Admin Order Management).
 */
const STATUS_LABELS: Record<string, string> = {
  pending_confirmation: "Pending Confirmation",
  paid: "Paid",
  payment_failed: "Payment Failed",
  cancelled: "Cancelled",
  fulfilled: "Fulfilled",
};

const VALID_STATUSES = new Set([
  "pending_confirmation",
  "paid",
  "payment_failed",
  "cancelled",
  "fulfilled",
]);

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const statusFilter =
    params.status && VALID_STATUSES.has(params.status) ? (params.status as OrderStatus) : undefined;

  const orders = await prisma.order.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl text-charcoal">Orders</h1>
        <OrderStatusFilter />
      </div>

      {orders.length === 0 ? (
        <p className="font-body text-sm text-charcoal-muted">
          {statusFilter ? "No orders match this filter." : "No orders yet."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-hairline bg-ivory">
          <table className="w-full text-left font-body text-sm">
            <thead className="border-b border-hairline text-charcoal-muted">
              <tr>
                <th className="p-3 font-medium">Order</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Items</th>
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="p-3 font-medium text-charcoal">{order.orderNumber}</td>
                  <td className="p-3 text-charcoal-muted">
                    {order.contactName}
                    <br />
                    {order.contactPhone}
                  </td>
                  <td className="p-3 text-charcoal-muted">{order._count.items}</td>
                  <td className="p-3 text-charcoal">{formatINR(order.total.toString())}</td>
                  <td className="p-3">
                    <Badge variant={order.status === "pending_confirmation" ? "new" : "sale"}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-charcoal-muted">
                    {order.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-maroon hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
