import { useEffect, useState } from "react";
import { Segmented, SegmentedButton } from "../components/Segmented.tsx";
import { ADMIN_ENTITIES, type AdminItem, type FieldConfig } from "../lib/admin/dataFiles.ts";
import { getFile, publishFileChange, verifyToken, type GitHubConfig } from "../lib/admin/github.ts";
import { useAuth } from "../lib/auth/useAuth.ts";

const OWNER = "easonyang001";
const REPO = "easonyang001.github.io";
const TOKEN_STORAGE_KEY = "mrama-admin-github-token";

function fieldValueToText(value: string | string[] | null): string {
  if (value === null) return "";
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

function textToFieldValue(field: FieldConfig, text: string): string | string[] | null {
  if (field.type === "tags") {
    return text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (field.type === "nullable-url") {
    return text.trim() === "" ? null : text.trim();
  }
  return text;
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
        <div className="eyebrow">
          <span className="eyebrow-rule" />
          <span>Admin</span>
        </div>
        <h1 className="mt-4 text-h2 text-text-primary">Sign In</h1>
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
  const { status, error, login, logout } = useAuth();

  if (status === "checking") {
    return <div className="section-container border-t border-border" />;
  }

  if (status === "anonymous") {
    return <LoginForm onLogin={login} error={error} />;
  }

  return <AdminPanel onLogout={logout} />;
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [token, setToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [entityKey, setEntityKey] = useState(ADMIN_ENTITIES[0].key);

  const [items, setItems] = useState<AdminItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<AdminItem | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ prUrl: string; prNumber: number } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const entity = ADMIN_ENTITIES.find((e) => e.key === entityKey)!;
  const config: GitHubConfig = { owner: OWNER, repo: REPO, token };

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    setItems(null);
    setEditingIndex(null);
    setFormValues(null);
    setPublishResult(null);
    setPublishError(null);
  }, [entityKey]);

  const handleTokenChange = (value: string) => {
    setToken(value);
    setTokenStatus("idle");
    if (value.trim() === "") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      localStorage.setItem(TOKEN_STORAGE_KEY, value);
    }
  };

  const handleVerifyToken = async () => {
    setTokenStatus("checking");
    try {
      await verifyToken(config);
      setTokenStatus("valid");
    } catch {
      setTokenStatus("invalid");
    }
  };

  const handleLoad = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const file = await getFile(config, entity.filePath);
      setItems(entity.parse(file.content));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (index: number) => {
    if (!items) return;
    setEditingIndex(index);
    setFormValues({ ...items[index] });
  };

  const startNew = () => {
    setEditingIndex(-1);
    setFormValues(entity.emptyItem());
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setFormValues(null);
  };

  const saveForm = () => {
    if (!items || !formValues || editingIndex === null) return;
    if (editingIndex === -1) {
      setItems([...items, formValues]);
    } else {
      const next = items.slice();
      next[editingIndex] = formValues;
      setItems(next);
    }
    setEditingIndex(null);
    setFormValues(null);
  };

  const deleteItem = (index: number) => {
    if (!items) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!items) return;
    setPublishing(true);
    setPublishError(null);
    setPublishResult(null);
    try {
      const content = entity.serialize(items);
      const result = await publishFileChange(
        config,
        entity.filePath,
        content,
        `admin: update ${entity.label}`,
        `admin: update ${entity.label}`,
        `Edited via the /admin panel. Review before merging — this never writes to main directly.`
      );
      setPublishResult({ prUrl: result.prUrl, prNumber: result.prNumber });
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : String(err));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="section-container border-t border-border">
      <div className="max-w-prose">
        <div className="flex items-center justify-between">
          <div className="eyebrow">
            <span className="eyebrow-rule" />
            <span>Admin</span>
          </div>
          <button
            onClick={onLogout}
            className="text-small font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            Log out
          </button>
        </div>
        <h1 className="mt-4 text-h2 text-text-primary">Content Admin</h1>
        <p className="mt-4 font-mono text-mono-label uppercase text-text-muted">
          Every change opens a pull request. Nothing is ever written to main directly.
        </p>
        <p className="mt-3 text-small text-text-secondary">
          Your GitHub token is stored only in this browser's local storage and is sent only to
          api.github.com — never to any other server. Needs a fine-grained personal access token
          with Contents (read/write) and Pull requests (read/write) permission on this repository.
        </p>
      </div>

      <div className="mt-10 max-w-md">
        <label className="mb-2 block font-mono text-mono-label uppercase text-text-muted">
          GitHub Token
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={token}
            onChange={(e) => handleTokenChange(e.target.value)}
            placeholder="github_pat_..."
            className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
          />
          <button
            onClick={handleVerifyToken}
            disabled={!token || tokenStatus === "checking"}
            className="shrink-0 rounded-md border border-border px-4 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Verify
          </button>
        </div>
        {tokenStatus === "valid" && (
          <p className="mt-2 text-small text-accent">Token valid.</p>
        )}
        {tokenStatus === "invalid" && (
          <p className="mt-2 text-small text-text-secondary">Token rejected by GitHub.</p>
        )}
      </div>

      <div className="mt-10">
        <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Content Type</p>
        <Segmented>
          {ADMIN_ENTITIES.map((e) => (
            <SegmentedButton key={e.key} active={entityKey === e.key} onClick={() => setEntityKey(e.key)}>
              {e.label}
            </SegmentedButton>
          ))}
        </Segmented>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={handleLoad}
          disabled={!token || loading}
          className="rounded-md bg-accent px-4 py-2 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Loading…" : `Load ${entity.label}`}
        </button>
        {items && (
          <button
            onClick={startNew}
            className="rounded-md border border-border px-4 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary"
          >
            Add New
          </button>
        )}
      </div>

      {loadError && <p className="mt-4 text-small text-text-secondary">Error: {loadError}</p>}

      {items && (
        <div className="mt-8 max-w-2xl">
          <ul className="divide-y divide-border border-t border-border">
            {items.map((item, index) => (
              <li key={index} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-body text-text-primary">
                    {String(item.title ?? item.name ?? item.slug)}
                  </p>
                  <p className="font-mono text-mono-label uppercase text-text-muted">
                    {String(item.slug)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => startEdit(index)}
                    className="text-small font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(index)}
                    className="text-small font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {editingIndex !== null && formValues && (
            <div className="glass-card mt-8 space-y-4 p-8">
              <p className="font-mono text-mono-label uppercase text-text-muted">
                {editingIndex === -1 ? "New Entry" : "Edit Entry"}
              </p>
              {entity.fields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-small text-text-secondary">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={4}
                      value={fieldValueToText(formValues[field.key])}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          [field.key]: textToFieldValue(field, e.target.value),
                        })
                      }
                      className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={fieldValueToText(formValues[field.key])}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          [field.key]: textToFieldValue(field, e.target.value),
                        })
                      }
                      className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
                    >
                      {(field.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={fieldValueToText(formValues[field.key])}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          [field.key]: textToFieldValue(field, e.target.value),
                        })
                      }
                      placeholder={field.type === "tags" ? "comma, separated, tags" : undefined}
                      className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  onClick={saveForm}
                  className="rounded-md bg-accent px-4 py-2 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover"
                >
                  Save to draft
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

          <div className="mt-10 border-t border-border pt-8">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="rounded-md bg-accent px-6 py-3 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {publishing ? "Publishing…" : "Publish Changes (opens a PR)"}
            </button>
            {publishResult && (
              <p className="mt-3 text-small text-text-secondary">
                Opened{" "}
                <a
                  href={publishResult.prUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-accent hover:text-accent-hover"
                >
                  PR #{publishResult.prNumber}
                </a>{" "}
                — review and merge on GitHub.
              </p>
            )}
            {publishError && (
              <p className="mt-3 text-small text-text-secondary">Error: {publishError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
