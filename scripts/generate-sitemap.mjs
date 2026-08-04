// Regenerates public/sitemap.xml from the shared route list (all-routes.mjs)
// so new research areas / projects / publications / people / solutions cases
// show up without hand-editing the sitemap. Runs as part of `npm run build`.
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getAllRoutePaths } from "./all-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const OUT_PATH = resolve(REPO_ROOT, "public/sitemap.xml");
const BASE_URL = "https://mrama.org";

// Priority/changefreq per path prefix -- falls back to a sane default for
// any path not explicitly listed (new dynamic slugs, etc.).
const RULES = [
  { test: (p) => p === "/", changefreq: "monthly", priority: "1.0" },
  { test: (p) => p === "/about", changefreq: "monthly", priority: "0.9" },
  { test: (p) => p === "/research", changefreq: "monthly", priority: "0.8" },
  { test: (p) => p.startsWith("/research/"), changefreq: "monthly", priority: "0.6" },
  { test: (p) => p === "/solutions", changefreq: "weekly", priority: "0.7" },
  { test: (p) => p.startsWith("/solutions/"), changefreq: "monthly", priority: "0.6" },
  { test: (p) => p === "/publications", changefreq: "weekly", priority: "0.7" },
  { test: (p) => p === "/projects", changefreq: "monthly", priority: "0.7" },
  { test: (p) => p.startsWith("/projects/"), changefreq: "monthly", priority: "0.5" },
  { test: (p) => p === "/people", changefreq: "monthly", priority: "0.6" },
  { test: (p) => p.startsWith("/people/"), changefreq: "monthly", priority: "0.5" },
  { test: (p) => p === "/news", changefreq: "weekly", priority: "0.7" },
  { test: (p) => p === "/digest", changefreq: "weekly", priority: "0.5" },
  { test: (p) => p === "/education", changefreq: "monthly", priority: "0.6" },
  { test: (p) => p === "/opensource", changefreq: "monthly", priority: "0.6" },
  { test: (p) => p === "/lab", changefreq: "monthly", priority: "0.6" },
  { test: (p) => p.startsWith("/lab/"), changefreq: "yearly", priority: "0.4" },
  { test: (p) => p === "/contact", changefreq: "yearly", priority: "0.5" },
];

function metaFor(path) {
  const rule = RULES.find((r) => r.test(path));
  return rule ? { changefreq: rule.changefreq, priority: rule.priority } : { changefreq: "monthly", priority: "0.5" };
}

const paths = await getAllRoutePaths(REPO_ROOT);

const urls = paths
  .map((path) => {
    const { changefreq, priority } = metaFor(path);
    return `  <url>
    <loc>${BASE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(OUT_PATH, xml);
console.log(`Generated ${OUT_PATH} with ${paths.length} URLs`);
