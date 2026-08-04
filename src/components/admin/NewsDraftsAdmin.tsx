import { useEffect, useState } from "react";
import {
  approveNewsDraft,
  getNewsDraft,
  listNewsDrafts,
  rejectNewsDraft,
  updateNewsDraft,
  type NewsDraftRecord,
  type NewsDraftStatus,
  type NewsDraftSummary,
} from "../../lib/admin/newsDrafts.ts";

const STATUS_LABEL_CLASS: Record<NewsDraftStatus, string> = {
  draft: "text-text-muted",
  approved: "text-text-muted",
  published: "text-accent",
  rejected: "text-text-muted line-through",
};

export default function NewsDraftsAdmin({ token }: { token: string }) {
  const [drafts, setDrafts] = useState<NewsDraftSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<NewsDraftRecord | null>(null);
  const [title, setTitle] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [saving, setSaving] = useState(false);

  const [busy, setBusy] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setDrafts(await listNewsDrafts(token));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDraft = async (id: string) => {
    setActionError(null);
    setPrUrl(null);
    try {
      const record = await getNewsDraft(token, id);
      setDetail(record);
      setTitle(record.title);
      setContentMd(record.content_md);
      setOpenId(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const closeDetail = () => {
    setOpenId(null);
    setDetail(null);
    setPrUrl(null);
  };

  const saveEdits = async () => {
    if (!openId) return;
    setSaving(true);
    setActionError(null);
    try {
      const updated = await updateNewsDraft(token, openId, { title, content_md: contentMd });
      setDetail(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!openId) return;
    setBusy(true);
    setActionError(null);
    setPrUrl(null);
    try {
      const result = await approveNewsDraft(token, openId);
      setPrUrl(result.prUrl);
      await load();
      const record = await getNewsDraft(token, openId);
      setDetail(record);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!openId) return;
    if (!window.confirm("Reject this week's draft? It will not be published.")) return;
    setBusy(true);
    setActionError(null);
    try {
      await rejectNewsDraft(token, openId);
      await load();
      closeDetail();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  if (openId && detail) {
    const editable = detail.status === "draft";
    return (
      <div className="mt-8 max-w-2xl">
        <button
          onClick={closeDetail}
          className="text-small font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
        >
          ← Back to list
        </button>

        <div className="glass-card mt-6 space-y-5 p-8">
          <p className="font-mono text-mono-label uppercase text-text-muted">
            {detail.week_label} · <span className={STATUS_LABEL_CLASS[detail.status]}>{detail.status}</span>
          </p>

          <div>
            <label className="mb-1 block text-small text-text-secondary">Title</label>
            <input
              type="text"
              value={title}
              disabled={!editable}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1 block text-small text-text-secondary">Content (Markdown)</label>
            <textarea
              rows={16}
              value={contentMd}
              disabled={!editable}
              onChange={(e) => setContentMd(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-4 py-2 font-mono text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50 disabled:opacity-60"
            />
          </div>

          {editable && (
            <button
              onClick={() => void saveEdits()}
              disabled={saving}
              className="rounded-md border border-border px-4 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          )}

          <div className="border-t border-border pt-5">
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">
              Sources ({detail.sources.length})
            </p>
            <ul className="space-y-2">
              {detail.sources.map((source) => (
                <li key={source.id} className="text-small text-text-secondary">
                  <span className="font-mono text-mono-label uppercase text-text-muted">{source.type}</span>{" "}
                  <a href={source.url} target="_blank" rel="noreferrer" className="text-accent hover:text-accent-hover">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {actionError && <p className="text-small text-text-secondary">Error: {actionError}</p>}
          {prUrl && (
            <p className="text-small text-text-secondary">
              Opened{" "}
              <a href={prUrl} target="_blank" rel="noreferrer" className="font-medium text-accent hover:text-accent-hover">
                pull request
              </a>{" "}
              — review and merge on GitHub.
            </p>
          )}

          {editable && (
            <div className="flex gap-3 border-t border-border pt-5">
              <button
                onClick={() => void handleApprove()}
                disabled={busy}
                className="rounded-md bg-accent px-4 py-2 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Publishing…" : "Approve & Publish"}
              </button>
              <button
                onClick={() => void handleReject()}
                disabled={busy}
                className="rounded-md border border-border px-4 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-2xl">
      {loading && <p className="text-small text-text-secondary">Loading…</p>}
      {loadError && <p className="text-small text-text-secondary">Error: {loadError}</p>}

      {drafts && (
        <ul className="divide-y divide-border border-t border-border">
          {drafts.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-body text-text-primary">{item.title}</p>
                <p className="font-mono text-mono-label uppercase text-text-muted">
                  {item.week_label} · <span className={STATUS_LABEL_CLASS[item.status]}>{item.status}</span>
                </p>
              </div>
              <button
                onClick={() => void openDraft(item.id)}
                className="shrink-0 text-small font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
              >
                Review
              </button>
            </li>
          ))}
          {drafts.length === 0 && <p className="py-4 text-small text-text-secondary">No drafts yet.</p>}
        </ul>
      )}
    </div>
  );
}
