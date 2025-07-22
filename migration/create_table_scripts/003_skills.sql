create table public.skills (
  skill_id uuid not null default gen_random_uuid (),
  skill_name text not null,
  skill_description text null,
  is_certification boolean null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint skill_pkey primary key (skill_id)
) TABLESPACE pg_default;