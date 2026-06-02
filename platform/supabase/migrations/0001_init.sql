-- ============================================================================
-- The Market Brief Daily — initial schema
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ============================================================================

-- ---- Enums ----------------------------------------------------------------
do $$ begin
  create type tier as enum ('free', 'pro', 'institutional');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

-- ---- Profiles (1:1 with auth.users) ---------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role user_role not null default 'user',
  tier tier not null default 'free',
  subscription_status text,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- Paywall rules (admin-configurable gating) ----------------------------
create table if not exists public.paywall_rules (
  key text primary key,
  section text not null,
  description text not null,
  required_tier tier not null default 'free',
  updated_at timestamptz not null default now()
);

-- ---- Courses & question bank ----------------------------------------------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  required_tier tier not null default 'pro',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  topic text not null,
  prompt text not null,
  choices jsonb not null,        -- string[]
  answer int not null,           -- index into choices
  explanation text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Per-user answer history (drives progress & accuracy).
create table if not exists public.quiz_progress (
  user_id uuid references auth.users(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  correct boolean not null,
  answered_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- ---- Research posts --------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  topic text,
  excerpt text,
  body_md text,
  cover_image text,
  required_tier tier not null default 'free',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---- Indicator sources (admin-managed feed config) ------------------------
create table if not exists public.indicator_sources (
  key text primary key,
  label text not null,
  provider text not null,        -- 'fred' | 'yahoo' | ...
  series_id text,
  required_tier tier not null default 'free',
  enabled boolean not null default true
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.paywall_rules      enable row level security;
alter table public.courses            enable row level security;
alter table public.questions          enable row level security;
alter table public.quiz_progress      enable row level security;
alter table public.posts              enable row level security;
alter table public.indicator_sources  enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Profiles: a user sees/edits their own; admins see all.
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id);

-- Public read for content config; writes admin-only.
drop policy if exists "rules public read" on public.paywall_rules;
create policy "rules public read" on public.paywall_rules for select using (true);
drop policy if exists "rules admin write" on public.paywall_rules;
create policy "rules admin write" on public.paywall_rules for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "courses public read" on public.courses;
create policy "courses public read" on public.courses for select using (true);
drop policy if exists "courses admin write" on public.courses;
create policy "courses admin write" on public.courses for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "questions public read" on public.questions;
create policy "questions public read" on public.questions for select using (true);
drop policy if exists "questions admin write" on public.questions;
create policy "questions admin write" on public.questions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "posts public read" on public.posts;
create policy "posts public read" on public.posts for select using (published or public.is_admin());
drop policy if exists "posts admin write" on public.posts;
create policy "posts admin write" on public.posts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sources public read" on public.indicator_sources;
create policy "sources public read" on public.indicator_sources for select using (true);
drop policy if exists "sources admin write" on public.indicator_sources;
create policy "sources admin write" on public.indicator_sources for all using (public.is_admin()) with check (public.is_admin());

-- Quiz progress: each user owns their rows.
drop policy if exists "progress self" on public.quiz_progress;
create policy "progress self" on public.quiz_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
