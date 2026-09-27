import { beforeEach, describe, expect, it } from "vitest";

// Minimal in-memory localStorage shim — the cart store's persist
// middleware needs `window.localStorage` to exist, which the Node test
// environment doesn't provide by default. Avoids pulling in jsdom just
// for this one dependency.
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

(globalThis as unknown as { localStorage: MemoryStorage }).localStorage = new MemoryStorage();

const { useCartStore } = await import("./cart");
type CartItem = ReturnType<typeof useCartStore.getState>["items"][number];

function baseItem(overrides: Partial<Omit<CartItem, "quantity">> = {}) {
  return {
    key: "product-1:base",
    productId: "product-1",
    productSlug: "test-product",
    productName: "Test Product",
    variantId: null,
    variantLabel: null,
    imageUrl: null,
    imageAlt: null,
    unitPrice: 500,
    ...overrides,
  };
}

describe("cart store", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("adds a new item", () => {
    useCartStore.getState().addItem(baseItem(), 2);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("increments quantity instead of duplicating when the same key is added again", () => {
    const item = baseItem();
    useCartStore.getState().addItem(item, 1);
    useCartStore.getState().addItem(item, 2);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("treats different variants of the same product as separate line items", () => {
    useCartStore.getState().addItem(baseItem({ key: "product-1:gold", variantLabel: "Gold" }), 1);
    useCartStore
      .getState()
      .addItem(baseItem({ key: "product-1:rose-gold", variantLabel: "Rose Gold" }), 1);
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("updateQuantity changes only the targeted item", () => {
    useCartStore.getState().addItem(baseItem({ key: "a" }), 1);
    useCartStore.getState().addItem(baseItem({ key: "b" }), 1);
    useCartStore.getState().updateQuantity("a", 5);
    const items = useCartStore.getState().items;
    expect(items.find((i) => i.key === "a")?.quantity).toBe(5);
    expect(items.find((i) => i.key === "b")?.quantity).toBe(1);
  });

  it("removeItem removes only the targeted item", () => {
    useCartStore.getState().addItem(baseItem({ key: "a" }), 1);
    useCartStore.getState().addItem(baseItem({ key: "b" }), 1);
    useCartStore.getState().removeItem("a");
    expect(useCartStore.getState().items.map((i) => i.key)).toEqual(["b"]);
  });

  it("clear empties the cart", () => {
    useCartStore.getState().addItem(baseItem(), 1);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("itemCount sums quantities across all line items", () => {
    useCartStore.getState().addItem(baseItem({ key: "a" }), 2);
    useCartStore.getState().addItem(baseItem({ key: "b" }), 3);
    expect(useCartStore.getState().itemCount()).toBe(5);
  });

  it("subtotal sums unitPrice * quantity across all line items", () => {
    useCartStore.getState().addItem(baseItem({ key: "a", unitPrice: 500 }), 2);
    useCartStore.getState().addItem(baseItem({ key: "b", unitPrice: 1000 }), 1);
    expect(useCartStore.getState().subtotal()).toBe(2000);
  });
});
