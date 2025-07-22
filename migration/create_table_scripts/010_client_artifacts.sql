create table public.client_artifacts (
  client_artifact_id uuid not null default gen_random_uuid (),
  client_id uuid not null,
  client_artifact_name text not null,
  client_artifact_type text not null,
  client_artifact_source text null,
  hex_code text null,
  font_config text null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint client_artifacts_pkey primary key (client_artifact_id),
  constraint client_artifacts_client_id_fkey foreign KEY (client_id) references clients (client_id)
) TABLESPACE pg_default;