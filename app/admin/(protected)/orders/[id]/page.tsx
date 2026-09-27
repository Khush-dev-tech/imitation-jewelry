import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderForAdmin } from "@/lib/orders";
import { formatINR } from "@/lib/utils";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderForAdmin(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/orders" className="font-body text-sm text-maroon hover:underline">
          ← Back to Orders
        </Link>
        <h1 className="mt-2 font-heading text-2xl text-charcoal">{order.orderNumber}</h1>
        <p className="font-body text-sm text-charcoal-muted">
          Payment: <span className="font-semibold">{order.paymentStatus.replace("_", " ")}</span> ·
          Placed {order.createdAt.toLocaleString("en-IN")}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-body text-sm font-medium text-charcoal">Order Status</span>
        <OrderStatusControl orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-hairline bg-ivory p-4">
        <h2 className="font-heading text-lg text-charcoal">Contact & Delivery</h2>
        <p className="font-body text-sm text-charcoal-muted">
          {order.contactName} · {order.contactPhone}
          {order.contactEmail ? ` · ${order.contactEmail}` : ""}
          <br />
          {order.deliveryLine1}
          {order.deliveryLine2 ? `, ${order.deliveryLine2}` : ""}
          <br />
          {order.deliveryCity}, {order.deliveryState} {order.deliveryPincode}
          <br />
          {order.deliveryCountry}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg text-charcoal">Items</h2>
        <div className="flex flex-col divide-y divide-hairline border-y border-hairline">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 py-3 font-body text-sm">
              <span className="text-charcoal">
                {item.productNameSnapshot}
                {item.variantAttributesSnapshot
                  ? ` (${Object.values(item.variantAttributesSnapshot as Record<string, string>).join(" / ")})`
                  : ""}{" "}
                × {item.quantity}
              </span>
              <span className="shrink-0 text-charcoal">{formatINR(item.lineTotal.toString())}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between font-body text-sm font-semibold text-charcoal">
          <span>Total</span>
          <span>{formatINR(order.total.toString())}</span>
        </div>
      </div>

      {order.paymentAttempts.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-lg text-charcoal">Payment Attempts</h2>
          <div className="flex flex-col divide-y divide-hairline border-y border-hairline">
            {order.paymentAttempts.map((attempt) => (
              <div key={attempt.id} className="flex flex-col gap-1 py-3 font-body text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal">
                    {attempt.gateway} · {attempt.status}
                  </span>
                  <span className="text-charcoal-muted">
                    {attempt.createdAt.toLocaleString("en-IN")}
                  </span>
                </div>
                {attempt.gatewayTransactionId ? (
                  <p className="font-mono text-xs text-charcoal-muted">
                    Transaction: {attempt.gatewayTransactionId}
                  </p>
                ) : null}
                {attempt.failureReason ? (
                  <p className="text-xs text-error">Reason: {attempt.failureReason}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
