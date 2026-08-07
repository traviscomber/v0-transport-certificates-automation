create table if not exists public.system_job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  status text not null check (status in ('running','completed','partial','failed','skipped')),
  trigger_source text not null default 'cron',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer,
  processed_count integer,
  succeeded_count integer,
  failed_count integer,
  result jsonb not null default '{}'::jsonb,
  error_message text,
  deployment_sha text,
  created_at timestamptz not null default now()
);

create index if not exists system_job_runs_job_started_idx
  on public.system_job_runs (job_name, started_at desc);

create index if not exists system_job_runs_status_started_idx
  on public.system_job_runs (status, started_at desc);

alter table public.system_job_runs enable row level security;

revoke all on public.system_job_runs from anon, authenticated;
grant select, insert, update on public.system_job_runs to service_role;

create or replace view public.system_job_latest_runs as
select distinct on (job_name)
  id,
  job_name,
  status,
  trigger_source,
  started_at,
  completed_at,
  duration_ms,
  processed_count,
  succeeded_count,
  failed_count,
  result,
  error_message,
  deployment_sha
from public.system_job_runs
order by job_name, started_at desc;

revoke all on public.system_job_latest_runs from anon, authenticated;
grant select on public.system_job_latest_runs to service_role;
