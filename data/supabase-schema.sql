create table if not exists public.wishes (
  id uuid primary key,
  owner_id text not null,
  name text not null,
  comment text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.deleted_wishes (
  id uuid primary key,
  owner_id text not null,
  name text not null,
  comment text not null,
  deleted_at timestamptz not null default now()
);

alter table public.wishes enable row level security;

create policy "Anyone can read active wishes"
on public.wishes for select
using (deleted_at is null);

create policy "Anyone can add wishes"
on public.wishes for insert
with check (true);

create policy "Students can edit wishes"
on public.wishes for update
using (true)
with check (true);

create policy "Students can archive wishes"
on public.wishes for update
using (true)
with check (true);

alter table public.deleted_wishes enable row level security;

create policy "Anyone can log deleted wishes"
on public.deleted_wishes for insert
with check (true);
