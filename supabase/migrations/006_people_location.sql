-- Migration: 006_people_location
-- Created: 2026-08-03
-- Description: country/city fields for content_people, used by the About page's network map

alter table public.content_people
  add column if not exists location_country text,
  add column if not exists location_city text;
