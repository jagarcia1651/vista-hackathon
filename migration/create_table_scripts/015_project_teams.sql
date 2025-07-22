create table public.project_teams (
  project_team_id uuid not null default gen_random_uuid (),
  project_team_name text not null,
  project_id uuid not null,
  project_phase_id uuid null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint project_team_pkey primary key (project_team_id),
  constraint project_team_project_id_fkey foreign KEY (project_id) references projects (project_id),
  constraint project_team_project_phase_id_fkey foreign KEY (project_phase_id) references project_phases (project_phase_id)
) TABLESPACE pg_default;