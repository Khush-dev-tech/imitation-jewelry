"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useCartStore } from "@/lib/store/cart";
import { buildProductEnquiryLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { formatINR, cn } from "@/lib/utils";
import { ProductGallery, type GalleryImage } from "./ProductGallery";
import { QuantitySelector } from "./QuantitySelector";
import { VariantSelector, variantLabel, type VariantOption } from "./VariantSelector";

export interface ProductDetailData {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  stockStatus: "in_stock" | "out_of_stock";
  images: GalleryImage[];
  variants: VariantOption[];
}

export function ProductDetailView({ product }: { product: ProductDetailData }) {
  const router = useRouter();
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [stickyVisible, setStickyVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product.variants, selectedVariantId],
  );

  const effectivePrice = selectedVariant?.priceOverride ?? product.price;
  const effectiveStock = selectedVariant?.stockStatus ?? product.stockStatus;
  const isOutOfStock = effectiveStock === "out_of_stock";
  const isOnSale = product.compareAtPrice != null && product.compareAtPrice > product.price;

  const whatsappLink = buildProductEnquiryLink({
    name: selectedVariant
      ? `${product.name} (${variantLabel(selectedVariant.attributes)})`
      : product.name,
    sku: product.sku,
    price: effectivePrice,
  });

  function handleAddToCart() {
    const image = product.images[0];
    addItem(
      {
        key: `${product.id}:${selectedVariant?.id ?? "base"}`,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        variantId: selectedVariant?.id ?? null,
        variantLabel: selectedVariant ? variantLabel(selectedVariant.attributes) : null,
        imageUrl: image?.url ?? null,
        imageAlt: image?.altText ?? null,
        unitPrice: effectivePrice,
      },
      quantity,
    );
    toast({
      title: "Added to cart",
      description: `${product.name} × ${quantity}`,
      variant: "success",
    });
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/checkout");
  }

  const actions = isOutOfStock ? (
    <div className="flex flex-col gap-3">
      <p className="font-body text-sm font-medium text-charcoal-muted">
        This {selectedVariant ? "option" : "product"} is currently out of stock.
      </p>
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
        <Button variant="whatsapp" className="w-full">
          <WhatsAppIcon className="h-4 w-4" />
          Out of Stock — Enquire on WhatsApp
        </Button>
      </a>
    </div>
  ) : (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <QuantitySelector value={quantity} onChange={setQuantity} />
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Enquire on WhatsApp"
          className="flex h-11 w-11 items-center justify-center rounded-md bg-whatsapp text-white hover:bg-whatsapp-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
        >
          <WhatsAppIcon className="h-5 w-5" />
        </a>
      </div>
      <div className="flex gap-3">
        <Button variant="primary" className="flex-1" onClick={handleAddToCart}>
          Add to Cart
        </Button>
        <Button variant="secondary" className="flex-1" onClick={handleBuyNow}>
          Buy Now
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} />

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-heading text-2xl text-charcoal sm:text-3xl">{product.name}</h1>
            {product.sku ? (
              <p className="mt-1 font-body text-xs text-charcoal-muted">Code: {product.sku}</p>
            ) : null}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-body text-2xl font-semibold text-maroon">
              {formatINR(effectivePrice)}
            </span>
            {isOnSale ? (
              <span className="font-body text-base text-charcoal-muted line-through">
                {formatINR(product.compareAtPrice!)}
              </span>
            ) : null}
          </div>

          <VariantSelector
            variants={product.variants}
            selectedId={selectedVariantId}
            onSelect={setSelectedVariantId}
          />

          {actions}

          <div ref={sentinelRef} aria-hidden="true" />
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-ivory p-4 shadow-none transition-transform duration-150 sm:hidden",
          stickyVisible ? "translate-y-0" : "translate-y-full",
        )}
      >
        {isOutOfStock ? (
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button variant="whatsapp" className="w-full">
              <WhatsAppIcon className="h-4 w-4" />
              Enquire on WhatsApp
            </Button>
          </a>
        ) : (
          <div className="flex items-center gap-2">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Enquire on WhatsApp"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-whatsapp text-white hover:bg-whatsapp-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <Button variant="primary" className="flex-1" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button variant="secondary" className="flex-1" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
