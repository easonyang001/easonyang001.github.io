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

export interface NewsDraftRecord extends NewsDraftSummary {
  content_md: string;
  sources: NewsDraftSource[];
  model: string;
  prompt_hash: string;
  reviewed_by: string | null;
  published_at: string | null;
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
