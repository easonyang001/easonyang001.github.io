import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { deleteImageFile, uploadImageFile, type UploadImageType } from "../../lib/admin/uploadImage.ts";

export type { UploadImageType as ImageUploadType };

interface ImageUploadProps {
  type: UploadImageType;
  token: string;
  onUpload: (url: string, path: string) => void;
  onDelete?: (path: string) => void;
  currentUrl?: string;
  accept?: string;
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
    setStatus("uploading");
    setProgress(0);
    try {
      const { publicUrl, path: objectPath } = await uploadImageFile(token, type, file, setProgress);
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
        await deleteImageFile(token, deletingPath);
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
