const API_BASE = import.meta.env.VITE_API_BASE_URL;

export type ContentType = "news" | "projects" | "people" | "publications";
export type DraftStatus = "draft" | "published" | "archived";

export interface DraftSummary {
  id: string;
  status: DraftStatus;
  created_at: string;
  updated_at: string;
  [idColumn: string]: unknown;
}

export type DraftRecord = Record<string, unknown> & { id: string; status: DraftStatus };

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
    const details = Array.isArray(body.details) ? `: ${body.details.join("; ")}` : "";
    throw new Error((body.error ?? `Request failed: ${response.status}`) + details);
  }
  return response;
}

export async function listDrafts(token: string, type: ContentType): Promise<DraftSummary[]> {
  const res = await request(`/api/content/${type}/drafts`, token);
  return res.json();
}

export async function getDraft(token: string, type: ContentType, id: string): Promise<DraftRecord> {
  const res = await request(`/api/content/${type}/drafts/${id}`, token);
  return res.json();
}

export async function createDraft(
  token: string,
  type: ContentType,
  body: Record<string, unknown>
): Promise<DraftRecord> {
  const res = await request(`/api/content/${type}/drafts`, token, { method: "POST", body: JSON.stringify(body) });
  return res.json();
}

export async function updateDraft(
  token: string,
  type: ContentType,
  id: string,
  body: Record<string, unknown>
): Promise<DraftRecord> {
  const res = await request(`/api/content/${type}/drafts/${id}`, token, { method: "PUT", body: JSON.stringify(body) });
  return res.json();
}

export async function publishDraft(token: string, type: ContentType, id: string): Promise<{ prUrl: string }> {
  const res = await request(`/api/content/${type}/drafts/${id}/publish`, token, { method: "PATCH" });
  return res.json();
}

export async function archiveDraft(token: string, type: ContentType, id: string): Promise<DraftRecord> {
  const res = await request(`/api/content/${type}/drafts/${id}/archive`, token, { method: "PATCH" });
  return res.json();
}

export async function deleteDraft(token: string, type: ContentType, id: string): Promise<void> {
  await request(`/api/content/${type}/drafts/${id}`, token, { method: "DELETE" });
}
