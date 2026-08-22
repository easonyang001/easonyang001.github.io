// Renders every known route with a real headless browser after `vite build`
// and writes the fully-rendered HTML into dist/<route>/index.html, so
// GitHub Pages serves complete content on first request instead of the
// empty CSR shell. See docs/SEO_PLAN.md §3.3.
//
// Runs as part of `npm run build`, after copy-404.mjs (404.html must stay a
// snapshot of the pristine empty shell, for routes this script doesn't
// know about, so it has to be copied before this script overwrites
// dist/index.html).
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { resolve, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { getAllRoutePaths } from "./all-routes.mjs";

if (process.env.VERCEL) {
  console.log("Skipping Playwright prerender on Vercel; using Vite output.");
  process.exit(0);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const DIST_DIR = resolve(REPO_ROOT, "dist");
const PORT = 4174;

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/**
 * Minimal static file server with SPA fallback, matching how GitHub Pages
 * serves this site via 404.html. Falls back to 404.html specifically (the
 * pristine empty-shell copy copy-404.mjs made before this script runs),
 * never to dist/index.html -- that file gets overwritten with "/"'s fully
 * rendered output as soon as the homepage is prerendered, and serving that
 * stale snapshot as the shell for every other route would bake the
 * homepage's own content (e.g. the Hero intro overlay) into all of them.
 */
function startStaticServer() {
  const shellPath = resolve(DIST_DIR, "404.html");

  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    let filePath = resolve(DIST_DIR, "." + urlPath);

    const isDir = existsSync(filePath) && statSync(filePath).isDirectory();
    if (!existsSync(filePath) || isDir) {
      filePath = resolve(DIST_DIR, "." + urlPath, "index.html");
    }
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = shellPath;
    }

    const ext = extname(filePath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream" });
    res.end(readFileSync(filePath));
  });

  return new Promise((resolvePromise) => {
    server.listen(PORT, () => resolvePromise(server));
  });
}

function outputPathFor(routePath) {
  if (routePath === "/") return resolve(DIST_DIR, "index.html");
  return resolve(DIST_DIR, "." + routePath, "index.html");
}

async function main() {
  if (!existsSync(resolve(DIST_DIR, "404.html"))) {
    throw new Error("dist/404.html not found -- run scripts/copy-404.mjs before prerender.mjs");
  }

  const routePaths = await getAllRoutePaths(REPO_ROOT);
  const server = await startStaticServer();
  const browser = await chromium.launch(
    process.env.VERCEL
      ? {
          args: serverlessChromium.args,
          executablePath: await serverlessChromium.executablePath(),
          headless: true,
        }
      : undefined
  );

  try {
    const page = await browser.newPage();
    // Hero's intro overlay (src/components/Hero.tsx) portals a full-screen,
    // pointer-events:auto div directly onto document.body -- a sibling of
    // #root, outside anything React's client-side render ever touches. If a
    // route gets captured mid-intro, that div is baked into the static HTML
    // permanently and no client-side render can ever remove it. Mark the
    // intro as already-seen (same sessionStorage key/value Hero itself
    // writes once the intro finishes) before every navigation so it never
    // mounts during prerendering.
    await page.addInitScript(() => {
      window.sessionStorage.setItem("mrama-intro-seen", "1");
    });
    let failures = 0;

    for (const routePath of routePaths) {
      try {
        await page.goto(`http://localhost:${PORT}${routePath}`, { waitUntil: "networkidle", timeout: 30000 });
        // Let any post-networkidle client-side rendering (e.g. Framer Motion
        // entrance state, useSeo's effect) settle.
        await page.waitForTimeout(300);
        const html = await page.content();

        const outPath = outputPathFor(routePath);
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, html);
      } catch (error) {
        failures++;
        console.error(`Prerender failed for ${routePath}:`, error.message);
      }
    }

    if (failures > 0) {
      throw new Error(`${failures}/${routePaths.length} routes failed to prerender`);
    }
    console.log(`Prerendered ${routePaths.length} routes.`);
  } finally {
    await browser.close();
    server.close();
  }
}

await main();
