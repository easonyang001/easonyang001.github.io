-- Migration: 005_storage
-- Created: 2026-08-02
-- Description: content-images Storage bucket (public read, service_role-only write)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images',
  'content-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Bucket is already public=true above; this policy is belt-and-suspenders
-- for anon reads via the storage.objects table directly.
create policy "public can read content-images"
  on storage.objects for select to anon
  using (bucket_id = 'content-images');

-- No insert/update/delete policy for anon on purpose. Uploads and deletes
-- only ever happen through the backend, which uses the service_role key
-- and bypasses RLS entirely -- see server/src/routes/images.ts.
