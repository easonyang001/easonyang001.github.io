const GITHUB_API = "https://api.github.com";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is not set");
if (!GITHUB_OWNER) throw new Error("GITHUB_OWNER is not set");
if (!GITHUB_REPO) throw new Error("GITHUB_REPO is not set");

export interface GitHubFile {
  content: string;
  sha: string;
}

export interface PublishResult {
  prUrl: string;
  prNumber: number;
}

export interface OpenPull {
  number: number;
  title: string;
  url: string;
  createdAt: string;
}

/**
 * Never forward GitHub's raw response body to callers -- besides the token
 * never appearing here, GitHub error bodies can include repo metadata that
 * has no business leaking into an admin-panel error message.
 */
async function githubRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API request failed with status ${response.status}`);
  }
  return response;
}

function encodeBase64(text: string): string {
  return Buffer.from(text, "utf-8").toString("base64");
}

function decodeBase64(b64: string): string {
  return Buffer.from(b64, "base64").toString("utf-8");
}

export async function getFile(path: string, ref = "main"): Promise<GitHubFile> {
  const res = await githubRequest(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${encodeURIComponent(ref)}`
  );
  const data = (await res.json()) as { content: string; sha: string };
  return { content: decodeBase64(data.content), sha: data.sha };
}

async function getBranchSha(branch: string): Promise<string> {
  const res = await githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/ref/heads/${branch}`);
  const data = (await res.json()) as { object: { sha: string } };
  return data.object.sha;
}

async function createBranch(newBranch: string, fromSha: string): Promise<void> {
  await githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha: fromSha }),
  });
}

async function updateFile(
  path: string,
  content: string,
  message: string,
  branch: string,
  sha: string
): Promise<void> {
  await githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: encodeBase64(content), branch, sha }),
  });
}

async function createPullRequest(
  title: string,
  body: string,
  head: string,
  base = "main"
): Promise<{ url: string; number: number }> {
  const res = await githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls`, {
    method: "POST",
    body: JSON.stringify({ title, body, head, base }),
  });
  const data = (await res.json()) as { html_url: string; number: number };
  return { url: data.html_url, number: data.number };
}

/**
 * Branch -> commit -> PR. Never writes to main directly. branchPrefix is
 * combined with the current timestamp so concurrent edits don't collide.
 */
export async function publishFileChange(
  branchPrefix: string,
  filePath: string,
  newContent: string,
  commitMessage: string,
  prTitle: string,
  prBody: string
): Promise<PublishResult> {
  const mainSha = await getBranchSha("main");
  const branch = `${branchPrefix}-${Date.now()}`;
  await createBranch(branch, mainSha);
  const file = await getFile(filePath, branch);
  await updateFile(filePath, newContent, commitMessage, branch, file.sha);
  const pr = await createPullRequest(prTitle, prBody, branch);
  return { prUrl: pr.url, prNumber: pr.number };
}

interface RawPull {
  number: number;
  title: string;
  html_url: string;
  created_at: string;
}

export async function listOpenPulls(): Promise<OpenPull[]> {
  const res = await githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls?state=open&per_page=100`);
  const data = (await res.json()) as RawPull[];
  return data
    .filter((pr) => pr.title.startsWith("content:") || pr.title.startsWith("solution:"))
    .map((pr) => ({ number: pr.number, title: pr.title, url: pr.html_url, createdAt: pr.created_at }));
}
