create table public.cloud_transcription_usage(
  user_id    uuid        not null references auth.users (id) on delete cascade,
  usage_date date        not null,
  count      integer     not null default 0 check (count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

-- No policies on purpose: only the API (service role) can touch this table.
alter table public.cloud_transcription_usage enable row level security;
revoke all on table public.cloud_transcription_usage from anon, authenticated;

-- Atomically take one transcription from today's (UTC) allowance.
-- Returns {"allowed": bool, "used": int, "usage_date": "YYYY-MM-DD"}.
create or replace function public.consume_cloud_transcription(
  p_user_id uuid,
  p_limit   integer
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_date  date := (now() at time zone 'utc')::date;
  v_count integer;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required';
  end if;
  if p_limit is null or p_limit < 0 then
    raise exception 'p_limit must be a non-negative integer, got %', p_limit;
  end if;

  if p_limit > 0 then
    insert into public.cloud_transcription_usage as u (user_id, usage_date, count)
    values (p_user_id, v_date, 1)
    on conflict (user_id, usage_date) do update
      set count = u.count + 1,
          updated_at = now()
      where u.count < p_limit
    returning u.count into v_count;

    if v_count is not null then
      return jsonb_build_object('allowed', true, 'used', v_count, 'usage_date', v_date);
    end if;
  end if;

  -- Over the limit (or limit is 0): report current usage, change nothing.
  select u.count into v_count
  from public.cloud_transcription_usage u
  where u.user_id = p_user_id and u.usage_date = v_date;

  return jsonb_build_object('allowed', false, 'used', coalesce(v_count, 0), 'usage_date', v_date);
end;
$$;

-- Give back one transcription for the given day (used when the OpenAI call
-- fails, so a failed attempt doesn't count). Never goes below zero.
create or replace function public.release_cloud_transcription(
  p_user_id    uuid,
  p_usage_date date
)
returns void
language sql
set search_path = ''
as $$
  update public.cloud_transcription_usage
  set count = count - 1,
      updated_at = now()
  where user_id = p_user_id
    and usage_date = p_usage_date
    and count > 0;
$$;

-- Supabase lets anon/authenticated call new public functions through
-- /rest/v1/rpc by default, which would let a user give themselves back quota.
-- Only the service role (the API) may call these.
revoke execute on function public.consume_cloud_transcription(uuid, integer) from public, anon, authenticated;
revoke execute on function public.release_cloud_transcription(uuid, date)   from public, anon, authenticated;
grant  execute on function public.consume_cloud_transcription(uuid, integer) to service_role;
grant  execute on function public.release_cloud_transcription(uuid, date)   to service_role;