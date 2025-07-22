create table public.staffer_assignments (
  staffer_assignment_id uuid not null default gen_random_uuid (),
  staffer_id uuid not null,
  project_task_id uuid not null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint staffer_assignments_pkey primary key (staffer_assignment_id),
  constraint staffer_assignments_project_task_id_fkey foreign KEY (project_task_id) references project_tasks (project_task_id),
  constraint staffer_assignments_staffer_id_fkey foreign KEY (staffer_id) references staffers (id)
) TABLESPACE pg_default;