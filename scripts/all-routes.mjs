// Canonical list of every crawlable route, shared by generate-sitemap.mjs
// (which needs changefreq/priority) and prerender.mjs (which just needs the
// path). /admin is excluded on purpose: it's behind login, disallowed in
// robots.txt, and has no content worth prerendering.
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const STATIC_PATHS = [
  "/",
  "/about",
  "/research",
  "/projects",
  "/solutions",
  "/publications",
  "/people",
  "/news",
  "/digest",
  "/education",
  "/opensource",
  "/lab",
  "/lab/bloch-sphere",
  "/lab/circuit",
  "/lab/vqc",
  "/lab/vqe-h2",
  "/lab/qubo",
  "/lab/annealing",
  "/lab/quantum-kernel",
  "/lab/barren-plateau",
  "/contact",
];

/** @param {string} repoRoot */
export async function getAllRoutePaths(repoRoot) {
  const { researchAreas } = await import(pathToFileURL(resolve(repoRoot, "src/data/research.ts")).href);
  const { projects } = await import(pathToFileURL(resolve(repoRoot, "src/data/projects.ts")).href);
  const { people } = await import(pathToFileURL(resolve(repoRoot, "src/data/people.ts")).href);
  const { news } = await import(pathToFileURL(resolve(repoRoot, "src/data/news.ts")).href);

  // src/data/cases/index.ts uses Vite's import.meta.glob, which only works
  // inside a Vite build -- read the same directory by hand here instead.
  const casesDir = resolve(repoRoot, "src/data/cases");
  const publishedCases = readdirSync(casesDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(resolve(casesDir, f), "utf-8")))
    .filter((c) => c.meta?.status === "published");

  // Publications remain a single-page timeline. News entries with article
  // content have individual, crawlable detail pages.
  const dynamicPaths = [
    ...researchAreas.map((r) => `/research/${r.slug}`),
    ...projects.map((p) => `/projects/${p.slug}`),
    ...people.map((p) => `/people/${p.slug}`),
    ...news.filter((item) => item.content).map((item) => `/news/${item.slug}`),
    ...publishedCases.map((c) => `/solutions/${c.meta.slug}`),
  ];

  return [...STATIC_PATHS, ...dynamicPaths];
}
