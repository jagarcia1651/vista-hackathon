-- Create clients table first without the foreign key constraints that reference client_contacts
create table public.clients (
  client_id uuid not null default gen_random_uuid (),
  client_name text not null,
  main_phone text null,
  main_email text null,
  billing_phone text null,
  billing_email text null,
  street_address_id uuid not null,
  billing_address_id uuid null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  primary_contact_id uuid null, -- Remove NOT NULL constraint temporarily
  billing_contact_id uuid null,
  constraint client_pkey primary key (client_id),
  constraint client_billing_address_id_fkey foreign KEY (billing_address_id) references addresses (address_id),
  constraint client_street_address_id_fkey foreign KEY (street_address_id) references addresses (address_id)
  -- Note: Foreign keys for primary_contact_id and billing_contact_id will be added later
) TABLESPACE pg_default;

-- Create client_contacts table with all its constraints
create table public.client_contacts (
  client_contact_id uuid not null default gen_random_uuid (),
  client_id uuid not null,
  email text not null,
  first_name text not null,
  last_name text not null,
  phone_number text null,
  street_address_id uuid null,
  client_contact_status text null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint client_contact_pkey primary key (client_contact_id),
  constraint client_contact_client_id_fkey foreign KEY (client_id) references clients (client_id),
  constraint client_contact_street_address_id_fkey foreign KEY (street_address_id) references addresses (address_id)
) TABLESPACE pg_default;

-- Add the circular foreign key constraints after both tables exist
alter table public.clients
  add constraint client_primary_contact_id_fkey foreign key (primary_contact_id) references client_contacts (client_contact_id);

alter table public.clients
  add constraint client_billing_contact_id_fkey foreign key (billing_contact_id) references client_contacts (client_contact_id);