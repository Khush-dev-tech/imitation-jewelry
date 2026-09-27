import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/orders";
import { checkoutSchema } from "@/lib/validation/checkout";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/payments/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

/**
 * Order creation (PRD §8.6). Guest checkout only. Prices/stock are always
 * re-verified server-side from the database — the client's cart
 * (localStorage) is never trusted for money or availability, only for
 * which product/variant/quantity was chosen.
 *
 * When `site_settings.payment_gateway_enabled` is true, a Razorpay order
 * is created first (external call, can't be part of the DB transaction)
 * and only then is the DB order written, with the gateway order id
 * attached to its first payment_attempts row. If the Razorpay call fails,
 * nothing is written — there's no order to roll back.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  const unavailable: { productId: string; variantId: string | null; reason: string }[] = [];
  const resolvedItems: {
    productId: string;
    variantId: string | null;
    quantity: number;
    name: string;
    imageUrl: string | null;
    variantAttributes: Record<string, string> | null;
    unitPrice: number;
  }[] = [];

  for (const item of data.items) {
    const product = productById.get(item.productId);
    if (!product || !product.isActive) {
      unavailable.push({
        productId: item.productId,
        variantId: item.variantId,
        reason: "no longer available",
      });
      continue;
    }

    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
    if (item.variantId && !variant) {
      unavailable.push({
        productId: item.productId,
        variantId: item.variantId,
        reason: "option no longer available",
      });
      continue;
    }

    const effectiveStock = variant?.stockStatus ?? product.stockStatus;
    if (effectiveStock === "out_of_stock") {
      unavailable.push({
        productId: item.productId,
        variantId: item.variantId,
        reason: "out of stock",
      });
      continue;
    }

    resolvedItems.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      quantity: item.quantity,
      name: product.name,
      imageUrl: product.images[0]?.url ?? null,
      variantAttributes: (variant?.attributes as Record<string, string> | undefined) ?? null,
      unitPrice: Number(variant?.priceOverride ?? product.price),
    });
  }

  if (unavailable.length > 0) {
    return NextResponse.json(
      {
        error: "Some items in your cart are no longer available.",
        unavailable,
      },
      { status: 409 },
    );
  }

  const siteSettings = await prisma.siteSetting.findFirst();
  const paymentEnabled = siteSettings?.paymentGatewayEnabled ?? false;

  const subtotal = resolvedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const orderNumber = await generateOrderNumber();

  let razorpayOrder: { id: string; amount: number; currency: string } | null = null;
  if (paymentEnabled) {
    if (!isRazorpayConfigured()) {
      // Admin settings blocks enabling the toggle without credentials
      // (see /api/admin/settings), but guard here too in case the flag
      // was flipped some other way — never silently fall back to
      // "pending confirmation" when the business explicitly turned
      // payment on (PRD §8.6 — never mislead about payment state).
      return NextResponse.json(
        { error: "Online payment is enabled but not yet configured. Please try again shortly." },
        { status: 503 },
      );
    }
    try {
      razorpayOrder = await createRazorpayOrder({ amountInRupees: subtotal, receipt: orderNumber });
    } catch {
      return NextResponse.json(
        { error: "Could not start payment. Please try again." },
        { status: 502 },
      );
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail || null,
        deliveryLine1: data.deliveryLine1,
        deliveryLine2: data.deliveryLine2 || null,
        deliveryCity: data.deliveryCity,
        deliveryState: data.deliveryState,
        deliveryPincode: data.deliveryPincode,
        deliveryCountry: data.deliveryCountry,
        subtotal,
        total: subtotal,
        status: "pending_confirmation",
        paymentStatus: paymentEnabled ? "pending" : "not_applicable",
        items: {
          create: resolvedItems.map((item) => ({
            productId: item.productId,
            productNameSnapshot: item.name,
            productImageUrlSnapshot: item.imageUrl,
            variantAttributesSnapshot: item.variantAttributes ?? undefined,
            quantity: item.quantity,
            unitPriceSnapshot: item.unitPrice,
            lineTotal: item.unitPrice * item.quantity,
          })),
        },
        ...(razorpayOrder
          ? {
              paymentAttempts: {
                create: {
                  gateway: "razorpay",
                  gatewayOrderId: razorpayOrder.id,
                  amount: subtotal,
                  status: "initiated",
                },
              },
            }
          : {}),
      },
    });
    return created;
  });

  if (!paymentEnabled) {
    // Payment-enabled orders get their confirmation email once payment is
    // actually verified (verify-payment route / webhook), not here — a
    // "pending" gateway order might still fail or be abandoned.
    await sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      contactName: order.contactName,
      contactEmail: order.contactEmail ?? "",
      status: "pending_confirmation",
      total: order.total.toString(),
      items: resolvedItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        lineTotal: (item.unitPrice * item.quantity).toString(),
      })),
      deliveryAddress: [
        order.deliveryLine1,
        order.deliveryLine2,
        `${order.deliveryCity}, ${order.deliveryState} ${order.deliveryPincode}`,
        order.deliveryCountry,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  return NextResponse.json(
    {
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpay: razorpayOrder
        ? {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
          }
        : null,
    },
    { status: 201 },
  );
}
