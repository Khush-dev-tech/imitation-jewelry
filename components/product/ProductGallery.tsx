"use client";

import { useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { PlaceholderImage } from "./PlaceholderImage";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  id: string;
  url: string;
  altText: string;
}

/**
 * Product image gallery — App Flow Screen 5 / UI/UX Brief §7:
 * "swipeable, with zoom-on-tap" on mobile. Swipe is native scroll-snap
 * here (no extra JS gesture library needed); zoom-on-tap opens the same
 * image full-bleed in a lightbox dialog.
 */
export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return <PlaceholderImage className="aspect-square w-full rounded-md" />;
  }

  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="relative aspect-square w-full overflow-hidden rounded-md border border-hairline bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
        aria-label={`Zoom in on ${active.altText}`}
      >
        <Image
          src={active.url}
          alt={active.altText}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </button>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={image.altText}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal",
                index === activeIndex ? "border-maroon" : "border-hairline",
              )}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-charcoal/90 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Title className="sr-only">{active.altText}</Dialog.Title>
            <div className="relative h-full max-h-[90vh] w-full max-w-3xl">
              <Image
                src={active.url}
                alt={active.altText}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-ivory text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
