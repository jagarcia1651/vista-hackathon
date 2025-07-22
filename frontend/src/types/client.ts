import { BaseEntity, ClientContactStatus } from "./base";

export interface Client extends BaseEntity {
   client_id: string;
   client_name: string;
   client_description?: string;
   client_website?: string;
   client_industry?: string;
   client_size?: string;
}

export interface ClientContact extends BaseEntity {
   contact_id: string;
   client_id: string;
   first_name: string;
   last_name: string;
   email: string;
   phone?: string;
   title?: string;
   contact_status: ClientContactStatus;
}

export interface ClientArtifact extends BaseEntity {
   artifact_id: string;
   client_id: string;
   artifact_name: string;
   artifact_type: string;
   artifact_url: string;
   artifact_description?: string;
}
