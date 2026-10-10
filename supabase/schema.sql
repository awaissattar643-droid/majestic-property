-- Majestic Property Manager — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard > SQL > New query).

-- 1. Properties table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  price_text text not null,
  price_num numeric null,
  type text not null check (type in ('sale', 'rent')),
  beds integer null,
  baths integer null,
  area_sqft integer null,
  description text not null default '',
  images text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 2. Row Level Security: anyone can read, only logged-in users can write
alter table public.properties enable row level security;

drop policy if exists "Public can read properties" on public.properties;
create policy "Public can read properties"
  on public.properties for select
  using (true);

drop policy if exists "Authenticated users can insert properties" on public.properties;
create policy "Authenticated users can insert properties"
  on public.properties for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update properties" on public.properties;
create policy "Authenticated users can update properties"
  on public.properties for update
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete properties" on public.properties;
create policy "Authenticated users can delete properties"
  on public.properties for delete
  using (auth.role() = 'authenticated');

-- 3. Public storage bucket for property photos
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read property images" on storage.objects;
create policy "Public can read property images"
  on storage.objects for select
  using (bucket_id = 'property-images');

drop policy if exists "Authenticated users can upload property images" on storage.objects;
create policy "Authenticated users can upload property images"
  on storage.objects for insert
  with check (bucket_id = 'property-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete property images" on storage.objects;
create policy "Authenticated users can delete property images"
  on storage.objects for delete
  using (bucket_id = 'property-images' and auth.role() = 'authenticated');

-- 4. Admin user: create it in the Supabase Dashboard under
--    Authentication > Users > "Add user" (email + password).
--    Use that email/password to log in at /admin.
