-- SoftUni Capstone (Luxe Booking MPA)
-- RLS migration.
-- Run this script in the Supabase SQL Editor after 001_init.sql.

-- Helper function: checks whether a given user has admin role.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = uid
      and ur.role = 'admin'
  );
$$;

-- 1) Enable RLS on all app tables.
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.hotels enable row level security;
alter table public.destinations enable row level security;
alter table public.bookings enable row level security;
alter table public.adventures enable row level security;

-- -----------------------------
-- profiles policies
-- -----------------------------

-- Select: user can read own profile OR admin can read all.
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (
  id = auth.uid()
  or public.is_admin(auth.uid())
);

-- Insert: authenticated user can insert only own profile row.
create policy "profiles_insert_own"
on public.profiles
for insert
with check (
  auth.uid() is not null
  and id = auth.uid()
);

-- Update: user can update own profile OR admin can update any profile.
create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (
  id = auth.uid()
  or public.is_admin(auth.uid())
)
with check (
  id = auth.uid()
  or public.is_admin(auth.uid())
);

-- Delete: admin only.
create policy "profiles_delete_admin_only"
on public.profiles
for delete
using (
  public.is_admin(auth.uid())
);

-- -----------------------------
-- user_roles policies
-- -----------------------------

-- Select: admin only.
create policy "user_roles_select_admin_only"
on public.user_roles
for select
using (
  public.is_admin(auth.uid())
);

-- Insert: admin only.
create policy "user_roles_insert_admin_only"
on public.user_roles
for insert
with check (
  public.is_admin(auth.uid())
);

-- Update: admin only.
create policy "user_roles_update_admin_only"
on public.user_roles
for update
using (
  public.is_admin(auth.uid())
)
with check (
  public.is_admin(auth.uid())
);

-- Delete: admin only.
create policy "user_roles_delete_admin_only"
on public.user_roles
for delete
using (
  public.is_admin(auth.uid())
);

-- -----------------------------
-- hotels policies
-- -----------------------------

-- Select: public.
create policy "hotels_select_public"
on public.hotels
for select
using (true);

-- Insert: admin only.
create policy "hotels_insert_admin_only"
on public.hotels
for insert
with check (
  public.is_admin(auth.uid())
);

-- Update: admin only.
create policy "hotels_update_admin_only"
on public.hotels
for update
using (
  public.is_admin(auth.uid())
)
with check (
  public.is_admin(auth.uid())
);

-- Delete: admin only.
create policy "hotels_delete_admin_only"
on public.hotels
for delete
using (
  public.is_admin(auth.uid())
);

-- -----------------------------
-- destinations policies
-- -----------------------------

-- Select: public.
create policy "destinations_select_public"
on public.destinations
for select
using (true);

-- Insert: admin only.
create policy "destinations_insert_admin_only"
on public.destinations
for insert
with check (
  public.is_admin(auth.uid())
);

-- Update: admin only.
create policy "destinations_update_admin_only"
on public.destinations
for update
using (
  public.is_admin(auth.uid())
)
with check (
  public.is_admin(auth.uid())
);

-- Delete: admin only.
create policy "destinations_delete_admin_only"
on public.destinations
for delete
using (
  public.is_admin(auth.uid())
);

-- -----------------------------
-- adventures policies
-- -----------------------------

-- Select: public.
create policy "adventures_select_public"
on public.adventures
for select
using (true);

-- Insert: admin only (curated MVP content).
create policy "adventures_insert_admin_only"
on public.adventures
for insert
with check (
  public.is_admin(auth.uid())
);

-- Update: admin only (curated MVP content).
create policy "adventures_update_admin_only"
on public.adventures
for update
using (
  public.is_admin(auth.uid())
)
with check (
  public.is_admin(auth.uid())
);

-- Delete: admin only (curated MVP content).
create policy "adventures_delete_admin_only"
on public.adventures
for delete
using (
  public.is_admin(auth.uid())
);

-- -----------------------------
-- bookings policies
-- -----------------------------

-- Select: authenticated users can read own bookings OR admin can read all.
create policy "bookings_select_own_or_admin"
on public.bookings
for select
using (
  (
    auth.uid() is not null
    and user_id = auth.uid()
  )
  or public.is_admin(auth.uid())
);

-- Insert: authenticated users can create booking only for themselves.
create policy "bookings_insert_own"
on public.bookings
for insert
with check (
  auth.uid() is not null
  and user_id = auth.uid()
);

-- Update (user): own booking only, for cancelling OR note updates while pending.
create policy "bookings_update_user_rules"
on public.bookings
for update
using (
  auth.uid() is not null
  and user_id = auth.uid()
)
with check (
  auth.uid() is not null
  and user_id = auth.uid()
  and (
    status = 'cancelled'
    or status = 'pending'
  )
);

-- Update (admin): admin can update any booking (approve/reject/cancel).
create policy "bookings_update_admin_any"
on public.bookings
for update
using (
  public.is_admin(auth.uid())
)
with check (
  public.is_admin(auth.uid())
);

-- Delete: admin only.
create policy "bookings_delete_admin_only"
on public.bookings
for delete
using (
  public.is_admin(auth.uid())
);
