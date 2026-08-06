-- Migration: 008_news_drafts_allow_multiple_per_week
-- Created: 2026-08-06
-- Description: the scheduled run still produces at most one draft per week,
-- but a manually triggered run (workflow_dispatch --force) should be able
-- to add another draft for the same week on top of it, instead of being
-- blocked or overwriting the existing one. Drop the per-week uniqueness so
-- multiple drafts can coexist; the plain index (from 007) already covers
-- the week_label lookups check_existing_draft relies on.

alter table public.news_drafts
  drop constraint if exists news_drafts_week_label_key;
