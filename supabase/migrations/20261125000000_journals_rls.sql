-- Row level security for journals: each signed-in user can only read and
-- change their own rows. These policies were first created in the Supabase
-- dashboard; this file records them so they live in the repo too.
-- Safe to run again: each policy is dropped and recreated with the same definition.

alter table public.journals enable row level security;

drop policy if exists "Users can read own journals" on public.journals;
create policy "Users can read own journals"
  on public.journals for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own journals" on public.journals;
create policy "Users can insert own journals"
  on public.journals for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own journals" on public.journals;
create policy "Users can update own journals"
  on public.journals for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own journals" on public.journals;
create policy "Users can delete own journals"
  on public.journals for delete
  to authenticated
  using (auth.uid() = user_id);