import { XMLParser } from "fast-xml-parser";
import type { RawArxivPaper } from "./types.ts";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function extractArxivId(idUrl: string): string {
  const match = idUrl.match(/abs\/([^v]+)/);
  return match ? match[1] : idUrl;
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

interface FeedAuthor {
  name?: string;
}

interface FeedCategory {
  "@_term"?: string;
}

interface FeedEntry {
  id?: string;
  title?: string;
  summary?: string;
  published?: string;
  updated?: string;
  author?: FeedAuthor | FeedAuthor[];
  category?: FeedCategory | FeedCategory[];
}

/** Parses an arXiv API Atom feed response into raw paper records. */
export function parseAtomFeed(xml: string): RawArxivPaper[] {
  const parsed = parser.parse(xml) as { feed?: { entry?: FeedEntry | FeedEntry[] } };
  const entries = toArray(parsed?.feed?.entry);

  return entries.map((entry) => {
    const authors = toArray(entry.author)
      .map((a) => (typeof a?.name === "string" ? a.name : ""))
      .filter(Boolean);
    const categories = toArray(entry.category)
      .map((c) => c?.["@_term"])
      .filter((term): term is string => Boolean(term));
    const idUrl = String(entry.id ?? "");

    return {
      arxivId: extractArxivId(idUrl),
      title: normalizeWhitespace(String(entry.title ?? "")),
      authors,
      categories,
      submittedDate: String(entry.published ?? entry.updated ?? "").slice(0, 10),
      arxivUrl: idUrl,
      abstract: normalizeWhitespace(String(entry.summary ?? "")),
    };
  });
}
