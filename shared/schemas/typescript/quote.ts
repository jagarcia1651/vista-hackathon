/**
 * Quote Entity Types
 */

import { BaseEntity, QuoteStatus } from './base'

export interface Quote extends BaseEntity {
  quote_id: string
  project_id: string
  quote_version_number: number
  quote_status: string
  approved_by_staffer_id?: string
  accepted_by_client_contact_id?: string
}

// Business logic types
export interface QuoteLineItem {
  line_item_id: string
  quote_id: string
  description: string
  quantity: number
  rate: number
  total: number
  skill_category: string
}

export interface QuoteWithDetails extends Quote {
  line_items: QuoteLineItem[]
  total_cost: number
  timeline_estimate: string
  assumptions: string[]
  risks: string[]
  alternative_options?: QuoteOption[]
}

export interface QuoteOption {
  option_name: string
  description: string
  cost_impact: number
  timeline_impact: string
  quality_impact: string
}

export interface QuoteConstraint {
  type: 'budget_ceiling' | 'timeline_limit' | 'resource_limit'
  value: any
}

export interface MarketData {
  industry_averages: Record<string, number>
  competitor_rates: number[]
  client_budget_history?: number[]
} 