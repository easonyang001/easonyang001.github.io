import { Router } from "express";
import { marked } from "marked";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import { supabase } from "../supabase.js";
import { publishFileChange } from "../github.js";
import { sanitizeRichText } from "../sanitize.js";
import { newsToTypeScript, type NewsRow } from "../contentConverters.js";
import { parseWeeklyBrief, renderWeeklyBrief } from "../weeklyBrief.js";

const NEWS_CATEGORY = "Research Update";
const SUMMARY_MAX_CHARS = 500;
const TITLE_MAX_CHARS = 200;

function isNonEmptyString(v: unknown, max?: number): v is string {
  return typeof v === "string" && v.trim().length > 0 && (max === undefined || v.length <= max);
}

/** First non-empty paragraph after the leading heading, stripped of markdown syntax. */
function extractSummary(markdown: string, fallback: string): string {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((p) => p.replace(/^#+\s*/, "").replace(/[*_`#]/g, "").trim())
    .filter((p) => p.length > 0 && !p.startsWith("["));

  const summary = paragraphs[0] || fallback;
  return summary.length > SUMMARY_MAX_CHARS ? `${summary.slice(0, SUMMARY_MAX_CHARS - 1)}…` : summary;
}

function slugFromWeekLabel(weekLabel: string): string {
  return `weekly-quantum-news-${weekLabel.toLowerCase()}`;
}

function deepDiveSlugFromWeekLabel(weekLabel: string): string {
  return `weekly-quantum-paper-deep-dive-${weekLabel.toLowerCase()}`;
}

export const newsAutomationRouter = Router();
newsAutomationRouter.use(requireAuth);

newsAutomationRouter.get("/drafts", async (_req, res) => {
  const { data, error } = await supabase
    .from("news_drafts")
    .select("id, week_label, title, status, created_at, reviewed_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("News drafts list failed:", error);
    res.status(502).json({ error: "Failed to load news drafts" });
    return;
  }
  res.json(data);
});

newsAutomationRouter.get("/drafts/:id", async (req, res) => {
  const { data, error } = await supabase.from("news_drafts").select("*").eq("id", req.params.id).maybeSingle();

  if (error) {
    console.error("News draft read failed:", error);
    res.status(502).json({ error: "Failed to load news draft" });
    return;
  }
  if (!data) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(data);
});

newsAutomationRouter.patch("/drafts/:id", async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) {
    if (!isNonEmptyString(body.title, TITLE_MAX_CHARS)) {
      res.status(400).json({ error: `title must be 1-${TITLE_MAX_CHARS} characters` });
      return;
    }
    updates.title = body.title;
  }
  if (body.content_md !== undefined) {
    if (!isNonEmptyString(body.content_md)) {
      res.status(400).json({ error: "content_md must be a non-empty string" });
      return;
    }
    updates.content_md = body.content_md;
  }
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  const { data: existing, error: readError } = await supabase
    .from("news_drafts")
    .select("status")
    .eq("id", req.params.id)
    .maybeSingle();

  if (readError) {
    console.error("News draft read failed:", readError);
    res.status(502).json({ error: "Failed to load news draft" });
    return;
  }
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (existing.status !== "draft") {
    res.status(403).json({ error: "Only drafts can be edited" });
    return;
  }

  const { data, error } = await supabase
    .from("news_drafts")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("News draft update failed:", error);
    res.status(502).json({ error: "Failed to update news draft" });
    return;
  }
  res.json(data);
});

