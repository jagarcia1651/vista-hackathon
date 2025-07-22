create table public.staffer_time_off (
  time_off_id uuid not null default gen_random_uuid (),
  staffer_id uuid not null,
  time_off_start_datetime timestamp with time zone not null,
  time_off_end_datetime timestamp with time zone not null,
  time_off_cumulative_hours numeric not null,
  created_at timestamp with time zone null,
  last_updated_at timestamp with time zone null,
  constraint staffer_time_off_pkey primary key (time_off_id),
  constraint staffer_time_off_staffer_id_fkey foreign KEY (staffer_id) references staffers (id)
) TABLESPACE pg_default;