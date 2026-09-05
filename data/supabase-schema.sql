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

create table if not exists public.admin_users (
  email text primary key
);

alter table public.wishes add column if not exists font text not null default 'hand';
alter table public.wishes add column if not exists color text not null default '#2b1440';
alter table public.wishes add column if not exists likes integer not null default 0;
alter table public.wishes add column if not exists liked_by text[] not null default '{}';
alter table public.deleted_wishes add column if not exists font text not null default 'hand';
alter table public.deleted_wishes add column if not exists color text not null default '#2b1440';

alter table public.wishes enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Anyone can read active wishes" on public.wishes;
create policy "Anyone can read active wishes"
on public.wishes for select
using (deleted_at is null);

drop policy if exists "Approved admins can read all wishes" on public.wishes;
create policy "Approved admins can read all wishes"
on public.wishes for select
to authenticated
using (exists (select 1 from public.admin_users where lower(email) = lower(auth.jwt() ->> 'email')));

drop policy if exists "Anyone can add wishes" on public.wishes;
create policy "Anyone can add wishes"
on public.wishes for insert
with check (true);

drop policy if exists "Students can edit wishes" on public.wishes;
create policy "Students can edit wishes"
on public.wishes for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Students can delete wishes" on public.wishes;
create policy "Students can delete wishes"
on public.wishes for delete
to anon, authenticated
using (true);

alter table public.deleted_wishes enable row level security;

drop policy if exists "Approved admins can read deleted wishes" on public.deleted_wishes;
create policy "Approved admins can read deleted wishes"
on public.deleted_wishes for select
to authenticated
using (exists (select 1 from public.admin_users where lower(email) = lower(auth.jwt() ->> 'email')));

drop policy if exists "Admins can read own allowlist entry" on public.admin_users;
create policy "Admins can read own allowlist entry"
on public.admin_users for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Anyone can log deleted wishes" on public.deleted_wishes;
create policy "Anyone can log deleted wishes"
on public.deleted_wishes for insert
with check (true);

create or replace function public.delete_wish(wish_id uuid, wish_owner_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  removed public.wishes;
begin
  delete from public.wishes
  where id = wish_id and owner_id = wish_owner_id
  returning * into removed;

  if not found then
    return false;
  end if;

  insert into public.deleted_wishes (id, owner_id, name, comment, font, color, deleted_at)
  values (removed.id, removed.owner_id, removed.name, removed.comment, removed.font, removed.color, now())
  on conflict (id) do nothing;

  return true;
end;
$$;

grant execute on function public.delete_wish(uuid, text) to anon, authenticated;