newsAutomationRouter.patch("/drafts/:id/reject", async (req, res) => {
  const { data, error } = await supabase
    .from("news_drafts")
    .update({ status: "rejected", reviewed_by: (req as AuthedRequest).user?.username, reviewed_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .eq("status", "draft")
    .select()
    .maybeSingle();

  if (error) {
    console.error("News draft reject failed:", error);
    res.status(502).json({ error: "Failed to reject news draft" });
    return;
  }
  if (!data) {
    res.status(404).json({ error: "Not found, or not in draft status" });
    return;
  }
  res.json(data);
});

newsAutomationRouter.patch("/drafts/:id/approve", async (req, res) => {
  const { data: draft, error: readError } = await supabase
    .from("news_drafts")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();

  if (readError) {
    console.error("News draft read failed:", readError);
    res.status(502).json({ error: "Failed to load news draft" });
    return;
  }
  if (!draft) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (draft.status !== "draft") {
    res.status(409).json({ error: "This draft has already been reviewed" });
    return;
  }

  let publishedTitle = draft.title;
  let summary: string;
  let content: string;
  // literatureDeepDive is written to read as a complete, self-contained
  // piece (see the prompt), so a weekly brief also gets republished a
  // second time as its own standalone "Paper Deep Dive" News entry.
  let deepDive: { title: string; summary: string; content: string } | null = null;
  try {
    const brief = parseWeeklyBrief(draft.content_md);
    if (brief) {
      const publishedBrief = await renderWeeklyBrief(brief);
      const primary = publishedBrief.translations["zh-TW"];
      publishedTitle = primary.title.slice(0, TITLE_MAX_CHARS);
      summary = primary.summary.slice(0, SUMMARY_MAX_CHARS);
      content = JSON.stringify(publishedBrief);

      deepDive = {
        title: `論文精讀｜${primary.title}`.slice(0, TITLE_MAX_CHARS),
        summary: extractSummary(brief.translations["zh-TW"].sections.literatureDeepDive, primary.summary).slice(
          0,
          SUMMARY_MAX_CHARS
        ),
        content: primary.sections.literatureDeepDive,
      };
    } else {
      content = sanitizeRichText(await marked.parse(draft.content_md));
      summary = extractSummary(draft.content_md, draft.title);
    }
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid weekly brief" });
    return;
  }

  const entries = [
    { news_id: slugFromWeekLabel(draft.week_label), title: publishedTitle, summary, content },
    ...(deepDive
      ? [{ news_id: deepDiveSlugFromWeekLabel(draft.week_label), title: deepDive.title, summary: deepDive.summary, content: deepDive.content }]
      : []),
  ];

  for (const entry of entries) {
    // Upsert on news_id rather than insert: if a prior approve attempt got
    // this far but then failed before opening the GitHub PR, the row is
    // left behind with nothing actually published. A plain insert would
    // hit the unique constraint on news_id and permanently block retrying
    // this week's draft, so upsert lets a retry overwrite it and continue.
    const { error: insertError } = await supabase.from("content_news").upsert(
      {
        status: "published",
        news_id: entry.news_id,
        date: new Date().toISOString().slice(0, 10),
        category: NEWS_CATEGORY,
        title: entry.title,
        summary: entry.summary,
        content: entry.content,
        cover_image_url: null,
        related_project_id: null,
        related_publication_id: null,
        external_url: null,
      },
      { onConflict: "news_id" }
    );

    if (insertError) {
      console.error("News draft approve (content_news upsert) failed:", insertError);
      res.status(502).json({ error: "Failed to save the News entry" });
      return;
    }
  }

  const { data: allPublished, error: listError } = await supabase
    .from("content_news")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (listError || !allPublished) {
    console.error("News draft approve (reload) failed:", listError);
    res.status(502).json({
      error: "News entry created, but failed to reload published content. Publish it again from Content -> News.",
    });
    return;
  }

  try {
    const result = await publishFileChange(
      "content/news",
      "src/data/news.ts",
      newsToTypeScript(allPublished as NewsRow[]),
      "content: update news",
      "content: update news",
      "Published via News Drafts (weekly automation). Review before merging — this never writes to main directly."
    );

    await supabase
      .from("news_drafts")
      .update({
        status: "published",
        reviewed_by: (req as AuthedRequest).user?.username,
        reviewed_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      })
      .eq("id", req.params.id);

    res.json({ prUrl: result.prUrl });
  } catch (err) {
    // The content_news row already exists and is marked published -- retry
    // from Content -> News (its Publish button re-runs the same regenerate
    // + PR step) rather than through this endpoint again.
    console.error("News draft approve (GitHub PR) failed:", err);
    res.status(502).json({
      error: "News entry created, but failed to open the pull request. Retry publishing it from Content -> News.",
    });
  }
});
