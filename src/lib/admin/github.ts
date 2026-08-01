const API_BASE = "https://api.github.com";

export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
}

export interface GitHubFile {
  content: string;
  sha: string;
}

export interface PublishResult {
  prUrl: string;
  prNumber: number;
  branch: string;
}

async function githubRequest(config: GitHubConfig, path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body}`);
  }
  return response;
}

/** UTF-8 safe base64 encode/decode (plain atob/btoa mangle non-Latin1 text). */
export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function decodeBase64(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function verifyToken(config: GitHubConfig): Promise<{ login: string }> {
  const res = await githubRequest(config, "/user");
  return res.json();
}

export async function getFile(config: GitHubConfig, path: string, ref = "main"): Promise<GitHubFile> {
  const res = await githubRequest(
    config,
    `/repos/${config.owner}/${config.repo}/contents/${path}?ref=${encodeURIComponent(ref)}`
  );
  const data = await res.json();
  return { content: decodeBase64(data.content), sha: data.sha };
}

export async function getBranchSha(config: GitHubConfig, branch: string): Promise<string> {
  const res = await githubRequest(config, `/repos/${config.owner}/${config.repo}/git/ref/heads/${branch}`);
  const data = await res.json();
  return data.object.sha;
}

export async function createBranch(config: GitHubConfig, newBranch: string, fromSha: string): Promise<void> {
  await githubRequest(config, `/repos/${config.owner}/${config.repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha: fromSha }),
  });
}

export async function updateFile(
  config: GitHubConfig,
  path: string,
  content: string,
  message: string,
  branch: string,
  sha: string
): Promise<void> {
  await githubRequest(config, `/repos/${config.owner}/${config.repo}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: encodeBase64(content), branch, sha }),
  });
}

export async function createPullRequest(
  config: GitHubConfig,
  title: string,
  body: string,
  head: string,
  base = "main"
): Promise<{ url: string; number: number }> {
  const res = await githubRequest(config, `/repos/${config.owner}/${config.repo}/pulls`, {
    method: "POST",
    body: JSON.stringify({ title, body, head, base }),
  });
  const data = await res.json();
  return { url: data.html_url, number: data.number };
}

/**
 * Branch -> commit -> PR. Never writes to main directly, matching the same
 * reviewed-PR discipline as the arXiv digest automation.
 */
export async function publishFileChange(
  config: GitHubConfig,
  filePath: string,
  newContent: string,
  commitMessage: string,
  prTitle: string,
  prBody: string
): Promise<PublishResult> {
  const mainSha = await getBranchSha(config, "main");
  const branch = `admin/${Date.now()}`;
  await createBranch(config, branch, mainSha);
  const file = await getFile(config, filePath, branch);
  await updateFile(config, filePath, newContent, commitMessage, branch, file.sha);
  const pr = await createPullRequest(config, prTitle, prBody, branch);
  return { prUrl: pr.url, prNumber: pr.number, branch };
}
