import type { LucideIcon } from "lucide-react";

export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  aboutBlurb: string;
  foundedYear: number;
  email: string | null;
  githubUrl: string | null;
  githubHandle: string | null;
  location: string | null;
}

export type ResearchAreaStatus = "active" | "exploratory" | "educational";

export interface ResearchArea {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
  status: ResearchAreaStatus;
  relatedLabTools?: string[];
}

export interface Project {
  slug: string;
  title: string;
  status: string;
  description: string;
  tags: string[];
  readMoreUrl: string | null;
}

export interface Publication {
  slug: string;
  title: string;
  conference: string;
  year: string;
  area: string;
  type: string;
  status: string;
  abstract: string;
  pdfUrl: string | null;
  doiUrl: string | null;
  codeUrl: string | null;
  bibtex: string | null;
}

export interface Person {
  slug: string;
  name: string;
  role: string;
  interests: string[];
  avatarInitials: string;
  email: string | null;
  githubUrl: string | null;
}

export interface NewsItem {
  slug: string;
  date: string;
  title: string;
  description: string;
}

export interface EducationLesson {
  slug: string;
  title: string;
  description: string;
  status: "coming-soon" | "published";
}

export interface OpenSourceProject {
  slug: string;
  name: string;
  description: string;
  repoUrl: string | null;
  status: string;
}

export interface LabTool {
  slug: string;
  name: string;
  description: string;
  status: "coming-soon" | "published";
}

/** One arXiv listing in a weekly digest. No abstract text is ever stored. */
export interface DigestPaper {
  arxivId: string;
  title: string;
  authors: string[];
  categories: string[];
  submittedDate: string;
  arxivUrl: string;
  matchedKeywords: string[];
  summary: string;
}

export interface DigestWeek {
  week: string;
  papers: DigestPaper[];
}
