-- Migration: 010_qa_report
-- Created: 2026-08-15
-- Description: Phase 5 of the news pipeline redesign -- per-language QA
-- reports from the critic pass, surfaced in /admin for human review before
-- publish. Not part of published output; see
-- docs/architecture/news-automation.md.

alter table public.news_drafts add column if not exists qa_report jsonb;
-- Nullable: existing rows predate this column, and even a freshly
-- generated row can end up with a partial/empty report if every
-- language's critic call fails (never blocks the run, see
-- scripts/generate_news.py::_build_qa_report).
