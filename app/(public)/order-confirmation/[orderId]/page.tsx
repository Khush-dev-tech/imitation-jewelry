import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { getOrderById } from "@/lib/orders";
import { buildGeneralEnquiryLink } from "@/lib/whatsapp";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Confirmation" };
export const dynamic = "force-dynamic";

// Canonical customer-facing labels — Backend Schema §4.13.
const STATUS_LABELS: Record<string, string> = {
  pending_confirmation: "Pending Confirmation",
  paid: "Paid",
  payment_failed: "Payment Failed",
  cancelled: "Cancelled",
  fulfilled: "Fulfilled",
};

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const statusLabel = STATUS_LABELS[order.status] ?? order.status;

  return (
    <Container className="flex max-w-2xl flex-col gap-6 py-12">
      <div className="flex flex-col gap-1 border-b border-hairline pb-6">
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-maroon">
          Order Confirmed
        </p>
        <h1 className="font-heading text-3xl text-charcoal">Thank you, {order.contactName}!</h1>
        <p className="font-body text-charcoal-muted">
          Order <span className="font-semibold text-charcoal">{order.orderNumber}</span> · Status:{" "}
          <span className="font-semibold text-charcoal">{statusLabel}</span>
        </p>
      </div>

      {order.status === "pending_confirmation" ? (
        <div className="rounded-md border border-hairline bg-beige p-4 font-body text-sm text-charcoal">
          We&apos;ve received your order. Our team will reach out on WhatsApp or phone shortly to
          confirm details and arrange payment/delivery — your order isn&apos;t paid yet.
        </div>
      ) : null}

      {order.status === "paid" ? (
        <div className="rounded-md border border-hairline bg-beige p-4 font-body text-sm text-charcoal">
          Payment received — thank you! We&apos;ll start preparing your order and reach out on
          WhatsApp or phone with delivery updates.
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg text-charcoal">Order Summary</h2>
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

      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg text-charcoal">Delivery Address</h2>
        <p className="font-body text-sm text-charcoal-muted">
          {order.contactName} · {order.contactPhone}
          <br />
          {order.deliveryLine1}
          {order.deliveryLine2 ? `, ${order.deliveryLine2}` : ""}
          <br />
          {order.deliveryCity}, {order.deliveryState} {order.deliveryPincode}
          <br />
          {order.deliveryCountry}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-hairline pt-6">
        <Link href="/shop">
          <Button variant="primary">Continue Shopping</Button>
        </Link>
        <a href={buildGeneralEnquiryLink()} target="_blank" rel="noopener noreferrer">
          <Button variant="whatsapp">Questions? Chat on WhatsApp</Button>
        </a>
      </div>
    </Container>
  );
}
