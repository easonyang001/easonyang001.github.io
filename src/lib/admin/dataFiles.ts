export type AdminItem = Record<string, string | string[] | null>;

export type FieldType = "text" | "textarea" | "richtext" | "tags" | "nullable-url" | "select";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

export interface AdminEntityConfig {
  key: string;
  label: string;
  filePath: string;
  fields: FieldConfig[];
  emptyItem: () => AdminItem;
  parse: (source: string) => AdminItem[];
  serialize: (items: AdminItem[]) => string;
}

function escapeString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function str(value: string): string {
  return `"${escapeString(value)}"`;
}

function strOrNull(value: string | null): string {
  return value === null || value === "" ? "null" : str(value);
}

function strArray(values: string[]): string {
  return `[${values.map(str).join(", ")}]`;
}

/** Extracts the `[ ... ]` array literal following `export const <name> ... =`. */
function extractArrayLiteral(source: string, exportName: string): string {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Could not find "${marker}" in file`);
  const bracketStart = source.indexOf("[", source.indexOf("=", start));
  if (bracketStart === -1) throw new Error(`Could not find array literal for "${exportName}"`);

  let depth = 0;
  for (let i = bracketStart; i < source.length; i++) {
    if (source[i] === "[") depth++;
    else if (source[i] === "]") {
      depth--;
      if (depth === 0) return source.slice(bracketStart, i + 1);
    }
  }
  throw new Error(`Unbalanced brackets while parsing "${exportName}"`);
}

/**
 * Evaluates a trusted array-literal string (plain string/array/null values only,
 * no expressions). Only ever called on this repo's own data files, never on
 * third-party or user-submitted input.
 */
function parseArrayLiteral(literal: string): AdminItem[] {
  // eslint-disable-next-line no-new-func
  const evaluate = new Function(`"use strict"; return (${literal});`) as () => AdminItem[];
  return evaluate();
}

const newsConfig: AdminEntityConfig = {
  key: "news",
  label: "News",
  filePath: "src/data/news.ts",
  fields: [
    { key: "slug", label: "Slug", type: "text" },
    { key: "date", label: "Date (YYYY-MM-DD)", type: "text" },
    { key: "title", label: "Title", type: "text" },
    { key: "description", label: "Description", type: "richtext" },
  ],
  emptyItem: () => ({ slug: "", date: "", title: "", description: "" }),
  parse: (source) => parseArrayLiteral(extractArrayLiteral(source, "news")),
  serialize: (items) => {
    const body = items
      .map(
        (i) => `  {
    slug: ${str(i.slug as string)},
    date: ${str(i.date as string)},
    title: ${str(i.title as string)},
    description: ${str(i.description as string)},
  }`
      )
      .join(",\n");
    return `import type { NewsItem } from "../types/index.ts";\n\nexport const news: NewsItem[] = [\n${body}\n];\n`;
  },
};

const projectsConfig: AdminEntityConfig = {
  key: "projects",
  label: "Projects",
  filePath: "src/data/projects.ts",
  fields: [
    { key: "slug", label: "Slug", type: "text" },
    { key: "title", label: "Title", type: "text" },
    { key: "status", label: "Status", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "tags", label: "Tags", type: "tags" },
    { key: "readMoreUrl", label: "Read More URL", type: "nullable-url" },
  ],
  emptyItem: () => ({ slug: "", title: "", status: "", description: "", tags: [], readMoreUrl: null }),
  parse: (source) => parseArrayLiteral(extractArrayLiteral(source, "projects")),
  serialize: (items) => {
    const body = items
      .map(
        (i) => `  {
    slug: ${str(i.slug as string)},
    title: ${str(i.title as string)},
    status: ${str(i.status as string)},
    description: ${str(i.description as string)},
    tags: ${strArray((i.tags as string[]) ?? [])},
    readMoreUrl: ${strOrNull(i.readMoreUrl as string | null)},
  }`
      )
      .join(",\n");
    return `import type { Project } from "../types/index.ts";\n\nexport const projects: Project[] = [\n${body}\n];\n`;
  },
};

const peopleConfig: AdminEntityConfig = {
  key: "people",
  label: "People",
  filePath: "src/data/people.ts",
  fields: [
    { key: "slug", label: "Slug", type: "text" },
    { key: "name", label: "Name", type: "text" },
    { key: "role", label: "Role", type: "text" },
    { key: "interests", label: "Interests", type: "tags" },
    { key: "avatarInitials", label: "Avatar Initials", type: "text" },
    { key: "email", label: "Email", type: "nullable-url" },
    { key: "githubUrl", label: "GitHub URL", type: "nullable-url" },
  ],
  emptyItem: () => ({
    slug: "",
    name: "",
    role: "",
    interests: [],
    avatarInitials: "",
    email: null,
    githubUrl: null,
  }),
  parse: (source) => parseArrayLiteral(extractArrayLiteral(source, "people")),
  serialize: (items) => {
    const body = items
      .map(
        (i) => `  {
    slug: ${str(i.slug as string)},
    name: ${str(i.name as string)},
    role: ${str(i.role as string)},
    interests: ${strArray((i.interests as string[]) ?? [])},
    avatarInitials: ${str(i.avatarInitials as string)},
    email: ${strOrNull(i.email as string | null)},
    githubUrl: ${strOrNull(i.githubUrl as string | null)},
  }`
      )
      .join(",\n");
    return `import type { Person } from "../types/index.ts";\n\nexport const people: Person[] = [\n${body}\n];\n`;
  },
};

const publicationsConfig: AdminEntityConfig = {
  key: "publications",
  label: "Publications",
  filePath: "src/data/publications.ts",
  fields: [
    { key: "slug", label: "Slug", type: "text" },
    { key: "title", label: "Title", type: "text" },
    { key: "conference", label: "Conference / Venue", type: "text" },
    { key: "year", label: "Year", type: "text" },
    { key: "area", label: "Research Area", type: "text" },
    { key: "type", label: "Type", type: "text" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Published", "Preprint"],
    },
    { key: "abstract", label: "Abstract", type: "richtext" },
    { key: "pdfUrl", label: "PDF URL", type: "nullable-url" },
    { key: "doiUrl", label: "DOI URL", type: "nullable-url" },
    { key: "codeUrl", label: "Code URL", type: "nullable-url" },
    { key: "bibtex", label: "BibTeX", type: "textarea" },
  ],
  emptyItem: () => ({
    slug: "",
    title: "",
    conference: "",
    year: "",
    area: "",
    type: "",
    status: "",
    abstract: "",
    pdfUrl: null,
    doiUrl: null,
    codeUrl: null,
    bibtex: null,
  }),
  parse: (source) => parseArrayLiteral(extractArrayLiteral(source, "publications")),
  serialize: (items) => {
    const body = items
      .map(
        (i) => `  {
    slug: ${str(i.slug as string)},
    title: ${str(i.title as string)},
    conference: ${str(i.conference as string)},
    year: ${str(i.year as string)},
    area: ${str(i.area as string)},
    type: ${str(i.type as string)},
    status: ${str(i.status as string)},
    abstract: ${str(i.abstract as string)},
    pdfUrl: ${strOrNull(i.pdfUrl as string | null)},
    doiUrl: ${strOrNull(i.doiUrl as string | null)},
    codeUrl: ${strOrNull(i.codeUrl as string | null)},
    bibtex: ${strOrNull(i.bibtex as string | null)},
  }`
      )
      .join(",\n");
    return `import type { Publication } from "../types/index.ts";\n\nexport const publications: Publication[] = [\n${body}\n];\n`;
  },
};

export const ADMIN_ENTITIES: AdminEntityConfig[] = [
  newsConfig,
  projectsConfig,
  peopleConfig,
  publicationsConfig,
];
