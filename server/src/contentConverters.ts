function esc(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function str(value: string): string {
  return `"${esc(value)}"`;
}

function strOrNull(value: string | null): string {
  return value === null || value === "" ? "null" : str(value);
}

function strArray(values: string[]): string {
  return `[${values.map(str).join(", ")}]`;
}

export interface NewsRow {
  news_id: string;
  date: string;
  category: string;
  title: string;
  summary: string;
  content: string | null;
  cover_image_url: string | null;
  related_project_id: string | null;
  related_publication_id: string | null;
  external_url: string | null;
}

export function newsToTypeScript(rows: NewsRow[]): string {
  const body = rows
    .map(
      (r) => `  {
    slug: ${str(r.news_id)},
    date: ${str(r.date)},
    category: ${str(r.category)},
    title: ${str(r.title)},
    summary: ${str(r.summary)},
    content: ${strOrNull(r.content)},
    coverImageUrl: ${strOrNull(r.cover_image_url)},
    relatedProjectSlug: ${strOrNull(r.related_project_id)},
    relatedPublicationSlug: ${strOrNull(r.related_publication_id)},
    externalUrl: ${strOrNull(r.external_url)},
  }`
    )
    .join(",\n");
  return `import type { NewsItem } from "../types/index.ts";\n\nexport const news: NewsItem[] = [\n${body}\n];\n`;
}

export interface ProjectRow {
  project_id: string;
  title: string;
  year: number;
  project_status: string;
  summary: string;
  cover_image_url: string | null;
  technologies: string[];
  research_areas: string[];
}

export function projectsToTypeScript(rows: ProjectRow[]): string {
  const body = rows
    .map(
      (r) => `  {
    slug: ${str(r.project_id)},
    title: ${str(r.title)},
    year: ${r.year},
    status: ${str(r.project_status)},
    summary: ${str(r.summary)},
    coverImageUrl: ${strOrNull(r.cover_image_url)},
    technologies: ${strArray(r.technologies)},
    researchAreas: ${strArray(r.research_areas)},
    readMoreUrl: null,
  }`
    )
    .join(",\n");
  return `import type { Project } from "../types/index.ts";\n\nexport const projects: Project[] = [\n${body}\n];\n`;
}

export interface PersonRow {
  person_id: string;
  name: string;
  roles: string[];
  biography: string | null;
  research_interests: string[];
  avatar_url: string | null;
  email: string | null;
  github_url: string | null;
  scholar_url: string | null;
  linkedin_url: string | null;
  orcid: string | null;
}

/** Falls back to a two-letter initial when no avatar has been uploaded yet. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function peopleToTypeScript(rows: PersonRow[]): string {
  const body = rows
    .map(
      (r) => `  {
    slug: ${str(r.person_id)},
    name: ${str(r.name)},
    roles: ${strArray(r.roles)},
    biography: ${strOrNull(r.biography)},
    researchInterests: ${strArray(r.research_interests)},
    avatarUrl: ${strOrNull(r.avatar_url)},
    avatarInitials: ${str(initialsOf(r.name))},
    email: ${strOrNull(r.email)},
    githubUrl: ${strOrNull(r.github_url)},
    scholarUrl: ${strOrNull(r.scholar_url)},
    linkedinUrl: ${strOrNull(r.linkedin_url)},
    orcid: ${strOrNull(r.orcid)},
  }`
    )
    .join(",\n");
  return `import type { Person } from "../types/index.ts";\n\nexport const people: Person[] = [\n${body}\n];\n`;
}

export interface PublicationRow {
  pub_id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string | null;
  pub_type: string;
  pub_status: string;
  abstract: string | null;
  keywords: string[];
  research_areas: string[];
  pdf_url: string | null;
  doi: string | null;
  code_url: string | null;
  bibtex: string | null;
}

export function publicationsToTypeScript(rows: PublicationRow[]): string {
  const body = rows
    .map(
      (r) => `  {
    slug: ${str(r.pub_id)},
    title: ${str(r.title)},
    authors: ${strArray(r.authors)},
    year: ${r.year},
    venue: ${strOrNull(r.venue)},
    type: ${str(r.pub_type)},
    status: ${str(r.pub_status)},
    abstract: ${str(r.abstract ?? "")},
    keywords: ${strArray(r.keywords)},
    researchAreas: ${strArray(r.research_areas)},
    pdfUrl: ${strOrNull(r.pdf_url)},
    doiUrl: ${strOrNull(r.doi)},
    codeUrl: ${strOrNull(r.code_url)},
    bibtex: ${strOrNull(r.bibtex)},
  }`
    )
    .join(",\n");
  return `import type { Publication } from "../types/index.ts";\n\nexport const publications: Publication[] = [\n${body}\n];\n`;
}
