/**
 * Client Entity Types
 */

import { BaseEntity, ClientContactStatus } from './base'

export interface Client extends BaseEntity {
  client_id: string
  client_name: string
  main_phone?: string
  main_email?: string
  billing_phone?: string
  billing_email?: string
  street_address_id?: string
  billing_address_id?: string
  primary_contact_id?: string
  billing_contact_id?: string
}

export interface ClientContact extends BaseEntity {
  client_contact_id: string
  client_id: string
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  street_address_id?: string
  client_contact_status: string
}

export interface ClientArtifact extends BaseEntity {
  client_artifact_id: string
  client_id: string
  client_artifact_name: string
  client_artifact_type: string
  client_artifact_source: string
  hex_code?: string
  font_config?: string
}

// Business logic types
export interface ClientWithContacts extends Client {
  contacts: ClientContact[]
  activeProjects: any[] // Will reference Project when imported
  totalProjectValue: number
} 