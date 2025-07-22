/**
 * Resourcing Agent Types
 */

import type { AgentRequest, AgentResponse } from '../agent'
import type { Staffer } from '../staffer'

export interface FindResourcesRequest extends AgentRequest {
  context: {
    project_id: string
    skill_requirements: ResourcingSkillRequirement[]
    start_date: string
    end_date: string
    hours_per_week?: number
  }
}

export interface FindResourcesResponse extends AgentResponse {
  data: {
    available_staffers: StafferMatch[]
    alternative_solutions: string[]
    capacity_conflicts: CapacityConflict[]
    recommended_action: string
  }
}

export interface OptimizeAllocationRequest extends AgentRequest {
  context: {
    project_ids: string[]
    optimization_goal: 'utilization' | 'cost' | 'timeline' | 'skills'
    constraints?: AllocationConstraint[]
  }
}

export interface CapacityAnalysisRequest extends AgentRequest {
  context: {
    time_period: {
      start_date: string
      end_date: string
    }
    include_projects?: string[]
    skill_focus?: string[]
  }
}

export interface CapacityAnalysisResponse extends AgentResponse {
  data: {
    overall_utilization: number
    staffer_utilization: StafferUtilization[]
    skill_gaps: SkillGap[]
    recommendations: string[]
    forecasted_needs: ResourceForecast[]
  }
}

// Supporting interfaces
export interface ResourcingSkillRequirement {
  skill_id: string
  skill_name: string
  required_level: string
  hours_needed: number
  is_critical: boolean
}

export interface StafferMatch {
  staffer: Staffer
  match_score: number
  availability_percentage: number
  skill_alignment: SkillAlignment[]
  potential_conflicts: string[]
}

export interface SkillAlignment {
  skill_id: string
  required_level: string
  staffer_level: string
  gap: number
}

export interface CapacityConflict {
  staffer_id: string
  conflicting_project: string
  overlap_hours: number
  severity: 'low' | 'medium' | 'high'
}

export interface AllocationConstraint {
  type: 'max_projects_per_staffer' | 'skill_requirement' | 'availability'
  value: any
}

export interface StafferUtilization {
  staffer_id: string
  total_capacity: number
  allocated_hours: number
  utilization_percentage: number
  overallocation: boolean
}

export interface SkillGap {
  skill_id: string
  skill_name: string
  demand: number
  supply: number
  gap_severity: 'low' | 'medium' | 'high'
}

export interface ResourceForecast {
  skill_category: string
  projected_demand: number
  current_supply: number
  recommendation: string
  timeline: string
} 