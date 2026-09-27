import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Cart state — TRD §2: Zustand, persisted to localStorage for guest carts.
 * Reconciliation to the database `carts`/`cart_items` tables (Backend
 * Schema §4.10-4.11) happens at Checkout (Cart & Checkout phase) — this
 * store is the full source of truth for cart contents until then.
 */

export interface CartItem {
  /** `${productId}:${variantId ?? "base"}` — stable key for dedupe/updates. */
  key: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string | null;
  /** Human-readable summary of the variant's attributes, e.g. "Antique Gold / M". */
  variantLabel: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  unitPrice: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity) => {
        set((state) => {
          const existing = state.items.find((i) => i.key === item.key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === item.key ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },
      updateQuantity: (key, quantity) => {
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        }));
      },
      removeItem: (key) => {
        set((state) => ({ items: state.items.filter((i) => i.key !== key) }));
      },
      clear: () => set({ items: [] }),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: "maruti-cart" },
  ),
);
