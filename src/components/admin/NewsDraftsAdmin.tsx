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
  type PaperIntelligence,
  type QaReport,
} from "../../lib/admin/newsDrafts.ts";
import { parseWeeklyBrief } from "../../lib/news/weeklyBrief.ts";
import WeeklyBriefEditor from "./WeeklyBriefEditor.tsx";

const STATUS_LABEL_CLASS: Record<NewsDraftStatus, string> = {
  draft: "text-text-muted",
  approved: "text-text-muted",
  published: "text-accent",
  rejected: "text-text-muted line-through",
};

function ListField({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-2">
      <span className="text-text-muted">{label}:</span>
      <ul className="list-disc pl-5">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// Shows the Paper Intelligence + Evidence Matrix scripts/research/paper_analyzer.py
// already computes for the week's deep-dive candidate -- lets the reviewer
// see the facts literatureDeepDive/the Research Walkthrough were grounded
// in, instead of trusting the generated prose blind.
function EvidencePanel({ paperIntelligence }: { paperIntelligence: PaperIntelligence }) {
  const { method, experiments } = paperIntelligence;
  return (
    <div className="space-y-3 text-small text-text-secondary">
      <p>
        <span className="text-text-muted">Research question:</span> {paperIntelligence.research_question}
      </p>
      <p>
        <span className="text-text-muted">Motivation:</span> {paperIntelligence.motivation}
      </p>
      <p>
        <span className="text-text-muted">Core contribution:</span> {paperIntelligence.core_contribution}
      </p>
      <div>
        <span className="text-text-muted">Method:</span> {method.core_idea}
        <ul className="list-disc pl-5">
          <li>Quantum component: {method.quantum_component}</li>
          <li>Classical component: {method.classical_component}</li>
        </ul>
      </div>
      <div>
        <span className="text-text-muted">Experiments:</span>
        <ul className="list-disc pl-5">
          <li>Datasets: {experiments.datasets.join(", ") || "Not reported"}</li>
          <li>Baselines: {experiments.baselines.join(", ") || "Not reported"}</li>
          <li>Metrics: {experiments.metrics.join(", ") || "Not reported"}</li>
          <li>Hardware/simulator: {experiments.hardware_or_simulator}</li>
        </ul>
      </div>
      <ListField label="Key results" items={paperIntelligence.key_results} />
      <ListField label="Limitations" items={paperIntelligence.limitations} />
      <ListField label="Claims not well supported by evidence" items={paperIntelligence.unsupported_or_weak_claims} />
      {paperIntelligence.evidence.length > 0 && (
        <div>
          <span className="text-text-muted">Evidence:</span>
          <ul className="mt-1 space-y-1">
            {paperIntelligence.evidence.map((item, index) => (
              <li key={index}>
                {item.claim} <span className="text-text-muted">→</span> {item.evidence}{" "}
                <span className="font-mono text-mono-label uppercase text-text-muted">({item.strength})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
    const weeklyBrief = parseWeeklyBrief(contentMd);
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

          {weeklyBrief ? (
            <WeeklyBriefEditor
              brief={weeklyBrief}
              disabled={!editable}
              onChange={(serialized, primaryTitle) => {
                setContentMd(serialized);
                setTitle(primaryTitle);
              }}
            />
          ) : (
            <>
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
            </>
          )}

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

          <div className="border-t border-border pt-5">
            <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">Evidence</p>
            {detail.paper_intelligence ? (
              <EvidencePanel paperIntelligence={detail.paper_intelligence} />
            ) : (
              <p className="text-small text-text-secondary">
                No full-text analysis this week (abstract-only).
              </p>
            )}
          </div>

          {detail.qa_report && Object.keys(detail.qa_report).length > 0 && (
            <div className="border-t border-border pt-5">
              <p className="mb-3 font-mono text-mono-label uppercase text-text-muted">QA Report</p>
              <div className="space-y-4">
                {(Object.entries(detail.qa_report) as [string, QaReport][]).map(([language, report]) => (
                  <div key={language} className="text-small text-text-secondary">
                    <p>
                      <span className="font-mono text-mono-label uppercase text-text-muted">{language}</span>{" "}
                      <span className={report.status === "pass" ? "text-text-muted" : "text-accent"}>
                        {report.status}
                      </span>{" "}
                      <span className="text-text-muted">({report.score.toFixed(2)})</span>
                    </p>
                    <p className="mt-1">{report.summary}</p>
                    {(
                      [
                        ["Unsupported claims", report.unsupported_claims],
                        ["Numerical mismatches", report.numerical_mismatches],
                        ["Missing caveats", report.missing_caveats],
                        ["Overclaiming", report.overclaiming],
                        ["Other issues", report.other_issues],
                      ] as [string, string[]][]
                    )
                      .filter(([, items]) => items.length > 0)
                      .map(([label, items]) => (
                        <div key={label} className="mt-1">
                          <span className="text-text-muted">{label}:</span>
                          <ul className="list-disc pl-5">
                            {items.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          )}

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
