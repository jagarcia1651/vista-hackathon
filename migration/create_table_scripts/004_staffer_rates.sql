create table public.staffer_rates (
  staffer_rate_id uuid not null default gen_random_uuid (),
  staffer_id uuid not null,
  cost_rate double precision not null,
  bill_rate double precision not null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint staffer_rates_pkey primary key (staffer_rate_id),
  constraint staffer_rates_staffer_id_fkey foreign KEY (staffer_id) references staffers (id)
) TABLESPACE pg_default;