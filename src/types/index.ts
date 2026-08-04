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

export type ProjectStatus = "Active" | "Completed" | "On Hold";

export interface Project {
  slug: string;
  title: string;
  year: number;
  status: ProjectStatus;
  summary: string;
  coverImageUrl: string | null;
  technologies: string[];
  researchAreas: string[];
  readMoreUrl: string | null;
}

export type PublicationType =
  | "Journal Article"
  | "Conference Paper"
  | "Full Paper"
  | "Poster"
  | "Workshop Paper"
  | "Preprint"
  | "Research Note";

export type PublicationStatus = "Published" | "Under Review" | "Accepted" | "Preprint";

export interface Publication {
  slug: string;
  title: string;
  authors: string[];
  year: number;
  venue: string | null;
  type: PublicationType;
  status: PublicationStatus;
  abstract: string;
  keywords: string[];
  researchAreas: string[];
  pdfUrl: string | null;
  doiUrl: string | null;
  codeUrl: string | null;
  bibtex: string | null;
}

export interface Person {
  slug: string;
  name: string;
  roles: string[];
  biography: string | null;
  researchInterests: string[];
  avatarUrl: string | null;
  /** Fallback shown while avatarUrl is null (e.g. before a photo is uploaded). */
  avatarInitials: string;
  email: string | null;
  githubUrl: string | null;
  scholarUrl: string | null;
  linkedinUrl: string | null;
  orcid: string | null;
  /** Country name, used to place a marker on the About page's network map. */
  locationCountry: string | null;
  locationCity: string | null;
}

export type NewsCategory = "Publication" | "Research Update" | "Project" | "Announcement" | "Event";

export interface NewsItem {
  slug: string;
  date: string;
  category: NewsCategory;
  title: string;
  summary: string;
  content: string | null;
  coverImageUrl: string | null;
  relatedProjectSlug: string | null;
  relatedPublicationSlug: string | null;
  externalUrl: string | null;
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
  category?: string;
  difficulty?: "introductory" | "intermediate" | "advanced";
  objectives?: string[];
  workflow?: string[];
  visualizations?: string[];
  controls?: string[];
  modes?: {
    educational: string;
    research: string;
    challenge: string;
  };
  mathFocus?: string[];
  roadmap?: string[];
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
