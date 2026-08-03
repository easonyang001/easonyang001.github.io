import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabase } from "../supabase.js";

const BUCKET = "content-images";
const CONTENT_TYPES = ["news", "projects", "people", "publications"] as const;
const MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function isKnownContentType(value: unknown): value is (typeof CONTENT_TYPES)[number] {
  return typeof value === "string" && (CONTENT_TYPES as readonly string[]).includes(value);
}

/** No path separators or traversal -- filename must stay a bare file name. */
function isSafeFilename(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 200 && !/[/\\]/.test(value) && value !== "." && value !== "..";
}

export const imagesRouter = Router();
imagesRouter.use(requireAuth);

imagesRouter.post("/upload-url", async (req, res) => {
  const { filename, type, contentType } = req.body ?? {};

  if (!isKnownContentType(type)) {
    res.status(400).json({ error: "Unknown content type" });
    return;
  }
  if (typeof contentType !== "string" || !MIME_TYPES.includes(contentType)) {
    res.status(400).json({ error: "Unsupported image type" });
    return;
  }
  if (!isSafeFilename(filename)) {
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

  if (!path || path.includes("..") || !isKnownContentType(path.split("/")[0])) {
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
