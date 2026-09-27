"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/slugify";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
}

const EMPTY_FORM: FormState = { name: "", slug: "", description: "" };

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [createError, setCreateError] = useState<string | null>(null);
  const [savingCreate, setSavingCreate] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleCreate() {
    setCreateError(null);
    setSavingCreate(true);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...createForm, description: createForm.description || null }),
      });
      const data = await response.json();
      if (!response.ok) {
        setCreateError(typeof data.error === "string" ? data.error : "Could not save category.");
        return;
      }
      toast({ title: "Category created", variant: "success" });
      setCreating(false);
      setCreateForm(EMPTY_FORM);
      router.refresh();
    } catch {
      setCreateError("Network error — please try again.");
    } finally {
      setSavingCreate(false);
    }
  }

  function startEdit(category: CategoryRow) {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
    });
    setEditError(null);
  }

  async function handleEditSave(id: string) {
    setEditError(null);
    setSavingEdit(true);
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, description: editForm.description || null }),
      });
      const data = await response.json();
      if (!response.ok) {
        setEditError(typeof data.error === "string" ? data.error : "Could not save changes.");
        return;
      }
      toast({ title: "Category updated", variant: "success" });
      setEditingId(null);
      router.refresh();
    } catch {
      setEditError("Network error — please try again.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function toggleActive(category: CategoryRow) {
    setTogglingId(category.id);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      if (!response.ok) {
        toast({ title: "Could not update category", variant: "error" });
        return;
      }
      toast({
        title: category.isActive ? "Category deactivated" : "Category reactivated",
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
        <h1 className="font-heading text-2xl text-charcoal">Categories</h1>
        {!creating ? (
          <Button
            variant="primary"
            onClick={() => {
              setCreating(true);
              setCreateForm(EMPTY_FORM);
              setCreateError(null);
            }}
          >
            Add Category
          </Button>
        ) : null}
      </div>

      {creating ? (
        <div className="flex flex-col gap-3 rounded-md border border-hairline bg-ivory p-4">
          <Input
            label="Name"
            required
            value={createForm.name}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))
            }
          />
          <Input
            label="Slug"
            required
            value={createForm.slug}
            onChange={(e) => setCreateForm((f) => ({ ...f, slug: e.target.value }))}
            helperText="Used in the category URL. Lowercase letters, numbers, hyphens."
          />
          <Input
            label="Description"
            value={createForm.description}
            onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
          />
          {createError ? <p className="font-body text-sm text-error">{createError}</p> : null}
          <div className="flex gap-2">
            <Button variant="primary" loading={savingCreate} onClick={handleCreate}>
              Save
            </Button>
            <Button variant="tertiary" onClick={() => setCreating(false)} disabled={savingCreate}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {categories.length === 0 ? (
        <p className="font-body text-sm text-charcoal-muted">
          No categories yet — add your first category.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-hairline rounded-md border border-hairline bg-ivory">
          {categories.map((category) => (
            <li key={category.id} className="p-4">
              {editingId === category.id ? (
                <div className="flex flex-col gap-3">
                  <Input
                    label="Name"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <Input
                    label="Slug"
                    required
                    value={editForm.slug}
                    onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                  <Input
                    label="Description"
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  {editError ? <p className="font-body text-sm text-error">{editError}</p> : null}
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      loading={savingEdit}
                      onClick={() => handleEditSave(category.id)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="tertiary"
                      onClick={() => setEditingId(null)}
                      disabled={savingEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-body text-base font-medium text-charcoal">
                        {category.name}
                      </p>
                      {!category.isActive ? <Badge variant="outOfStock">Inactive</Badge> : null}
                    </div>
                    <p className="font-body text-sm text-charcoal-muted">/{category.slug}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" onClick={() => startEdit(category)}>
                      Edit
                    </Button>
                    <Button
                      variant="tertiary"
                      loading={togglingId === category.id}
                      onClick={() => toggleActive(category)}
                    >
                      {category.isActive ? "Deactivate" : "Reactivate"}
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
