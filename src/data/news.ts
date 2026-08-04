import type { NewsItem } from "../types/index.ts";

export const news: NewsItem[] = [
  {
    slug: "a",
    date: "2004-06-27",
    category: "Publication",
    title: "a",
    summary: "a",
    content: "<p>a</p>",
    coverImageUrl: null,
    relatedProjectSlug: "a",
    relatedPublicationSlug: "a",
    externalUrl: "a",
  },
  {
    slug: "weekly-quantum-news-2026-w99",
    date: "2026-08-04",
    category: "Research Update",
    title: "[TEST] 量子週報測試草稿",
    summary: "測試",
    content: "測試\n<p>這是一份測試草稿，用來驗證 Stage 5/7 的真實 Supabase 串接。</p>\n",
    coverImageUrl: null,
    relatedProjectSlug: null,
    relatedPublicationSlug: null,
    externalUrl: null,
  }
];
