"use client";

import { useCartStore } from "@/lib/store/cart";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";

/**
 * Cart item-count badge — UI/UX Brief §5.3 ("cart icon with item-count
 * badge"). Rendered only after mount: cart state lives in localStorage
 * (client-only), so rendering it during SSR would either be wrong or
 * cause a hydration mismatch.
 */
export function CartBadge() {
  const mounted = useHasMounted();
  const count = useCartStore((state) => state.itemCount());

  if (!mounted || count === 0) {
    return null;
  }

  return (
    <span
      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 font-body text-[10px] font-semibold leading-none text-ivory"
      aria-hidden="true"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
