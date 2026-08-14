-- Migration: 009_paper_intelligence
-- Created: 2026-08-07
-- Description: Phase 1 of the news pipeline redesign -- full-text paper
-- analysis records ("Paper Intelligence"), cached by (arxiv_id, prompt_hash)
-- so an unchanged paper isn't re-analyzed every run. Feeds the
-- literatureDeepDive section of the weekly brief; see
-- docs/architecture/news-automation.md.

create table if not exists public.paper_intelligence (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  arxiv_id     text not null,
  prompt_hash  text not null,
  -- sha256 of the exact analysis prompt (paper metadata + extracted
  -- sections) -- changes whenever the paper's full text or the analysis
  -- prompt template changes, which is exactly when a cached result should
  -- no longer be served.

  analysis     jsonb not null,
  -- Validated Paper Intelligence record (see scripts/research/schemas.py):
  -- research_question, motivation, research_gap, core_contribution, method,
  -- experiments, key_results, author_claims, limitations,
  -- unsupported_or_weak_claims, evidence.

  model        text not null
  -- Which OpenAI model produced this analysis, e.g. "gpt-4o-mini".
);

create unique index if not exists paper_intelligence_arxiv_prompt_idx
  on public.paper_intelligence (arxiv_id, prompt_hash);

create index if not exists paper_intelligence_arxiv_id_idx
  on public.paper_intelligence (arxiv_id);

-- RLS: same posture as news_drafts/news_seen_items (migration 007) -- no
-- anon policy, only the automation script's service_role key touches this
-- table.
alter table public.paper_intelligence enable row level security;
