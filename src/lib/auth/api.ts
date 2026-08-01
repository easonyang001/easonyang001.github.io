const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
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

export async function login(username: string, password: string): Promise<string> {
  const res = await request("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  return data.token;
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await request("/api/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch {
    return false;
  }
}
