import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Image upload — TRD §4 names Cloudinary as the recommended CDN, but no
 * Cloudinary credentials are configured yet (.env.example). This module
 * is the single point of integration named in docs/06-implementation-plan.md
 * ("web/lib/uploads.ts"): it currently saves to local disk under
 * `public/uploads/`, so admin product-image upload is fully testable
 * end-to-end right now. Swapping to Cloudinary later means changing the
 * body of `saveProductImage` only — nothing that calls it needs to change.
 */

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  url: string;
}

export async function saveProductImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, or WebP images are allowed.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image must be smaller than 5MB.");
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return { url: `/uploads/products/${filename}` };
}
