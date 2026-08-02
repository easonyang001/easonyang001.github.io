const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface ContentFile {
  content: string;
  sha: string;
}

export interface PublishResult {
  prUrl: string;
}

export interface OpenPull {
  number: number;
  title: string;
  url: string;
  createdAt: string;
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

/** Reads a data file (e.g. src/data/news.ts) via the backend's GitHub proxy. */
export async function getContent(token: string, type: string): Promise<ContentFile> {
  const res = await request(`/api/github/content/${type}`, token);
  return res.json();
}

/** Opens a PR with the new file content. Never writes to main directly. */
export async function publishContent(
  token: string,
  type: string,
  content: string,
  message: string
): Promise<PublishResult> {
  const res = await request(`/api/github/content/${type}`, token, {
    method: "POST",
    body: JSON.stringify({ content, message }),
  });
  return res.json();
}

export async function listOpenPulls(token: string): Promise<OpenPull[]> {
  const res = await request("/api/github/pulls", token);
  return res.json();
}
