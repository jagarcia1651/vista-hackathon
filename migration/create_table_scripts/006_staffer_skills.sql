create table public.staffer_skills (
  staffer_skill_id uuid not null default gen_random_uuid (),
  staffer_id uuid null,
  skill_id uuid null,
  skill_status public.Skill Competency Levels null,
  certification_active_date date null,
  certification_expiry_date date null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint staffer_skills_pkey primary key (staffer_skill_id),
  constraint staffer_skills_skill_id_fkey foreign KEY (skill_id) references skills (skill_id),
  constraint staffer_skills_staffer_id_fkey foreign KEY (staffer_id) references staffers (id)
) TABLESPACE pg_default;