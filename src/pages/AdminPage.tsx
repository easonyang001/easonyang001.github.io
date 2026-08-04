import { useEffect, useState } from "react";
import { Segmented, SegmentedButton } from "../components/Segmented.tsx";
import { CONTENT_TYPES } from "../lib/admin/contentFields.ts";
import {
  archiveDraft,
  createDraft,
  deleteDraft,
  getDraft,
  listDrafts,
  publishDraft,
  updateDraft,
  type ContentType,
  type DraftSummary,
} from "../lib/admin/content.ts";
import { useAuth } from "../lib/auth/useAuth.ts";
import ImageUpload from "../components/admin/ImageUpload.tsx";
import RichTextEditor from "../components/admin/RichTextEditor.tsx";
import TagInput from "../components/admin/TagInput.tsx";
import NewsDraftsAdmin from "../components/admin/NewsDraftsAdmin.tsx";

/** Normalizes free typing into the ^[a-z0-9-]+$ shape the backend requires. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function LoginForm({
  onLogin,
  error,
}: {
  onLogin: (username: string, password: string) => void;
  error: string | null;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onLogin(username, password);
    setSubmitting(false);
  };

  return (
    <div className="section-container border-t border-border">
      <div className="max-w-prose">
        <h1 className="text-h2 text-text-primary">Sign In</h1>
        <p className="mt-4 text-small text-text-secondary">
          This area is restricted. Sign in with an admin account to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 max-w-md space-y-4">
        <div>
          <label className="mb-2 block font-mono text-mono-label uppercase text-text-muted">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
          />
        </div>
        <div>
          <label className="mb-2 block font-mono text-mono-label uppercase text-text-muted">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
          />
        </div>
        {error && <p className="text-small text-text-secondary">Error: {error}</p>}
        <button
          type="submit"
          disabled={!username || !password || submitting}
          className="rounded-md bg-accent px-6 py-3 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const { status, error, token, login, logout } = useAuth();

  if (status === "checking") {
    return <div className="section-container border-t border-border" />;
  }

  if (status === "anonymous" || !token) {
    return <LoginForm onLogin={login} error={error} />;
  }

  return <ContentAdmin token={token} onLogout={logout} />;
}

const STATUS_LABEL_CLASS: Record<string, string> = {
  draft: "text-text-muted",
  published: "text-accent",
  archived: "text-text-muted",
};

function ContentAdmin({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [section, setSection] = useState<"content" | "news-drafts">("content");
  const [typeKey, setTypeKey] = useState<ContentType>(CONTENT_TYPES[0].key);
  const config = CONTENT_TYPES.find((c) => c.key === typeKey)!;

  const [drafts, setDrafts] = useState<DraftSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<{ prUrl: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setDrafts(await listDrafts(token, typeKey));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEditingId(null);
    setFormValues(null);
    setPublishResult(null);
    setActionError(null);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeKey]);

  const startNew = () => {
    setFormValues(config.emptyItem());
    setEditingId("new");
    setSaveError(null);
  };

  const startEdit = async (id: string) => {
    setSaveError(null);
    try {
      const draft = await getDraft(token, typeKey, id);
      setFormValues(draft);
      setEditingId(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormValues(null);
    setSaveError(null);
  };

  const saveForm = async () => {
    if (!formValues) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (editingId === "new") {
        await createDraft(token, typeKey, formValues);
      } else if (editingId) {
        await updateDraft(token, typeKey, editingId, formValues);
      }
      setEditingId(null);
      setFormValues(null);
      await load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: string) => {
    setPublishingId(id);
    setActionError(null);
    setPublishResult(null);
    try {
      const result = await publishDraft(token, typeKey, id);
      setPublishResult(result);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setPublishingId(null);
    }
  };

  const handleArchive = async (id: string) => {
    setActionError(null);
    try {
      await archiveDraft(token, typeKey, id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this draft? This cannot be undone.")) return;
    setActionError(null);
    try {
      await deleteDraft(token, typeKey, id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="section-container border-t border-border">
      <div className="max-w-prose">
        <div className="flex items-center justify-between">
          <h1 className="text-h2 text-text-primary">Content Admin</h1>
          <button
            onClick={onLogout}
            className="text-small font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            Log out
          </button>
        </div>
        <p className="mt-4 font-mono text-mono-label uppercase text-text-muted">
          Every change opens a pull request. Nothing is ever written to main directly.
        </p>
      </div>

      <div className="mt-10">
        <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Section</p>
        <Segmented>
          <SegmentedButton active={section === "content"} onClick={() => setSection("content")}>
            Content
          </SegmentedButton>
          <SegmentedButton active={section === "news-drafts"} onClick={() => setSection("news-drafts")}>
            News Drafts
          </SegmentedButton>
        </Segmented>
      </div>

      {section === "news-drafts" && <NewsDraftsAdmin token={token} />}

      {section === "content" && (
        <>
          <div className="mt-10">
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Content Type</p>
            <Segmented>
              {CONTENT_TYPES.map((c) => (
                <SegmentedButton key={c.key} active={typeKey === c.key} onClick={() => setTypeKey(c.key)}>
                  {c.label}
                </SegmentedButton>
              ))}
            </Segmented>
          </div>

          {editingId === null && (
        <div className="mt-8 max-w-2xl">
          <button
            onClick={startNew}
            className="rounded-md bg-accent px-4 py-2 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover"
          >
            Add New
          </button>

          {loading && <p className="mt-6 text-small text-text-secondary">Loading…</p>}
          {loadError && <p className="mt-6 text-small text-text-secondary">Error: {loadError}</p>}
          {actionError && <p className="mt-6 text-small text-text-secondary">Error: {actionError}</p>}
          {publishResult && (
            <p className="mt-6 text-small text-text-secondary">
              Opened{" "}
              <a
                href={publishResult.prUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-accent hover:text-accent-hover"
              >
                pull request
              </a>{" "}
              — review and merge on GitHub.
            </p>
          )}

          {drafts && (
            <ul className="mt-8 divide-y divide-border border-t border-border">
              {drafts.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-body text-text-primary">{String(item[config.titleKey] ?? item[config.idKey])}</p>
                    <p className="font-mono text-mono-label uppercase text-text-muted">
                      {String(item[config.idKey])} ·{" "}
                      <span className={STATUS_LABEL_CLASS[item.status]}>{item.status}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      onClick={() => void startEdit(item.id)}
                      className="text-small font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
                    >
                      Edit
                    </button>
                    {item.status !== "published" && (
                      <button
                        onClick={() => void handlePublish(item.id)}
                        disabled={publishingId === item.id}
                        className="text-small font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {publishingId === item.id ? "Publishing…" : "Publish"}
                      </button>
                    )}
                    {item.status !== "archived" && (
                      <button
                        onClick={() => void handleArchive(item.id)}
                        className="text-small font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
                      >
                        Archive
                      </button>
                    )}
                    {item.status === "draft" && (
                      <button
                        onClick={() => void handleDelete(item.id)}
                        className="text-small font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
              {drafts.length === 0 && <p className="py-4 text-small text-text-secondary">No entries yet.</p>}
            </ul>
          )}
        </div>
      )}

      {editingId !== null && formValues && (
        <div className="glass-card mt-8 max-w-2xl space-y-5 p-8">
          <p className="font-mono text-mono-label uppercase text-text-muted">
            {editingId === "new" ? "New Entry" : "Edit Entry"}
          </p>

          {config.fields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-small text-text-secondary">
                {field.label}
                {field.required && " *"}
              </label>

              {field.kind === "richtext" ? (
                <RichTextEditor
                  value={String(formValues[field.key] ?? "")}
                  onChange={(html) => setFormValues({ ...formValues, [field.key]: html })}
                  token={token}
                  imageType={field.imageType!}
                />
              ) : field.kind === "image" ? (
                <ImageUpload
                  type={field.imageType!}
                  token={token}
                  currentUrl={(formValues[field.key] as string | null) ?? undefined}
                  onUpload={(url, path) =>
                    setFormValues({ ...formValues, [field.key]: url, ...(field.pathKey ? { [field.pathKey]: path } : {}) })
                  }
                  onDelete={() =>
                    setFormValues({ ...formValues, [field.key]: null, ...(field.pathKey ? { [field.pathKey]: null } : {}) })
                  }
                />
              ) : field.kind === "tags" ? (
                <TagInput
                  value={(formValues[field.key] as string[]) ?? []}
                  onChange={(tags) => setFormValues({ ...formValues, [field.key]: tags })}
                />
              ) : field.kind === "select" ? (
                <select
                  value={String(formValues[field.key] ?? "")}
                  onChange={(e) => setFormValues({ ...formValues, [field.key]: e.target.value })}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
                >
                  {(field.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.kind === "textarea" ? (
                <textarea
                  rows={4}
                  value={String(formValues[field.key] ?? "")}
                  onChange={(e) => setFormValues({ ...formValues, [field.key]: e.target.value })}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
                />
              ) : field.kind === "code" ? (
                <textarea
                  rows={6}
                  value={String(formValues[field.key] ?? "")}
                  onChange={(e) => setFormValues({ ...formValues, [field.key]: e.target.value })}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2 font-mono text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
                />
              ) : field.kind === "number" ? (
                <input
                  type="number"
                  value={String(formValues[field.key] ?? "")}
                  onChange={(e) => setFormValues({ ...formValues, [field.key]: Number(e.target.value) })}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
                />
              ) : field.kind === "date" ? (
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="YYYY-MM-DD"
                  pattern="\d{4}-\d{2}-\d{2}"
                  value={String(formValues[field.key] ?? "")}
                  onChange={(e) => setFormValues({ ...formValues, [field.key]: e.target.value })}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2 font-mono text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
                />
              ) : (
                <input
                  type="text"
                  value={String(formValues[field.key] ?? "")}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      [field.key]: field.slugify ? slugify(e.target.value) : e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
                />
              )}
            </div>
          ))}

          {saveError && <p className="text-small text-text-secondary">Error: {saveError}</p>}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => void saveForm()}
              disabled={saving}
              className="rounded-md bg-accent px-4 py-2 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save Draft"}
            </button>
            <button
              onClick={cancelEdit}
              className="rounded-md border border-border px-4 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
