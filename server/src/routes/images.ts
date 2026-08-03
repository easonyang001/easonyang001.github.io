import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabase } from "../supabase.js";

const BUCKET = "content-images";
const CONTENT_TYPES = ["news", "projects", "people", "publications"] as const;
const MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const EXTENSIONS_BY_MIME: Record<(typeof MIME_TYPES)[number], readonly string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};
const STORED_IMAGE_PATH_RE = /^(news|projects|people|publications)\/\d{10,}-[a-zA-Z0-9._-]{1,200}$/;

function isKnownContentType(value: unknown): value is (typeof CONTENT_TYPES)[number] {
  return typeof value === "string" && (CONTENT_TYPES as readonly string[]).includes(value);
}

/** No path separators or traversal -- filename must stay a bare file name. */
function isSafeFilename(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 200 &&
    /^[a-zA-Z0-9._-]+$/.test(value) &&
    value !== "." &&
    value !== ".."
  );
}

function hasExpectedExtension(filename: string, contentType: (typeof MIME_TYPES)[number]): boolean {
  const lower = filename.toLowerCase();
  return EXTENSIONS_BY_MIME[contentType].some((extension) => lower.endsWith(extension));
}

export const imagesRouter = Router();
imagesRouter.use(requireAuth);

imagesRouter.post("/upload-url", async (req, res) => {
  const { filename, type, contentType } = req.body ?? {};

  if (!isKnownContentType(type)) {
    res.status(400).json({ error: "Unknown content type" });
    return;
  }
  if (typeof contentType !== "string" || !MIME_TYPES.includes(contentType as (typeof MIME_TYPES)[number])) {
    res.status(400).json({ error: "Unsupported image type" });
    return;
  }
  const imageContentType = contentType as (typeof MIME_TYPES)[number];
  if (!isSafeFilename(filename) || !hasExpectedExtension(filename, imageContentType)) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }

  const path = `${type}/${Date.now()}-${filename}`;

  try {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      throw error ?? new Error("No data returned from createSignedUploadUrl");
    }
    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    res.json({ uploadUrl: data.signedUrl, publicUrl: publicData.publicUrl, path });
  } catch (err) {
    console.error("Image upload URL creation failed:", err);
    res.status(502).json({ error: "Failed to create upload URL" });
  }
});

// Wildcard so the path segments (type/filename) arrive as one param.
// Express 4's path-to-regexp puts an unnamed "*" capture in params[0].
imagesRouter.delete("/*", async (req, res) => {
  const path = (req.params as Record<string, string>)[0];

  if (!path || !STORED_IMAGE_PATH_RE.test(path)) {
    res.status(400).json({ error: "Invalid path" });
    return;
  }

  try {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    console.error("Image delete failed:", err);
    res.status(502).json({ error: "Failed to delete image" });
  }
});
