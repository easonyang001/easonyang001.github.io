import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabase } from "../supabase.js";
import { publishFileChange } from "../github.js";
import { sanitizeRichText } from "../sanitize.js";
import {
  newsToTypeScript,
  peopleToTypeScript,
  projectsToTypeScript,
  publicationsToTypeScript,
  type NewsRow,
  type PersonRow,
  type ProjectRow,
  type PublicationRow,
} from "../contentConverters.js";

const SLUG_RE = /^[a-z0-9-]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(v: unknown, max?: number): v is string {
  return typeof v === "string" && v.trim().length > 0 && (max === undefined || v.length <= max);
}
function isOptionalString(v: unknown): v is string | null | undefined {
  return v === undefined || v === null || typeof v === "string";
}
function isStringArray(v: unknown): v is string[] {
  return v === undefined || (Array.isArray(v) && v.every((x) => typeof x === "string"));
}
function isInt(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v);
}
function isOneOf<T extends string>(v: unknown, options: readonly T[]): v is T {
  return typeof v === "string" && (options as readonly string[]).includes(v);
}

const NEWS_CATEGORIES = ["Publication", "Research Update", "Project", "Announcement", "Event"] as const;
const PROJECT_STATUSES = ["Active", "Completed", "On Hold"] as const;
const PUB_TYPES = [
  "Journal Article",
  "Conference Paper",
  "Full Paper",
  "Poster",
  "Workshop Paper",
  "Preprint",
  "Research Note",
] as const;
const PUB_STATUSES = ["Published", "Under Review", "Accepted", "Preprint"] as const;

interface ContentTypeSpec {
  table: string;
  idColumn: string;
  titleColumn: string;
  filePath: string;
  writableFields: string[];
  validate: (body: Record<string, unknown>) => string[];
  sanitize: (body: Record<string, unknown>) => Record<string, unknown>;
  toTypeScript: (rows: unknown[]) => string;
}

