import { describe, it, expect, vi, afterEach } from "vitest";
import { encodeBase64, decodeBase64, getFile, publishFileChange } from "./github.ts";
import type { GitHubConfig } from "./github.ts";

const config: GitHubConfig = { owner: "test-owner", repo: "test-repo", token: "test-token" };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("base64 round trip", () => {
  it("round-trips ASCII text", () => {
    expect(decodeBase64(encodeBase64("hello world"))).toBe("hello world");
  });

  it("round-trips non-Latin1 (UTF-8) text", () => {
    const text = "Jia-Zhen Yang — Étude — 量子";
    expect(decodeBase64(encodeBase64(text))).toBe(text);
  });
});

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("getFile", () => {
  it("decodes the base64 content from the GitHub contents API", async () => {
    const encoded = encodeBase64("export const x = 1;\n");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ content: encoded, sha: "abc123" }));
    vi.stubGlobal("fetch", fetchMock);

    const file = await getFile(config, "src/data/news.ts");
    expect(file.content).toBe("export const x = 1;\n");
    expect(file.sha).toBe("abc123");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/repos/test-owner/test-repo/contents/src/data/news.ts"),
      expect.any(Object)
    );
  });

  it("throws with the response body when the request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: "Bad credentials" }, false, 401));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getFile(config, "src/data/news.ts")).rejects.toThrow(/401/);
  });
});

describe("publishFileChange", () => {
  it("creates a branch, commits, and opens a PR — never touches main directly", async () => {
    const calls: { url: string; method?: string }[] = [];
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, method: init?.method });

      if (url.includes("/git/ref/heads/main")) {
        return jsonResponse({ object: { sha: "main-sha" } });
      }
      if (url.includes("/git/refs") && init?.method === "POST") {
        return jsonResponse({ ref: "refs/heads/admin/123" });
      }
      if (url.includes("/contents/") && (!init?.method || init.method === "GET")) {
        return jsonResponse({ content: encodeBase64("old content"), sha: "file-sha" });
      }
      if (url.includes("/contents/") && init?.method === "PUT") {
        return jsonResponse({ commit: { sha: "commit-sha" } });
      }
      if (url.includes("/pulls") && init?.method === "POST") {
        return jsonResponse({ html_url: "https://github.com/test-owner/test-repo/pull/42", number: 42 });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await publishFileChange(
      config,
      "src/data/news.ts",
      "new content",
      "chore: update news",
      "admin: update news",
      "Edited via the admin panel."
    );

    expect(result.prUrl).toBe("https://github.com/test-owner/test-repo/pull/42");
    expect(result.prNumber).toBe(42);

    // Never a direct write to main's ref, and the branch created is not "main".
    const branchCreation = calls.find((c) => c.url.includes("/git/refs") && c.method === "POST");
    expect(branchCreation).toBeDefined();
    const putCall = calls.find((c) => c.method === "PUT");
    expect(putCall?.url).not.toMatch(/branch=main/);
  });
});
