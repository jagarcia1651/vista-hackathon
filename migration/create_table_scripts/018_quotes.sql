create table public.quotes (
  quote_id uuid not null default gen_random_uuid (),
  project_id text null,
  quote_version_number bigint not null,
  quote_status public.Quote Statuses not null default 'Created'::"Quote Statuses",
  approved_by_staffer_id uuid null,
  accepted_by_client_contact_id uuid null,
  created_at timestamp with time zone null,
  last_updated_at timestamp with time zone null,
  constraint quotes_pkey primary key (quote_id),
  constraint quotes_accepted_by_client_contact_id_fkey foreign KEY (accepted_by_client_contact_id) references client_contacts (client_contact_id),
  constraint quotes_approved_by_staffer_id_fkey foreign KEY (approved_by_staffer_id) references staffers (id)
) TABLESPACE pg_default;