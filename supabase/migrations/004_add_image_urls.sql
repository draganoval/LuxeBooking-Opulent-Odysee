-- Add image_url support for hotels and destinations.
alter table if exists public.hotels
add column if not exists image_url text;

alter table if exists public.destinations
add column if not exists image_url text;