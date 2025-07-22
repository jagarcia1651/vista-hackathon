create table public.holidays (
  holiday_id uuid not null default gen_random_uuid (),
  holiday_name text not null,
  holiday_type text not null,
  month bigint null,
  day_of_month bigint null,
  day_of_week text null,
  week_number text null,
  base_holiday_id text null,
  days_variance text null,
  special_calculation_flag text null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint firm_holidays_pkey primary key (holiday_id)
) TABLESPACE pg_default;