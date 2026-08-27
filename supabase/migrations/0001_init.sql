-- HyperStore — core schema
-- Marketplace for renting sea toys & equipment (1–10 m).
--
-- Run this once against your Supabase project:
--   Supabase Dashboard -> SQL Editor -> paste -> Run
-- or, with the Supabase CLI:  supabase db push

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.user_role as enum ('renter', 'owner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_category as enum (
    'foil',
    'jetski',
    'sea_scooter',
    'catamaran',
    'small_boat',
    'extreme_gear',
    'other'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user, carries the renter/owner role
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  role       public.user_role not null default 'renter',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profiles are public: a listing shows who owns it. Only non-sensitive
-- columns live here (no email, no phone) — contact details come with the
-- messaging work in a later milestone.
drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "users insert their own profile" on public.profiles;
create policy "users insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create the profile row automatically when someone signs up. The signup form
-- passes full_name / role through auth metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'renter')::public.user_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- listings
-- ---------------------------------------------------------------------------

create table if not exists public.listings (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.profiles (id) on delete cascade,
  title         text not null check (char_length(trim(title)) between 3 and 120),
  category      public.listing_category not null,
  description   text not null default '' check (char_length(description) <= 4000),
  -- Length overall, in metres. HyperStore covers the 1–10 m segment.
  size_m        numeric(4, 2) not null check (size_m >= 0.5 and size_m <= 10),
  location      text not null check (char_length(trim(location)) between 2 and 120),
  -- Rental price per hour, in Turkish lira.
  hourly_price  numeric(10, 2) not null check (hourly_price >= 0),
  currency      text not null default 'TRY',
  -- Storage object paths inside the `listing-photos` bucket, first = cover.
  photos        text[] not null default '{}',
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists listings_category_idx    on public.listings (category);
create index if not exists listings_location_idx    on public.listings (lower(location));
create index if not exists listings_price_idx       on public.listings (hourly_price);
create index if not exists listings_created_at_idx  on public.listings (created_at desc);
create index if not exists listings_owner_idx       on public.listings (owner_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists listings_touch_updated_at on public.listings;
create trigger listings_touch_updated_at
  before update on public.listings
  for each row execute function public.touch_updated_at();

-- Only accounts registered as owners may list equipment.
create or replace function public.is_owner(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'owner'
  );
$$;

alter table public.listings enable row level security;

drop policy if exists "published listings are readable by everyone" on public.listings;
create policy "published listings are readable by everyone"
  on public.listings for select
  using (is_published or owner_id = auth.uid());

drop policy if exists "owners create their own listings" on public.listings;
create policy "owners create their own listings"
  on public.listings for insert
  with check (owner_id = auth.uid() and public.is_owner(auth.uid()));

drop policy if exists "owners update their own listings" on public.listings;
create policy "owners update their own listings"
  on public.listings for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "owners delete their own listings" on public.listings;
create policy "owners delete their own listings"
  on public.listings for delete
  using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage — listing photos
-- ---------------------------------------------------------------------------
-- Public bucket so the feed can render images straight from a CDN URL.
-- Writes are restricted to a per-user folder: <auth.uid()>/<file>.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "listing photos are publicly readable" on storage.objects;
create policy "listing photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

drop policy if exists "users upload listing photos to their own folder" on storage.objects;
create policy "users upload listing photos to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users replace their own listing photos" on storage.objects;
create policy "users replace their own listing photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete their own listing photos" on storage.objects;
create policy "users delete their own listing photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
