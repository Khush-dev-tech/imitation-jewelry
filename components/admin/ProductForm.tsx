"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/slugify";

interface CategoryOption {
  id: string;
  name: string;
}

interface ImageDraft {
  url: string;
  altText: string;
}

interface VariantDraft {
  sku: string;
  colour: string;
  size: string;
  set: string;
  priceOverride: string;
  stockStatus: "" | "in_stock" | "out_of_stock";
}

export interface ProductFormInitialValues {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  materialDetails: string;
  careInstructions: string;
  price: string;
  compareAtPrice: string;
  stockStatus: "in_stock" | "out_of_stock";
  isNewArrival: boolean;
  isBestSeller: boolean;
  metaTitle: string;
  metaDescription: string;
  categoryIds: string[];
  images: ImageDraft[];
  variants: VariantDraft[];
}

const EMPTY_VALUES: ProductFormInitialValues = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  materialDetails: "",
  careInstructions: "",
  price: "",
  compareAtPrice: "",
  stockStatus: "in_stock",
  isNewArrival: false,
  isBestSeller: false,
  metaTitle: "",
  metaDescription: "",
  categoryIds: [],
  images: [],
  variants: [],
};

export function ProductForm({
  categories,
  initialValues,
}: {
  categories: CategoryOption[];
  initialValues?: ProductFormInitialValues;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = Boolean(initialValues?.id);
  const [values, setValues] = useState<ProductFormInitialValues>(initialValues ?? EMPTY_VALUES);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof ProductFormInitialValues>(
    key: K,
    value: ProductFormInitialValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleNameChange(name: string) {
    update("name", name);
    if (!slugTouched) {
      update("slug", slugify(name));
    }
  }

  function toggleCategory(id: string) {
    setValues((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(id)
        ? current.categoryIds.filter((c) => c !== id)
        : [...current.categoryIds, id],
    }));
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrors([]);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setErrors([data.error ?? "Upload failed."]);
        return;
      }
      update("images", [...values.images, { url: data.url, altText: "" }]);
    } catch {
      setErrors(["Network error during upload — please try again."]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function updateImageAlt(index: number, altText: string) {
    const next = [...values.images];
    next[index] = { ...next[index], altText };
    update("images", next);
  }

  function removeImage(index: number) {
    update(
      "images",
      values.images.filter((_, i) => i !== index),
    );
  }

  function addVariant() {
    update("variants", [
      ...values.variants,
      { sku: "", colour: "", size: "", set: "", priceOverride: "", stockStatus: "" },
    ]);
  }

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    const next = [...values.variants];
    next[index] = { ...next[index], ...patch };
    update("variants", next);
  }

  function removeVariant(index: number) {
    update(
      "variants",
      values.variants.filter((_, i) => i !== index),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors([]);

    // Client-side pre-check mirrors PRD §8.12: name, price, and at least
    // one image (with alt text) are the only save-blocking fields.
    const localErrors: string[] = [];
    if (!values.name.trim()) localErrors.push("Product name is required.");
    if (!values.price || Number(values.price) <= 0)
      localErrors.push("Price must be greater than 0.");
    if (values.images.length === 0) localErrors.push("At least one product image is required.");
    if (values.images.some((img) => !img.altText.trim())) {
      localErrors.push("Every image needs alt text before you can save.");
    }
    if (localErrors.length > 0) {
      setErrors(localErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        sku: values.sku || null,
        description: values.description || null,
        materialDetails: values.materialDetails || null,
        careInstructions: values.careInstructions || null,
        price: Number(values.price),
        compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : null,
        stockStatus: values.stockStatus,
        isNewArrival: values.isNewArrival,
        isBestSeller: values.isBestSeller,
        metaTitle: values.metaTitle || null,
        metaDescription: values.metaDescription || null,
        categoryIds: values.categoryIds,
        images: values.images.map((img, index) => ({ ...img, sortOrder: index })),
        variants: values.variants
          .filter((v) => v.sku.trim())
          .map((v) => {
            const attributes: Record<string, string> = {};
            if (v.colour.trim()) attributes.colour = v.colour.trim();
            if (v.size.trim()) attributes.size = v.size.trim();
            if (v.set.trim()) attributes.set = v.set.trim();
            return {
              sku: v.sku.trim(),
              attributes,
              priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
              stockStatus: v.stockStatus || null,
            };
          }),
      };

      const url = isEditing ? `/api/admin/products/${initialValues!.id}` : "/api/admin/products";
      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : (data.error?.formErrors?.[0] ?? "Could not save product.");
        setErrors([message]);
        return;
      }

      toast({ title: isEditing ? "Product updated" : "Product created", variant: "success" });
      router.push("/admin/products");
      router.refresh();
    } catch {
      setErrors(["Network error — please try again."]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-16">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Product Name"
          required
          value={values.name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
        <Input
          label="Slug"
          required
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            update("slug", e.target.value);
          }}
          helperText="Used in the product URL."
        />
        <Input
          label="Product Code (SKU)"
          value={values.sku}
          onChange={(e) => update("sku", e.target.value)}
          helperText="Optional. Shown in the WhatsApp enquiry message."
        />
        <Input
          label="Price (INR)"
          type="number"
          min="0"
          step="0.01"
          required
          value={values.price}
          onChange={(e) => update("price", e.target.value)}
        />
        <Input
          label="Compare-at Price (INR)"
          type="number"
          min="0"
          step="0.01"
          value={values.compareAtPrice}
          onChange={(e) => update("compareAtPrice", e.target.value)}
          helperText="Optional. Must be higher than price — drives the Sale badge."
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="font-body text-sm font-medium text-charcoal">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="rounded-md border border-hairline bg-ivory p-3 font-body text-base text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm font-medium text-charcoal">
            Material / Plating Details
          </label>
          <textarea
            value={values.materialDetails}
            onChange={(e) => update("materialDetails", e.target.value)}
            rows={3}
            className="rounded-md border border-hairline bg-ivory p-3 font-body text-base text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm font-medium text-charcoal">Care Instructions</label>
          <textarea
            value={values.careInstructions}
            onChange={(e) => update("careInstructions", e.target.value)}
            rows={3}
            className="rounded-md border border-hairline bg-ivory p-3 font-body text-base text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-body text-sm font-medium text-charcoal">Stock status</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 font-body text-sm text-charcoal">
            <input
              type="radio"
              name="stockStatus"
              checked={values.stockStatus === "in_stock"}
              onChange={() => update("stockStatus", "in_stock")}
            />
            In Stock
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-charcoal">
            <input
              type="radio"
              name="stockStatus"
              checked={values.stockStatus === "out_of_stock"}
              onChange={() => update("stockStatus", "out_of_stock")}
            />
            Out of Stock
          </label>
        </div>
      </fieldset>

      <fieldset className="flex gap-6">
        <label className="flex items-center gap-2 font-body text-sm text-charcoal">
          <input
            type="checkbox"
            checked={values.isNewArrival}
            onChange={(e) => update("isNewArrival", e.target.checked)}
          />
          New Arrival
        </label>
        <label className="flex items-center gap-2 font-body text-sm text-charcoal">
          <input
            type="checkbox"
            checked={values.isBestSeller}
            onChange={(e) => update("isBestSeller", e.target.checked)}
          />
          Best Seller
        </label>
      </fieldset>

      {categories.length > 0 ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="font-body text-sm font-medium text-charcoal">Categories</legend>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 rounded-md border border-hairline px-3 py-2 font-body text-sm text-charcoal"
              >
                <input
                  type="checkbox"
                  checked={values.categoryIds.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-col gap-3">
        <p className="font-body text-sm font-medium text-charcoal">
          Product Images <span className="text-error">*</span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelected}
          disabled={uploading}
          className="font-body text-sm"
        />
        {uploading ? <p className="font-body text-sm text-charcoal-muted">Uploading…</p> : null}
        {values.images.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {values.images.map((image, index) => (
              <li
                key={image.url}
                className="flex items-center gap-3 rounded-md border border-hairline p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local/dev upload URLs */}
                <img src={image.url} alt="" className="h-16 w-16 rounded object-cover" />
                <div className="flex-1">
                  <Input
                    label="Alt text"
                    required
                    value={image.altText}
                    onChange={(e) => updateImageAlt(index, e.target.value)}
                  />
                </div>
                <Button type="button" variant="tertiary" onClick={() => removeImage(index)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-body text-sm font-medium text-charcoal">
            Variants{" "}
            <span className="font-normal text-charcoal-muted">(optional — colour, size, set)</span>
          </p>
          <Button type="button" variant="secondary" onClick={addVariant}>
            Add Variant
          </Button>
        </div>
        {values.variants.map((variant, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-md border border-hairline p-3 sm:grid-cols-6"
          >
            <div className="sm:col-span-2">
              <Input
                label="Variant SKU"
                required
                value={variant.sku}
                onChange={(e) => updateVariant(index, { sku: e.target.value })}
              />
            </div>
            <Input
              label="Colour"
              value={variant.colour}
              onChange={(e) => updateVariant(index, { colour: e.target.value })}
            />
            <Input
              label="Size"
              value={variant.size}
              onChange={(e) => updateVariant(index, { size: e.target.value })}
            />
            <Input
              label="Set"
              value={variant.set}
              onChange={(e) => updateVariant(index, { set: e.target.value })}
            />
            <div className="flex items-end">
              <Button type="button" variant="tertiary" onClick={() => removeVariant(index)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {errors.length > 0 ? (
        <div role="alert" className="flex flex-col gap-1 rounded-md border border-error p-3">
          {errors.map((error) => (
            <p key={error} className="flex items-center gap-1 font-body text-sm text-error">
              <span aria-hidden="true">⚠</span> {error}
            </p>
          ))}
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" variant="primary" loading={saving}>
          Save
        </Button>
        <Button type="button" variant="tertiary" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
