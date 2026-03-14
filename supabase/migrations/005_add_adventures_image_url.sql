-- Add image_url support for adventure stories.
alter table if exists public.adventures
add column if not exists image_url text;