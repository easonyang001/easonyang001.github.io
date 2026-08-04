import { useEffect } from "react";

const SITE_NAME = "Mrama Institute for Quantum Information and Intelligence";
const BASE_URL = "https://mrama.org";

interface SeoOptions {
  /** Page-specific title. Omit on the homepage to use the site name as-is. */
  title?: string;
  description?: string;
  /** Canonical path, e.g. "/about" or `/research/${slug}`. */
  path: string;
}

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Sets document.title, meta description/OG/Twitter tags, and the canonical
 * link tag per route. This is a client-side SPA (no SSR/SSG), so these tags
 * are absent from the initial HTML crawlers see before JS runs -- see
 * docs/SEO_PLAN.md Phase 1 §3.3. Still worth doing: it's correct for
 * link-preview scrapers and for search engines' render pass, and it's the
 * groundwork Phase 3 (full OG/JSON-LD per page) builds on.
 */
export function useSeo({ title, description, path }: SeoOptions): void {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    const canonicalUrl = `${BASE_URL}${path}`;
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("property", "og:url", canonicalUrl);

    if (description) {
      setMetaTag("name", "description", description);
      setMetaTag("property", "og:description", description);
      setMetaTag("name", "twitter:description", description);
    }
  }, [title, description, path]);
}
