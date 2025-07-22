create table public.project_phases (
  project_phase_id uuid not null default gen_random_uuid (),
  project_id uuid null,
  project_phase_number bigint not null,
  project_phase_name text not null,
  project_phase_description text null,
  project_phase_status public.Phase Statuses not null default 'Planned'::"Phase Statuses",
  project_phase_start_date text null,
  project_phase_due_date text null,
  created_at timestamp with time zone null,
  last_updated_at timestamp with time zone null,
  constraint project_phase_pkey primary key (project_phase_id),
  constraint project_phase_project_id_fkey foreign KEY (project_id) references projects (project_id)
) TABLESPACE pg_default;