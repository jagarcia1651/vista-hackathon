create table public.project_tasks (
  project_task_id uuid not null default gen_random_uuid (),
  project_id uuid not null,
  project_phase_id uuid null,
  project_task_name text not null,
  project_task_description text null,
  project_task_status public.Task Statuses not null default 'To Do'::"Task Statuses",
  project_task_start_date text null,
  project_task_due_date text null,
  estimated_hours bigint null,
  actual_hours bigint null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint project_task_pkey primary key (project_task_id),
  constraint project_task_project_id_fkey foreign KEY (project_id) references projects (project_id),
  constraint project_task_project_phase_id_fkey foreign KEY (project_phase_id) references project_phases (project_phase_id)
) TABLESPACE pg_default;