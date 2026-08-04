// Regenerates public/sitemap.xml from the static top-level routes plus every
// slug in the site's data modules, so new research areas / projects /
// publications / people / solutions cases show up without hand-editing the
// sitemap. Runs as part of `npm run build`.
import { writeFileSync, readdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const OUT_PATH = resolve(REPO_ROOT, "public/sitemap.xml");
const BASE_URL = "https://mrama.org";

const { researchAreas } = await import("../src/data/research.ts");
const { projects } = await import("../src/data/projects.ts");
const { people } = await import("../src/data/people.ts");

// src/data/cases/index.ts uses Vite's import.meta.glob, which only works
// inside a Vite build -- read the same directory by hand here instead.
const CASES_DIR = resolve(REPO_ROOT, "src/data/cases");
const publishedCases = readdirSync(CASES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(resolve(CASES_DIR, f), "utf-8")))
  .filter((c) => c.meta?.status === "published");

const STATIC_ROUTES = [
  { path: "/", changefreq: "monthly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.9" },
  { path: "/research", changefreq: "monthly", priority: "0.8" },
  { path: "/projects", changefreq: "monthly", priority: "0.7" },
  { path: "/solutions", changefreq: "weekly", priority: "0.7" },
  { path: "/publications", changefreq: "weekly", priority: "0.7" },
  { path: "/people", changefreq: "monthly", priority: "0.6" },
  { path: "/news", changefreq: "weekly", priority: "0.7" },
  { path: "/digest", changefreq: "weekly", priority: "0.5" },
  { path: "/education", changefreq: "monthly", priority: "0.6" },
  { path: "/opensource", changefreq: "monthly", priority: "0.6" },
  { path: "/lab", changefreq: "monthly", priority: "0.6" },
  { path: "/lab/bloch-sphere", changefreq: "yearly", priority: "0.4" },
  { path: "/lab/circuit", changefreq: "yearly", priority: "0.4" },
  { path: "/lab/vqc", changefreq: "yearly", priority: "0.4" },
  { path: "/lab/vqe-h2", changefreq: "yearly", priority: "0.4" },
  { path: "/lab/qubo", changefreq: "yearly", priority: "0.4" },
  { path: "/lab/annealing", changefreq: "yearly", priority: "0.4" },
  { path: "/lab/quantum-kernel", changefreq: "yearly", priority: "0.4" },
  { path: "/lab/barren-plateau", changefreq: "yearly", priority: "0.4" },
  { path: "/contact", changefreq: "yearly", priority: "0.5" },
];

// publications and news have no individual detail routes (single-page
// timeline layouts) -- only research/projects/people/solutions do.
const DYNAMIC_ROUTES = [
  ...researchAreas.map((r) => ({ path: `/research/${r.slug}`, changefreq: "monthly", priority: "0.6" })),
  ...projects.map((p) => ({ path: `/projects/${p.slug}`, changefreq: "monthly", priority: "0.5" })),
  ...people.map((p) => ({ path: `/people/${p.slug}`, changefreq: "monthly", priority: "0.5" })),
  ...publishedCases.map((c) => ({ path: `/solutions/${c.meta.slug}`, changefreq: "monthly", priority: "0.6" })),
];

const urls = [...STATIC_ROUTES, ...DYNAMIC_ROUTES]
  .map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${BASE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(OUT_PATH, xml);
console.log(`Generated ${OUT_PATH} with ${STATIC_ROUTES.length + DYNAMIC_ROUTES.length} URLs`);
