-- ============================================================
-- SCHEMA COMPLETO — ExamenTemplate
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- ── Tabla profiles ──────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid references auth.users(id) on delete cascade primary key,
  username         text not null,
  role             text not null check (role in ('cliente', 'vendedor')),
  avatar_url       text,
  location_lat     float,
  location_lng     float,
  location_address text,
  created_at       timestamptz default now()
);

-- ── Tabla rooms ─────────────────────────────────────────────
create table if not exists public.rooms (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- ── Tabla messages ──────────────────────────────────────────
create table if not exists public.messages (
  id         uuid default gen_random_uuid() primary key,
  room_id    uuid references public.rooms(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  content    text not null default '',
  image_url  text,
  created_at timestamptz default now()
);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.rooms    enable row level security;
alter table public.messages enable row level security;

-- profiles
drop policy if exists "profiles_select" on profiles;
drop policy if exists "profiles_insert" on profiles;
drop policy if exists "profiles_update" on profiles;

create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- rooms
drop policy if exists "rooms_select" on rooms;
drop policy if exists "rooms_insert" on rooms;

create policy "rooms_select" on rooms for select using (true);
create policy "rooms_insert" on rooms for insert with check (auth.uid() = created_by);

-- messages
drop policy if exists "messages_select" on messages;
drop policy if exists "messages_insert" on messages;

create policy "messages_select" on messages for select using (true);
create policy "messages_insert" on messages for insert with check (auth.uid() = user_id);

-- ── Realtime ─────────────────────────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table rooms;

-- ── Storage bucket para imágenes ────────────────────────────
-- Ejecutar manualmente en Storage → Nuevo bucket → "chat-image" (público)
-- Luego ejecutar:

drop policy if exists "storage_upload" on storage.objects;
drop policy if exists "storage_select" on storage.objects;

create policy "storage_upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'chat-image');

create policy "storage_select"
  on storage.objects for select to public
  using (bucket_id = 'chat-image');
