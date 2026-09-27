"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { PlaceholderImage } from "@/components/product/PlaceholderImage";
import { useCartStore } from "@/lib/store/cart";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { formatINR } from "@/lib/utils";

/**
 * Cart — App Flow Screen 6 / PRD §8.5. Entirely client-rendered: cart
 * state lives in localStorage (TRD §2), so there's nothing meaningful to
 * server-render here, unlike the catalogue pages.
 */
export default function CartPage() {
  const mounted = useHasMounted();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.subtotal());

  if (!mounted) {
    return <Container className="py-8" />;
  }

  if (items.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-heading text-2xl text-charcoal">Your cart is empty</h1>
        <p className="font-body text-charcoal-muted">
          Browse the collection to find something you love.
        </p>
        <Link href="/shop">
          <Button variant="primary">Shop All Jewellery</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-8 py-8 lg:flex-row lg:items-start">
      <div className="flex flex-1 flex-col gap-4">
        <h1 className="font-heading text-2xl text-charcoal">Your Cart</h1>
        <div className="flex flex-col divide-y divide-hairline border-y border-hairline">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 py-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-hairline bg-ivory">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt ?? ""}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <PlaceholderImage label={null} className="h-full w-full" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="font-body text-sm font-medium text-charcoal hover:text-maroon"
                    >
                      {item.productName}
                    </Link>
                    {item.variantLabel ? (
                      <p className="font-body text-xs text-charcoal-muted">{item.variantLabel}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.productName} from cart`}
                    onClick={() => removeItem(item.key)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-charcoal-muted hover:bg-beige hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <QuantitySelector
                    value={item.quantity}
                    onChange={(qty) => updateQuantity(item.key, qty)}
                  />
                  <div className="text-right">
                    <p className="font-body text-sm font-semibold text-charcoal">
                      {formatINR(item.unitPrice * item.quantity)}
                    </p>
                    {item.quantity > 1 ? (
                      <p className="font-body text-xs text-charcoal-muted">
                        {formatINR(item.unitPrice)} each
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link href="/shop" className="font-body text-sm text-maroon hover:underline">
          Continue shopping
        </Link>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-md border border-hairline bg-beige p-6 lg:w-80">
        <h2 className="font-heading text-lg text-charcoal">Order Summary</h2>
        <div className="flex items-center justify-between font-body text-sm text-charcoal">
          <span>Subtotal</span>
          <span className="font-semibold">{formatINR(subtotal)}</span>
        </div>
        <p className="font-body text-xs text-charcoal-muted">
          Delivery charges (if any) are confirmed at checkout.
        </p>
        <Link href="/checkout">
          <Button variant="primary" className="w-full">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </Container>
  );
}
