import type { NewsItem } from "../types/index.ts";

export const news: NewsItem[] = [
  {
    slug: "website-launched",
    date: "2026-07-31",
    category: "Announcement",
    title: "[SAMPLE] Website Launched",
    summary:
      "Mrama Institute officially launches its website, introducing our research mission and ongoing projects to the public.",
    content: null,
    coverImageUrl: null,
    relatedProjectSlug: null,
    relatedPublicationSlug: null,
    externalUrl: null,
  },
  {
    slug: "research-accepted",
    date: "2026-05-14",
    category: "Publication",
    title: "[SAMPLE] Research Accepted",
    summary:
      "Our work on quantum annealing approaches to facility placement optimization was accepted for presentation at IEEE Quantum Week.",
    content: null,
    coverImageUrl: null,
    relatedProjectSlug: "aed-placement-optimization",
    relatedPublicationSlug: "quantum-annealing-facility-placement",
    externalUrl: null,
  },
  {
    slug: "conference-presentation",
    date: "2026-02-20",
    category: "Event",
    title: "[SAMPLE] Conference Presentation",
    summary: "Presented hybrid quantum-classical solver research at the Quantum Machine Intelligence Workshop.",
    content: null,
    coverImageUrl: null,
    relatedProjectSlug: "hybrid-quantum-solver",
    relatedPublicationSlug: null,
    externalUrl: null,
  },
  {
    slug: "publication-released",
    date: "2025-11-03",
    category: "Publication",
    title: "[SAMPLE] Publication Released",
    summary: "Published new findings on hybrid quantum-classical solvers for constrained nutritional planning.",
    content: null,
    coverImageUrl: null,
    relatedProjectSlug: "quantum-diet-optimization",
    relatedPublicationSlug: "hybrid-quantum-classical-diet-solver",
    externalUrl: null,
  },
];
