create table public.addresses (
  address_id uuid not null default gen_random_uuid (),
  address_line_1 text not null,
  address_line_2 text null,
  city text not null,
  state_region text not null,
  postal_code bigint not null,
  country text not null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint address_pkey primary key (address_id)
) TABLESPACE pg_default;