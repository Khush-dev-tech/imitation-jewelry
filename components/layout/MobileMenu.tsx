"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { CATEGORIES } from "@/lib/categories";

/**
 * Mobile menu — UI/UX Brief §5.3: category navigation lives in a
 * full-screen/slide-in mobile menu, not a cramped horizontal scroll.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-11 w-11 items-center justify-center rounded-md text-charcoal hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal lg:hidden"
      >
        <Menu aria-hidden="true" className="h-6 w-6" />
      </button>

      <Drawer open={open} onOpenChange={setOpen} side="left" title="Menu">
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
          <Link
            href="/shop"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2.5 font-body text-base font-medium text-charcoal hover:bg-beige"
          >
            Shop All
          </Link>

          <p className="mt-3 px-3 font-body text-xs font-semibold uppercase tracking-wide text-charcoal-muted">
            Categories
          </p>
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 font-body text-base text-charcoal hover:bg-beige"
            >
              {category.name}
            </Link>
          ))}

          <div className="mt-3 border-t border-hairline pt-3">
            <Link
              href="/wholesale"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 font-body text-base font-medium text-maroon hover:bg-beige"
            >
              Wholesale / Bulk Enquiry
            </Link>
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 font-body text-base text-charcoal hover:bg-beige"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 font-body text-base text-charcoal hover:bg-beige"
            >
              Contact Us
            </Link>
          </div>
        </nav>
      </Drawer>
    </>
  );
}
