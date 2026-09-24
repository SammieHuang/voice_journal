-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Add tier column, defaults to free
alter table public.profiles
  add column tier text not null default 'free'
  check (tier in ('free', 'premium'));

-- Users can read their own row only
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Deliberately NO update/insert policy for authenticated users —
-- tier is only ever written by the service-role key, from the Edge Function.

-- username was NOT NULL with no default, which broke the webhook's upsert
-- for first-time purchasers who don't have a profiles row yet. It's unused
-- elsewhere in the app, so making it nullable is safe.
alter table public.profiles alter column username drop not null;