const SPECS: Record<string, ContentTypeSpec> = {
  news: {
    table: "content_news",
    idColumn: "news_id",
    titleColumn: "title",
    filePath: "src/data/news.ts",
    writableFields: [
      "news_id",
      "date",
      "category",
      "title",
      "summary",
      "content",
      "cover_image_url",
      "cover_image_path",
      "related_project_id",
      "related_publication_id",
      "external_url",
    ],
    validate: (b) => {
      const errors: string[] = [];
      if (!isNonEmptyString(b.news_id) || !SLUG_RE.test(b.news_id)) errors.push("news_id must be a lowercase-hyphen slug");
      if (!isNonEmptyString(b.date) || !DATE_RE.test(b.date as string)) errors.push("date must be YYYY-MM-DD");
      if (!isOneOf(b.category, NEWS_CATEGORIES)) errors.push("category is invalid");
      if (!isNonEmptyString(b.title, 200)) errors.push("title must be 1-200 characters");
      if (!isNonEmptyString(b.summary, 500)) errors.push("summary must be 1-500 characters");
      if (!isOptionalString(b.content)) errors.push("content must be a string");
      if (!isOptionalString(b.cover_image_url)) errors.push("cover_image_url must be a string");
      if (!isOptionalString(b.related_project_id)) errors.push("related_project_id must be a string");
      if (!isOptionalString(b.related_publication_id)) errors.push("related_publication_id must be a string");
      if (!isOptionalString(b.external_url)) errors.push("external_url must be a string");
      return errors;
    },
    sanitize: (b) => ({ ...b, content: typeof b.content === "string" ? sanitizeRichText(b.content) : b.content }),
    toTypeScript: (rows) => newsToTypeScript(rows as NewsRow[]),
  },
  projects: {
    table: "content_projects",
    idColumn: "project_id",
    titleColumn: "title",
    filePath: "src/data/projects.ts",
    writableFields: [
      "project_id",
      "title",
      "year",
      "project_status",
      "summary",
      "cover_image_url",
      "cover_image_path",
      "technologies",
      "research_areas",
    ],
    validate: (b) => {
      const errors: string[] = [];
      if (!isNonEmptyString(b.project_id) || !SLUG_RE.test(b.project_id)) errors.push("project_id must be a lowercase-hyphen slug");
      if (!isNonEmptyString(b.title)) errors.push("title is required");
      if (!isInt(b.year)) errors.push("year must be an integer");
      if (!isOneOf(b.project_status, PROJECT_STATUSES)) errors.push("project_status is invalid");
      if (!isNonEmptyString(b.summary)) errors.push("summary is required");
      if (!isOptionalString(b.cover_image_url)) errors.push("cover_image_url must be a string");
      if (!isStringArray(b.technologies)) errors.push("technologies must be an array of strings");
      if (!isStringArray(b.research_areas)) errors.push("research_areas must be an array of strings");
      return errors;
    },
    sanitize: (b) => b,
    toTypeScript: (rows) => projectsToTypeScript(rows as ProjectRow[]),
  },
  people: {
    table: "content_people",
    idColumn: "person_id",
    titleColumn: "name",
    filePath: "src/data/people.ts",
    writableFields: [
      "person_id",
      "name",
      "roles",
      "biography",
      "research_interests",
      "avatar_url",
      "avatar_path",
      "email",
      "github_url",
      "scholar_url",
      "linkedin_url",
      "orcid",
    ],
    validate: (b) => {
      const errors: string[] = [];
      if (!isNonEmptyString(b.person_id) || !SLUG_RE.test(b.person_id)) errors.push("person_id must be a lowercase-hyphen slug");
      if (!isNonEmptyString(b.name)) errors.push("name is required");
      if (!isStringArray(b.roles)) errors.push("roles must be an array of strings");
      if (!isStringArray(b.research_interests)) errors.push("research_interests must be an array of strings");
      if (!isOptionalString(b.biography)) errors.push("biography must be a string");
      if (!isOptionalString(b.email)) errors.push("email must be a string");
      return errors;
    },
    sanitize: (b) => b,
    toTypeScript: (rows) => peopleToTypeScript(rows as PersonRow[]),
  },
  publications: {
    table: "content_publications",
    idColumn: "pub_id",
    titleColumn: "title",
    filePath: "src/data/publications.ts",
    writableFields: [
      "pub_id",
      "title",
      "authors",
      "year",
      "venue",
      "pub_type",
      "pub_status",
      "abstract",
      "keywords",
      "research_areas",
      "pdf_url",
      "doi",
      "code_url",
      "bibtex",
    ],
    validate: (b) => {
      const errors: string[] = [];
      if (!isNonEmptyString(b.pub_id) || !SLUG_RE.test(b.pub_id)) errors.push("pub_id must be a lowercase-hyphen slug");
      if (!isNonEmptyString(b.title)) errors.push("title is required");
      if (!isInt(b.year)) errors.push("year must be an integer");
      if (!isOneOf(b.pub_type, PUB_TYPES)) errors.push("pub_type is invalid");
      if (b.pub_status !== undefined && !isOneOf(b.pub_status, PUB_STATUSES)) errors.push("pub_status is invalid");
      if (!isStringArray(b.authors)) errors.push("authors must be an array of strings");
      if (!isStringArray(b.keywords)) errors.push("keywords must be an array of strings");
      if (!isStringArray(b.research_areas)) errors.push("research_areas must be an array of strings");
      return errors;
    },
    sanitize: (b) => b,
    toTypeScript: (rows) => publicationsToTypeScript(rows as PublicationRow[]),
  },
};

function pick(body: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) if (body[f] !== undefined) out[f] = body[f];
  return out;
}

export const contentRouter = Router();
contentRouter.use(requireAuth);

contentRouter.param("type", (_req, res, next, type) => {
  if (!Object.prototype.hasOwnProperty.call(SPECS, type)) {
    res.status(400).json({ error: "Unknown content type" });
    return;
  }
  next();
});

contentRouter.get("/:type/drafts", async (req, res) => {
  const spec = SPECS[req.params.type];
  const { data, error } = await supabase
    .from(spec.table)
    .select(`id, status, ${spec.idColumn}, ${spec.titleColumn}, created_at, updated_at`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Content list failed:", error);
    res.status(502).json({ error: "Failed to load content" });
    return;
  }
  res.json(data);
});

