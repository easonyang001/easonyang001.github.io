const API_BASE = import.meta.env.VITE_API_BASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type UploadImageType = "news" | "projects" | "people" | "publications";

export interface UploadedImage {
  publicUrl: string;
  path: string;
}

/**
 * PUTs straight to Supabase Storage using a signed URL from the backend --
 * fetch() has no upload-progress event, so this needs XHR to report a
 * percentage. Body shape (FormData with "cacheControl" + an unnamed file
 * field) matches what @supabase/storage-js sends for uploadToSignedUrl,
 * since a signed upload URL still expects that wire format.
 */
function putWithProgress(signedUrl: string, file: File, onProgress?: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    if (SUPABASE_ANON_KEY) {
      xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
      xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_ANON_KEY}`);
    }
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    xhr.send(body);
  });
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_MIME.includes(file.type)) return "Unsupported file type. Use JPEG, PNG, WebP, or GIF.";
  if (file.size > MAX_IMAGE_SIZE) return "File is too large. Max 5MB.";
  return null;
}

export async function uploadImageFile(
  token: string,
  type: UploadImageType,
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadedImage> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  const res = await fetch(`${API_BASE}/api/images/upload-url`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, type, contentType: file.type }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  const { uploadUrl, publicUrl, path } = await res.json();

  await putWithProgress(uploadUrl, file, onProgress);

  return { publicUrl, path };
}

export async function deleteImageFile(token: string, path: string): Promise<void> {
  await fetch(`${API_BASE}/api/images/${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
