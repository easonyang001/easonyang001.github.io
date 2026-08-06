-- Migration: 009_news_drafts_drop_kind_leftover
-- Created: 2026-08-06
-- Description: an earlier, abandoned design added a `kind` column and a
-- unique(week_label, kind) constraint to news_drafts. That design was
-- dropped before it shipped in code, but the schema change had already
-- been applied by hand, so it was never cleaned up. 008 tried to drop the
-- original unique(week_label) constraint, but by then it no longer existed
-- under that name -- the abandoned migration had already replaced it with
-- unique(week_label, kind), which still blocked inserting a second draft
-- for the same week (every insert defaults kind to 'weekly', so the second
-- draft collides with the first on (week_label, 'weekly')).
--
-- This removes that leftover column and constraint. No code references
-- `kind` -- see migration 008 and the current news_drafts insert path.

alter table public.news_drafts
  drop constraint if exists news_drafts_week_label_kind_key;

drop index if exists public.news_drafts_kind_idx;

alter table public.news_drafts
  drop column if exists kind;

-- Belt and suspenders: make sure the original per-week uniqueness (which
-- 008 intended to remove) is actually gone under any name it might have.
alter table public.news_drafts
  drop constraint if exists news_drafts_week_label_key;
