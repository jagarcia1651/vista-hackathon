create table public.agents (
  agent_id uuid not null default gen_random_uuid (),
  agent_domain text not null,
  agent_name text not null,
  agent_description text null,
  is_enabled boolean null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint agents_pkey primary key (agent_id)
) TABLESPACE pg_default;