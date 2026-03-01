-- Ensure row-level security is enabled for bookings.
alter table public.bookings enable row level security;

-- ---------------------------------
-- bookings policies (authenticated)
-- ---------------------------------

drop policy if exists "Users can create their own bookings" on public.bookings;
create policy "Users can create their own bookings"
on public.bookings
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can read their own bookings" on public.bookings;
create policy "Users can read their own bookings"
on public.bookings
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can update their own bookings" on public.bookings;
create policy "Users can update their own bookings"
on public.bookings
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ---------------------------------
-- storage.objects policies (uploads)
-- ---------------------------------

drop policy if exists "Allow authenticated users to insert uploads" on storage.objects;
create policy "Allow authenticated users to insert uploads"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'uploads');

drop policy if exists "Allow authenticated users to select uploads" on storage.objects;
create policy "Allow authenticated users to select uploads"
on storage.objects
for select
to authenticated
using (bucket_id = 'uploads');
