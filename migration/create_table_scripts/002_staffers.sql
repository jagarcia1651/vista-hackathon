create table public.staffers (
  id uuid not null default gen_random_uuid (),
  title text not null,
  seniority_id uuid not null,
  capacity double precision not null,
  time_zone text null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  first_name text null,
  last_name text null,
  email text null,
  user_id uuid null,
  constraint staffer_pkey primary key (id),
  constraint staffers_email_key unique (email),
  constraint staffer_seniority_id_fkey foreign KEY (seniority_id) references seniorities (seniority_id),
  constraint staffers_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;