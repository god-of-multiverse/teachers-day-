alter table public.wishes enable row level security;

drop policy if exists "Students can edit wishes" on public.wishes;
create policy "Students can edit wishes"
on public.wishes for update
to anon, authenticated
using (true)
with check (true);

delete from public.wishes
where id in (
  '96cabf0b-5787-4e67-93c8-32e4a7c8d9c8',
  'bc95f908-4337-4f93-932a-6e944540fec5'
);
