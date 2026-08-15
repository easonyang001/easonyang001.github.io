-- Migration: 011_deep_dive_arxiv_id
-- Created: 2026-08-15
-- Description: links a news_drafts row to the arxiv_id that was that
-- week's deep-dive candidate, so /admin can look up its paper_intelligence
-- record (see supabase/migrations/009_paper_intelligence.sql) and show it
-- as an Evidence panel. See docs/architecture/news-automation.md.

alter table public.news_drafts add column if not exists deep_dive_arxiv_id text;
-- Nullable: null whenever there was no deep-dive candidate that week, or
-- its full-text analysis failed (ar5iv didn't render it) -- see
-- scripts/generate_news.py::_get_deep_dive_analysis.
