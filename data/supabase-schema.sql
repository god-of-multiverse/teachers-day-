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

drop policy if exists "Anyone can read active wishes" on public.wishes;
create policy "Anyone can read active wishes"
on public.wishes for select
using (deleted_at is null);

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

  insert into public.deleted_wishes (id, owner_id, name, comment, deleted_at)
  values (removed.id, removed.owner_id, removed.name, removed.comment, now())
  on conflict (id) do nothing;

  return true;
end;
$$;

grant execute on function public.delete_wish(uuid, text) to anon, authenticated;
