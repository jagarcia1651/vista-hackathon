-- CREATE TABLE
create table public.seniorities (
  seniority_id uuid not null default gen_random_uuid (),
  seniority_name text not null,
  seniority_level bigint not null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint seniority_pkey primary key (seniority_id)
) TABLESPACE pg_default;