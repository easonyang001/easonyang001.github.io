-- Migration: 008_news_draft_kind
-- Created: 2026-08-06
-- Description: split the single weekly news draft into two independent
-- articles per week -- the weekly digest ("weekly") and a paper-only
-- deep-dive ("paper_deep_dive") -- instead of one draft per week_label.

alter table public.news_drafts
  add column if not exists kind text not null default 'weekly'
    check (kind in ('weekly', 'paper_deep_dive'));

-- The old constraint allowed only one draft per week, full stop. Replace it
-- with one draft per (week, kind) so the two article types don't collide.
alter table public.news_drafts
  drop constraint if exists news_drafts_week_label_key;

alter table public.news_drafts
  add constraint news_drafts_week_label_kind_key unique (week_label, kind);

create index if not exists news_drafts_kind_idx on public.news_drafts (kind);