contentRouter.get("/:type/drafts/:id", async (req, res) => {
  const spec = SPECS[req.params.type];
  const { data, error } = await supabase.from(spec.table).select("*").eq("id", req.params.id).maybeSingle();

  if (error) {
    console.error("Content read failed:", error);
    res.status(502).json({ error: "Failed to load content" });
    return;
  }
  if (!data) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(data);
});

contentRouter.post("/:type/drafts", async (req, res) => {
  const spec = SPECS[req.params.type];
  const body = (req.body ?? {}) as Record<string, unknown>;
  const errors = spec.validate(body);
  if (errors.length > 0) {
    res.status(400).json({ error: "Invalid content", details: errors });
    return;
  }

  const { data, error } = await supabase
    .from(spec.table)
    .insert(spec.sanitize(pick(body, spec.writableFields)))
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      res.status(409).json({ error: `${spec.idColumn} already exists` });
      return;
    }
    console.error("Content create failed:", error);
    res.status(502).json({ error: "Failed to create content" });
    return;
  }
  res.status(201).json(data);
});

contentRouter.put("/:type/drafts/:id", async (req, res) => {
  const spec = SPECS[req.params.type];
  const body = (req.body ?? {}) as Record<string, unknown>;
  const errors = spec.validate(body);
  if (errors.length > 0) {
    res.status(400).json({ error: "Invalid content", details: errors });
    return;
  }

  const { data, error } = await supabase
    .from(spec.table)
    .update(spec.sanitize(pick(body, spec.writableFields)))
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      res.status(409).json({ error: `${spec.idColumn} already exists` });
      return;
    }
    console.error("Content update failed:", error);
    res.status(502).json({ error: "Failed to update content" });
    return;
  }
  if (!data) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(data);
});

contentRouter.delete("/:type/drafts/:id", async (req, res) => {
  const spec = SPECS[req.params.type];
  const { data: existing, error: readError } = await supabase
    .from(spec.table)
    .select("status")
    .eq("id", req.params.id)
    .maybeSingle();

  if (readError) {
    console.error("Content read failed:", readError);
    res.status(502).json({ error: "Failed to load content" });
    return;
  }
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (existing.status !== "draft") {
    res.status(403).json({ error: "Only drafts can be deleted" });
    return;
  }

  const { error } = await supabase.from(spec.table).delete().eq("id", req.params.id);
  if (error) {
    console.error("Content delete failed:", error);
    res.status(502).json({ error: "Failed to delete content" });
    return;
  }
  res.status(204).end();
});

contentRouter.patch("/:type/drafts/:id/publish", async (req, res) => {
  const type = req.params.type;
  const spec = SPECS[type];

  const { data: published, error: publishError } = await supabase
    .from(spec.table)
    .update({ status: "published" })
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (publishError) {
    console.error("Content publish (status update) failed:", publishError);
    res.status(502).json({ error: "Failed to publish content" });
    return;
  }
  if (!published) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { data: allPublished, error: listError } = await supabase
    .from(spec.table)
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (listError || !allPublished) {
    console.error("Content publish (reload) failed:", listError);
    res.status(502).json({ error: "Failed to publish content" });
    return;
  }

  try {
    const fileContent = spec.toTypeScript(allPublished);
    const result = await publishFileChange(
      `content/${type}`,
      spec.filePath,
      fileContent,
      `content: update ${type}`,
      `content: update ${type}`,
      "Published via the /admin panel. Review before merging — this never writes to main directly."
    );
    res.json({ prUrl: result.prUrl });
  } catch (err) {
    // Status is already "published" in Supabase at this point. The next
    // successful publish of any item in this content type regenerates the
    // full file (including this one), so this is self-healing rather than
    // stuck -- but surface the failure now so the admin knows to retry.
    console.error("Content publish (GitHub PR) failed:", err);
    res.status(502).json({ error: "Marked published, but failed to open the pull request. Try publishing again." });
  }
});

contentRouter.patch("/:type/drafts/:id/archive", async (req, res) => {
  const spec = SPECS[req.params.type];
  const { data, error } = await supabase
    .from(spec.table)
    .update({ status: "archived" })
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Content archive failed:", error);
    res.status(502).json({ error: "Failed to archive content" });
    return;
  }
  if (!data) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(data);
});
