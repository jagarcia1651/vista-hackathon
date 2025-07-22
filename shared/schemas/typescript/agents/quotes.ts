/**
 * Quotes Agent Types
 */

import type { AgentRequest, AgentResponse } from '../agent'
import type { Quote, QuoteLineItem, QuoteOption, QuoteConstraint, MarketData } from '../quote'

export interface GenerateQuoteRequest extends AgentRequest {
  context: {
    project_id?: string
    client_id: string
    requirements: string
    timeline?: string
    budget_range?: {
      min: number
      max: number
    }
    include_phases?: boolean
  }
}

export interface GenerateQuoteResponse extends AgentResponse {
  data: {
    quote: Quote
    line_items: QuoteLineItem[]
    total_cost: number
    timeline_estimate: string
    assumptions: string[]
    risks: string[]
    alternative_options?: QuoteOption[]
  }
}

export interface OptimizeQuoteRequest extends AgentRequest {
  context: {
    quote_id: string
    optimization_type: 'cost' | 'timeline' | 'quality' | 'risk'
    constraints?: QuoteConstraint[]
  }
}

export interface CompareQuotesRequest extends AgentRequest {
  context: {
    quote_ids: string[]
    comparison_criteria: ('cost' | 'timeline' | 'resources' | 'risk')[]
  }
}

export interface QuoteAnalysisRequest extends AgentRequest {
  context: {
    quote_id: string
    analysis_type: 'profitability' | 'competitiveness' | 'feasibility'
    market_data?: MarketData
  }
}

export interface QuoteAnalysisResponse extends AgentResponse {
  data: {
    analysis_type: string
    score: number
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    competitive_position?: string
    profit_margin?: number
  }
} 