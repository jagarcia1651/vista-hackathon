create table public.project_team_memberships (
  project_team_membership_id uuid not null default gen_random_uuid (),
  project_team_id uuid null,
  staffer_id uuid null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint project_team_memberships_pkey primary key (project_team_membership_id),
  constraint project_team_memberships_project_team_id_fkey foreign KEY (project_team_id) references project_teams (project_team_id),
  constraint project_team_memberships_staffer_id_fkey foreign KEY (staffer_id) references staffers (id)
) TABLESPACE pg_default;