import type { ContentType } from "./content.ts";
import type { UploadImageType } from "./uploadImage.ts";

export type FieldKind = "text" | "textarea" | "code" | "number" | "date" | "select" | "tags" | "richtext" | "image";

export interface FieldSpec {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  options?: readonly string[];
  /** image/richtext only -- which folder the upload goes in. */
  imageType?: UploadImageType;
  /** image only -- sibling column that stores the storage path, cleared together with the URL. */
  pathKey?: string;
  /** text only -- normalize input to the ^[a-z0-9-]+$ shape the backend requires. */
  slugify?: boolean;
}

export interface ContentTypeConfig {
  key: ContentType;
  label: string;
  idKey: string;
  titleKey: string;
  fields: FieldSpec[];
  emptyItem: () => Record<string, unknown>;
}

const NEWS_CATEGORIES = ["Publication", "Research Update", "Project", "Announcement", "Event"];
const PROJECT_STATUSES = ["Active", "Completed", "On Hold"];
const PUB_TYPES = ["Journal Article", "Conference Paper", "Full Paper", "Poster", "Workshop Paper", "Preprint", "Research Note"];
const PUB_STATUSES = ["Published", "Under Review", "Accepted", "Preprint"];

export const CONTENT_TYPES: ContentTypeConfig[] = [
  {
    key: "news",
    label: "News",
    idKey: "news_id",
    titleKey: "title",
    fields: [
      { key: "news_id", label: "Slug", kind: "text", required: true, slugify: true },
      { key: "date", label: "Date", kind: "date", required: true },
      { key: "category", label: "Category", kind: "select", required: true, options: NEWS_CATEGORIES },
      { key: "title", label: "Title", kind: "text", required: true },
      { key: "summary", label: "Summary (max 500 characters)", kind: "textarea", required: true },
      { key: "content", label: "Content", kind: "richtext", imageType: "news" },
      { key: "cover_image_url", label: "Cover Image", kind: "image", imageType: "news", pathKey: "cover_image_path" },
      { key: "related_project_id", label: "Related Project Slug", kind: "text" },
      { key: "related_publication_id", label: "Related Publication Slug", kind: "text" },
      { key: "external_url", label: "External URL", kind: "text" },
    ],
    emptyItem: () => ({
      news_id: "",
      date: new Date().toISOString().slice(0, 10),
      category: NEWS_CATEGORIES[0],
      title: "",
      summary: "",
      content: "",
      cover_image_url: null,
      cover_image_path: null,
      related_project_id: null,
      related_publication_id: null,
      external_url: null,
    }),
  },
  {
    key: "projects",
    label: "Projects",
    idKey: "project_id",
    titleKey: "title",
    fields: [
      { key: "project_id", label: "Slug", kind: "text", required: true, slugify: true },
      { key: "title", label: "Title", kind: "text", required: true },
      { key: "year", label: "Year", kind: "number", required: true },
      { key: "project_status", label: "Status", kind: "select", required: true, options: PROJECT_STATUSES },
      { key: "summary", label: "Summary", kind: "textarea", required: true },
      { key: "cover_image_url", label: "Cover Image", kind: "image", imageType: "projects", pathKey: "cover_image_path" },
      { key: "technologies", label: "Technologies", kind: "tags" },
      { key: "research_areas", label: "Research Areas", kind: "tags" },
    ],
    emptyItem: () => ({
      project_id: "",
      title: "",
      year: new Date().getFullYear(),
      project_status: PROJECT_STATUSES[0],
      summary: "",
      cover_image_url: null,
      cover_image_path: null,
      technologies: [],
      research_areas: [],
    }),
  },
  {
    key: "people",
    label: "People",
    idKey: "person_id",
    titleKey: "name",
    fields: [
      { key: "person_id", label: "Slug", kind: "text", required: true, slugify: true },
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "roles", label: "Roles", kind: "tags" },
      { key: "biography", label: "Biography", kind: "textarea" },
      { key: "research_interests", label: "Research Interests", kind: "tags" },
      { key: "avatar_url", label: "Avatar (square photo recommended)", kind: "image", imageType: "people", pathKey: "avatar_path" },
      { key: "email", label: "Email", kind: "text" },
      { key: "github_url", label: "GitHub URL", kind: "text" },
      { key: "scholar_url", label: "Google Scholar URL", kind: "text" },
      { key: "linkedin_url", label: "LinkedIn URL", kind: "text" },
      { key: "orcid", label: "ORCID", kind: "text" },
    ],
    emptyItem: () => ({
      person_id: "",
      name: "",
      roles: [],
      biography: null,
      research_interests: [],
      avatar_url: null,
      avatar_path: null,
      email: null,
      github_url: null,
      scholar_url: null,
      linkedin_url: null,
      orcid: null,
    }),
  },
  {
    key: "publications",
    label: "Publications",
    idKey: "pub_id",
    titleKey: "title",
    fields: [
      { key: "pub_id", label: "Slug", kind: "text", required: true, slugify: true },
      { key: "title", label: "Title", kind: "text", required: true },
      { key: "authors", label: "Authors", kind: "tags" },
      { key: "year", label: "Year", kind: "number", required: true },
      { key: "venue", label: "Venue", kind: "text" },
      { key: "pub_type", label: "Type", kind: "select", required: true, options: PUB_TYPES },
      { key: "pub_status", label: "Status", kind: "select", options: PUB_STATUSES },
      { key: "abstract", label: "Abstract", kind: "textarea" },
      { key: "keywords", label: "Keywords", kind: "tags" },
      { key: "research_areas", label: "Research Areas", kind: "tags" },
      { key: "pdf_url", label: "PDF URL", kind: "text" },
      { key: "doi", label: "DOI URL", kind: "text" },
      { key: "code_url", label: "Code URL", kind: "text" },
      { key: "bibtex", label: "BibTeX", kind: "code" },
    ],
    emptyItem: () => ({
      pub_id: "",
      title: "",
      authors: [],
      year: new Date().getFullYear(),
      venue: null,
      pub_type: PUB_TYPES[0],
      pub_status: PUB_STATUSES[0],
      abstract: null,
      keywords: [],
      research_areas: [],
      pdf_url: null,
      doi: null,
      code_url: null,
      bibtex: null,
    }),
  },
];
