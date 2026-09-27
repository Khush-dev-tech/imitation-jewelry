"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatINR } from "@/lib/utils";

interface ProductRow {
  id: string;
  name: string;
  price: string;
  stockStatus: "in_stock" | "out_of_stock";
  isActive: boolean;
  images: { url: string; altText: string }[];
  categories: { category: { name: string } }[];
}

export function ProductList({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function toggleStock(product: ProductRow) {
    setTogglingId(product.id);
    const nextStatus = product.stockStatus === "in_stock" ? "out_of_stock" : "in_stock";
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockStatus: nextStatus }),
      });
      if (!response.ok) {
        toast({ title: "Could not update stock status", variant: "error" });
        return;
      }
      toast({
        title: nextStatus === "in_stock" ? "Marked in stock" : "Marked out of stock",
        variant: "success",
      });
      router.refresh();
    } finally {
      setTogglingId(null);
    }
  }

  async function toggleActive(product: ProductRow) {
    setTogglingId(product.id);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (!response.ok) {
        toast({ title: "Could not update product", variant: "error" });
        return;
      }
      toast({
        title: product.isActive ? "Product deactivated" : "Product reactivated",
        variant: "success",
      });
      router.refresh();
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl text-charcoal">Products</h1>
        <Link href="/admin/products/new">
          <Button variant="primary">Add Product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="font-body text-sm text-charcoal-muted">
          No products yet — add your first product.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-hairline bg-ivory">
          <table className="w-full text-left font-body text-sm">
            <thead className="border-b border-hairline text-charcoal-muted">
              <tr>
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Stock</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="flex items-center gap-3 p-3">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local/dev upload URLs, next/image domain config comes with Cloudinary in a later phase
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].altText}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : null}
                    <span className="font-medium text-charcoal">{product.name}</span>
                  </td>
                  <td className="p-3 text-charcoal-muted">
                    {product.categories.map((c) => c.category.name).join(", ") || "—"}
                  </td>
                  <td className="p-3 text-charcoal">{formatINR(product.price)}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleStock(product)}
                      disabled={togglingId === product.id}
                      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
                    >
                      <Badge variant={product.stockStatus === "in_stock" ? "new" : "outOfStock"}>
                        {product.stockStatus === "in_stock" ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-3">
                    {!product.isActive ? <Badge variant="outOfStock">Inactive</Badge> : "Active"}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/${product.id}`}>
                        <Button variant="secondary">Edit</Button>
                      </Link>
                      <Button
                        variant="tertiary"
                        loading={togglingId === product.id}
                        onClick={() => toggleActive(product)}
                      >
                        {product.isActive ? "Deactivate" : "Reactivate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
