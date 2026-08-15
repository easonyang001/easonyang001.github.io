const API_BASE = import.meta.env.VITE_API_BASE_URL;

export type NewsDraftStatus = "draft" | "approved" | "published" | "rejected";

export interface NewsDraftSummary {
  id: string;
  week_label: string;
  title: string;
  status: NewsDraftStatus;
  created_at: string;
  reviewed_at: string | null;
}

export interface NewsDraftSource {
  type: "arxiv" | "news";
  id: string;
  title: string;
  url: string;
  relevanceScore: number;
}

export interface QaReport {
  status: "pass" | "needs_review";
  score: number;
  unsupported_claims: string[];
  numerical_mismatches: string[];
  missing_caveats: string[];
  overclaiming: string[];
  other_issues: string[];
  summary: string;
}

export interface PaperIntelligenceEvidence {
  claim: string;
  evidence: string;
  strength: "strong" | "moderate" | "weak" | "unsupported";
}

export interface PaperIntelligence {
  research_question: string;
  motivation: string;
  research_gap: string;
  core_contribution: string;
  method: {
    core_idea: string;
    quantum_component: string;
    classical_component: string;
  };
  experiments: {
    datasets: string[];
    baselines: string[];
    metrics: string[];
    hardware_or_simulator: string;
  };
  key_results: string[];
  author_claims: string[];
  limitations: string[];
  unsupported_or_weak_claims: string[];
  evidence: PaperIntelligenceEvidence[];
}

export interface NewsDraftRecord extends NewsDraftSummary {
  content_md: string;
  sources: NewsDraftSource[];
  model: string;
  prompt_hash: string;
  reviewed_by: string | null;
  published_at: string | null;
  // Optional: predates this field (see supabase/migrations/010_qa_report.sql),
  // and even a fresh draft can be missing a language if that language's
  // critic call failed. Review aid only, never part of published output.
  qa_report: Partial<Record<"zh-TW" | "en" | "fr", QaReport>> | null;
  // Optional: predates this field (see
  // supabase/migrations/011_deep_dive_arxiv_id.sql), and null whenever
  // there was no deep-dive candidate that week or its analysis failed.
  deep_dive_arxiv_id: string | null;
  // Looked up server-side from deep_dive_arxiv_id -- see
  // server/src/routes/newsAutomation.ts's GET /drafts/:id. Null whenever
  // deep_dive_arxiv_id is null, or no matching row exists yet.
  paper_intelligence: PaperIntelligence | null;
}

async function request(path: string, token: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }
  return response;
}

export async function listNewsDrafts(token: string): Promise<NewsDraftSummary[]> {
  const res = await request("/api/news/drafts", token);
  return res.json();
}

export async function getNewsDraft(token: string, id: string): Promise<NewsDraftRecord> {
  const res = await request(`/api/news/drafts/${id}`, token);
  return res.json();
}

export async function updateNewsDraft(
  token: string,
  id: string,
  body: { title?: string; content_md?: string }
): Promise<NewsDraftRecord> {
  const res = await request(`/api/news/drafts/${id}`, token, { method: "PATCH", body: JSON.stringify(body) });
  return res.json();
}

export async function approveNewsDraft(token: string, id: string): Promise<{ prUrl: string }> {
  const res = await request(`/api/news/drafts/${id}/approve`, token, { method: "PATCH" });
  return res.json();
}

export async function rejectNewsDraft(token: string, id: string): Promise<NewsDraftRecord> {
  const res = await request(`/api/news/drafts/${id}/reject`, token, { method: "PATCH" });
  return res.json();
}
