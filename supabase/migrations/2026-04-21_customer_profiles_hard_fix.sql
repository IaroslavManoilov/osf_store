-- Hard fix for customer profile storage (idempotent)
-- Run in Supabase SQL Editor once on production project.

create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  login text,
  phone text not null default '',
  email text,
  about text,
  currency text not null default 'MDL',
  preferred_language text not null default 'ru',
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles add column if not exists first_name text not null default '';
alter table public.customer_profiles add column if not exists last_name text not null default '';
alter table public.customer_profiles add column if not exists login text;
alter table public.customer_profiles add column if not exists about text;
alter table public.customer_profiles add column if not exists currency text not null default 'MDL';
alter table public.customer_profiles add column if not exists preferred_language text not null default 'ru';
alter table public.customer_profiles add column if not exists notifications_enabled boolean not null default true;
alter table public.customer_profiles add column if not exists created_at timestamptz not null default now();
alter table public.customer_profiles add column if not exists updated_at timestamptz not null default now();

alter table public.customer_profiles drop constraint if exists customer_profiles_currency_check;
alter table public.customer_profiles
  add constraint customer_profiles_currency_check
  check (currency in ('MDL', 'EUR', 'USD', 'RON'));

alter table public.customer_profiles drop constraint if exists customer_profiles_preferred_language_check;
alter table public.customer_profiles
  add constraint customer_profiles_preferred_language_check
  check (preferred_language in ('ru', 'ro', 'en'));

create index if not exists idx_customer_profiles_email on public.customer_profiles (email);
create index if not exists idx_customer_profiles_phone on public.customer_profiles (phone);
create unique index if not exists idx_customer_profiles_login_unique
  on public.customer_profiles (lower(login))
  where login is not null and btrim(login) <> '';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_customer_profiles_set_updated_at on public.customer_profiles;
create trigger trg_customer_profiles_set_updated_at
before update on public.customer_profiles
for each row
execute function public.set_updated_at();

alter table public.customer_profiles enable row level security;

-- Client-safe policies (optional, useful if later reads happen from client with anon key).
drop policy if exists customer_profiles_select_own on public.customer_profiles;
create policy customer_profiles_select_own
on public.customer_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists customer_profiles_insert_own on public.customer_profiles;
create policy customer_profiles_insert_own
on public.customer_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists customer_profiles_update_own on public.customer_profiles;
create policy customer_profiles_update_own
on public.customer_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Quick verification
select
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'customer_profiles'
      and column_name = 'notifications_enabled'
  ) as has_notifications_enabled,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'customer_profiles'
      and column_name = 'preferred_language'
  ) as has_preferred_language;
