import { describe, it, expect, vi, afterEach } from "vitest";
import { getContent, publishContent, listOpenPulls } from "./github.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe("getContent", () => {
  it("calls the backend proxy with the JWT and returns the file", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ content: "export const x = 1;\n", sha: "abc123" }));
    vi.stubGlobal("fetch", fetchMock);

    const file = await getContent("jwt-token", "news");
    expect(file.content).toBe("export const x = 1;\n");
    expect(file.sha).toBe("abc123");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/github/content/news"),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer jwt-token" }) })
    );
  });

  it("throws with the backend's error message when the request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ error: "Invalid or expired token" }, false, 401));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getContent("jwt-token", "news")).rejects.toThrow(/Invalid or expired token/);
  });
});

describe("publishContent", () => {
  it("posts content + message and returns the PR url", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ prUrl: "https://github.com/test-owner/test-repo/pull/42" }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await publishContent("jwt-token", "news", "new content", "admin: update News");

    expect(result.prUrl).toBe("https://github.com/test-owner/test-repo/pull/42");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/github/content/news"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ content: "new content", message: "admin: update News" }),
      })
    );
  });
});

describe("listOpenPulls", () => {
  it("returns the open PR list from the backend", async () => {
    const pulls = [{ number: 42, title: "content: update news", url: "https://github.com/x/y/pull/42", createdAt: "2026-01-01T00:00:00Z" }];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(pulls));
    vi.stubGlobal("fetch", fetchMock);

    const result = await listOpenPulls("jwt-token");
    expect(result).toEqual(pulls);
  });
});
