create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- The app writes this table through the server-side service role key.
-- Do not expose the service role key to browser code.
