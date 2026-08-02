import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getFile, publishFileChange, listOpenPulls } from "../github.js";

const TYPE_PATHS: Record<string, string> = {
  news: "src/data/news.ts",
  projects: "src/data/projects.ts",
  people: "src/data/people.ts",
  publications: "src/data/publications.ts",
};

function isKnownType(type: string): boolean {
  return Object.prototype.hasOwnProperty.call(TYPE_PATHS, type);
}

export const githubRouter = Router();
githubRouter.use(requireAuth);

githubRouter.get("/content/:type", async (req, res) => {
  const { type } = req.params;
  if (!isKnownType(type)) {
    res.status(400).json({ error: "Unknown content type" });
    return;
  }
  try {
    const file = await getFile(TYPE_PATHS[type]);
    res.json(file);
  } catch (err) {
    console.error("GitHub content read failed:", err);
    res.status(502).json({ error: "Failed to read content from GitHub" });
  }
});

githubRouter.post("/content/:type", async (req, res) => {
  const { type } = req.params;
  if (!isKnownType(type)) {
    res.status(400).json({ error: "Unknown content type" });
    return;
  }
  const { content, message } = req.body ?? {};
  if (typeof content !== "string" || typeof message !== "string") {
    res.status(400).json({ error: "content and message are required" });
    return;
  }
  try {
    const result = await publishFileChange(
      `admin/${type}`,
      TYPE_PATHS[type],
      content,
      message,
      `content: update ${type}`,
      "Edited via the /admin panel. Review before merging — this never writes to main directly."
    );
    res.json({ prUrl: result.prUrl });
  } catch (err) {
    console.error("GitHub publish failed:", err);
    res.status(502).json({ error: "Failed to open pull request" });
  }
});

githubRouter.get("/pulls", async (_req, res) => {
  try {
    const pulls = await listOpenPulls();
    res.json(pulls);
  } catch (err) {
    console.error("GitHub pulls list failed:", err);
    res.status(502).json({ error: "Failed to list pull requests" });
  }
});
