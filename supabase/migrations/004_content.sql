-- Migration: 004_content
-- Created: 2026-08-03
-- Description: draft/publish tables for News, Projects, People, Publications

create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

-- News ------------------------------------------------------------------

create table if not exists public.content_news (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  status      text not null default 'draft'
                check (status in ('draft', 'published', 'archived')),
  news_id     text not null unique check (news_id ~ '^[a-z0-9-]+$'),
  date        date not null,
  category    text not null
                check (category in (
                  'Publication', 'Research Update', 'Project',
                  'Announcement', 'Event')),
  title       text not null check (char_length(title) between 1 and 200),
  summary     text not null check (char_length(summary) between 1 and 500),
  content     text,
  cover_image_url  text,
  cover_image_path text,
  related_project_id     text,
  related_publication_id text,
  external_url text
);

create index if not exists content_news_status_idx     on public.content_news (status);
create index if not exists content_news_news_id_idx    on public.content_news (news_id);
create index if not exists content_news_created_at_idx on public.content_news (created_at desc);

drop trigger if exists content_news_updated_at on public.content_news;
create trigger content_news_updated_at
  before update on public.content_news
  for each row execute function update_updated_at();

-- Projects ----------------------------------------------------------------

create table if not exists public.content_projects (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  status         text not null default 'draft'
                   check (status in ('draft', 'published', 'archived')),
  project_id     text not null unique check (project_id ~ '^[a-z0-9-]+$'),
  title          text not null,
  year           integer not null,
  project_status text not null
                   check (project_status in ('Active', 'Completed', 'On Hold')),
  summary        text not null,
  cover_image_url  text,
  cover_image_path text,
  technologies   text[] not null default '{}',
  research_areas text[] not null default '{}'
);

create index if not exists content_projects_status_idx     on public.content_projects (status);
create index if not exists content_projects_project_id_idx on public.content_projects (project_id);
create index if not exists content_projects_created_at_idx on public.content_projects (created_at desc);

drop trigger if exists content_projects_updated_at on public.content_projects;
create trigger content_projects_updated_at
  before update on public.content_projects
  for each row execute function update_updated_at();

-- People --------------------------------------------------------------------

create table if not exists public.content_people (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  status       text not null default 'draft'
                 check (status in ('draft', 'published', 'archived')),
  person_id    text not null unique check (person_id ~ '^[a-z0-9-]+$'),
  name         text not null,
  roles        text[] not null default '{}',
  biography    text,
  research_interests text[] not null default '{}',
  avatar_url   text,
  avatar_path  text,
  email        text,
  github_url   text,
  scholar_url  text,
  linkedin_url text,
  orcid        text
);

create index if not exists content_people_status_idx    on public.content_people (status);
create index if not exists content_people_person_id_idx on public.content_people (person_id);
create index if not exists content_people_created_at_idx on public.content_people (created_at desc);

drop trigger if exists content_people_updated_at on public.content_people;
create trigger content_people_updated_at
  before update on public.content_people
  for each row execute function update_updated_at();

-- Publications ----------------------------------------------------------------

create table if not exists public.content_publications (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  status         text not null default 'draft'
                   check (status in ('draft', 'published', 'archived')),
  pub_id         text not null unique check (pub_id ~ '^[a-z0-9-]+$'),
  title          text not null,
  authors        text[] not null default '{}',
  year           integer not null,
  venue          text,
  pub_type       text not null
                   check (pub_type in (
                     'Journal Article', 'Conference Paper', 'Full Paper',
                     'Poster', 'Workshop Paper', 'Preprint', 'Research Note')),
  pub_status     text not null default 'Published'
                   check (pub_status in ('Published', 'Under Review', 'Accepted', 'Preprint')),
  abstract       text,
  keywords       text[] not null default '{}',
  research_areas text[] not null default '{}',
  pdf_url        text,
  doi            text,
  code_url       text,
  bibtex         text
);

create index if not exists content_publications_status_idx  on public.content_publications (status);
create index if not exists content_publications_pub_id_idx  on public.content_publications (pub_id);
create index if not exists content_publications_created_at_idx on public.content_publications (created_at desc);

drop trigger if exists content_publications_updated_at on public.content_publications;
create trigger content_publications_updated_at
  before update on public.content_publications
  for each row execute function update_updated_at();

-- RLS: no anon policy on any of these tables. All access goes through the
-- backend, which uses the service_role key and bypasses RLS entirely.

alter table public.content_news         enable row level security;
alter table public.content_projects     enable row level security;
alter table public.content_people       enable row level security;
alter table public.content_publications enable row level security;
