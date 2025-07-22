/**
 * Address Entity Types
 */

import { BaseEntity } from './base'

export interface Address extends BaseEntity {
  address_id: string
  address_line_1: string
  address_line_2?: string
  city: string
  state_region: string
  postal_code: number
  country: string
} 