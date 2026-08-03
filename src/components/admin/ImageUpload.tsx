import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type ImageUploadType = "news" | "projects" | "people" | "publications";

interface ImageUploadProps {
  type: ImageUploadType;
  token: string;
  onUpload: (url: string, path: string) => void;
  onDelete?: (path: string) => void;
  currentUrl?: string;
  accept?: string;
}

/**
 * PUTs straight to Supabase Storage using the signed URL from the backend --
 * fetch() has no upload-progress event, so this needs XHR to show a percentage.
 * Body shape (FormData with "cacheControl" + an unnamed file field) matches
 * what @supabase/storage-js sends for uploadToSignedUrl, since a signed
 * upload URL still expects that wire format.
 */
function uploadWithProgress(signedUrl: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    if (SUPABASE_ANON_KEY) {
      xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
      xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_ANON_KEY}`);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
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

export default function ImageUpload({ type, token, onUpload, onDelete, currentUrl, accept = "image/*" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [path, setPath] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);

    if (!ALLOWED_MIME.includes(file.type)) {
      setError("Unsupported file type. Use JPEG, PNG, WebP, or GIF.");
      setStatus("error");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File is too large. Max 5MB.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setProgress(0);

    try {
      const res = await fetch(`${API_BASE}/api/images/upload-url`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, type, contentType: file.type }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed: ${res.status}`);
      }
      const { uploadUrl, publicUrl, path: objectPath } = await res.json();

      await uploadWithProgress(uploadUrl, file, setProgress);

      setPreview(publicUrl);
      setPath(objectPath);
      setStatus("idle");
      onUpload(publicUrl, objectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void upload(file);
  };

  const handleDelete = async () => {
    const deletingPath = path;
    setPreview(null);
    setPath(null);
    setStatus("idle");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";

    if (deletingPath) {
      try {
        await fetch(`${API_BASE}/api/images/${deletingPath}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Best-effort -- the admin can retry the delete from the storage
        // dashboard if this fails; the reference is already cleared locally.
      }
      onDelete?.(deletingPath);
    }
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />

      {preview ? (
        <div className="flex items-center gap-4">
          <img src={preview} alt="" className="h-20 w-20 rounded-md border border-border object-cover" />
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1 text-small font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            <X size={14} /> Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading"}
          className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "uploading" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Uploading… {progress}%
            </>
          ) : (
            <>
              <ImagePlus size={14} /> Upload image
            </>
          )}
        </button>
      )}

      {status === "error" && error && (
        <div className="mt-2 flex items-center gap-3">
          <p className="text-small text-text-secondary">Error: {error}</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-small font-medium text-accent hover:text-accent-hover"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
