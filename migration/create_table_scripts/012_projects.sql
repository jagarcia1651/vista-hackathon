create table public.projects (
  project_id uuid not null default gen_random_uuid (),
  client_id uuid not null,
  project_name text not null,
  project_status public.Project Statuses not null default 'RFP'::"Project Statuses",
  project_start_date text null,
  project_due_date text null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint project_pkey primary key (project_id),
  constraint project_client_id_fkey foreign KEY (client_id) references clients (client_id)
) TABLESPACE pg_default;