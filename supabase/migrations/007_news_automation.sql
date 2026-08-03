-- Migration: 007_news_automation
-- Created: 2026-08-03
-- Description: weekly quantum news automation -- seen-item dedup ledger and
-- LLM-generated drafts awaiting human review before publish.

-- Seen items (dedup) ---------------------------------------------------------

create table if not exists public.news_seen_items (
  id         uuid primary key default gen_random_uuid(),
  item_id    text not null unique,
  -- arXiv papers use the arXiv ID (e.g. 2407.12345); news articles use the
  -- first 16 hex chars of sha256(url).
  source     text not null check (source in ('arxiv', 'news')),
  seen_at    timestamptz not null default now()
);

create index if not exists news_seen_items_item_id_idx on public.news_seen_items (item_id);

-- Drafts ----------------------------------------------------------------------

create table if not exists public.news_drafts (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  week_label   text not null unique,
  -- Format: 2026-W32 -- guarantees at most one draft per week.

  status       text not null default 'draft'
                 check (status in (
                   'draft',      -- generated, not yet reviewed
                   'approved',   -- reviewed, awaiting publish
                   'published',  -- published
                   'rejected'    -- skipped for this week
                 )),

  title        text not null,
  content_md   text not null,
  -- Markdown, rendered/editable in the Admin panel via Tiptap.

  sources      jsonb not null default '[]'::jsonb,
  -- Shape: [{ type: "arxiv"|"news", id, title, url, relevanceScore }]

  model        text not null,
  -- Which OpenAI model generated this draft, e.g. "gpt-4o-mini".

  prompt_hash  text not null,
  -- sha256(prompt), for reproducing/debugging a past generation.

  reviewed_by  text,
  reviewed_at  timestamptz,
  published_at timestamptz
);

create index if not exists news_drafts_status_idx     on public.news_drafts (status);
create index if not exists news_drafts_week_label_idx on public.news_drafts (week_label);

drop trigger if exists news_drafts_updated_at on public.news_drafts;
create trigger news_drafts_updated_at
  before update on public.news_drafts
  for each row execute function update_updated_at();
-- update_updated_at() was created in migration 004_content.sql.

-- RLS: no anon policy on either table -- all access goes through the
-- automation script and the admin backend, both of which use the
-- service_role key and bypass RLS entirely.

alter table public.news_seen_items enable row level security;
alter table public.news_drafts     enable row level security;
