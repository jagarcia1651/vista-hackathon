/**
 * Project Management Agent Types
 */

import type { AgentRequest, AgentResponse } from '../agent'
import type { Project, ProjectPhase } from '../project'
import type { ProjectStatus } from '../base'

export interface CreateProjectRequest extends AgentRequest {
  context: {
    client_id: string
    project_name: string
    description?: string
    start_date: string
    due_date: string
    budget?: number
  }
}

export interface CreateProjectResponse extends AgentResponse {
  data: {
    project: Project
    phases: ProjectPhase[]
    estimated_timeline: string
    recommended_team_size: number
  }
}

export interface UpdateProjectStatusRequest extends AgentRequest {
  context: {
    project_id: string
    new_status: ProjectStatus
    reason?: string
  }
}

export interface GenerateProjectPlanRequest extends AgentRequest {
  context: {
    project_id: string
    requirements: string[]
    constraints?: string[]
    preferred_start_date?: string
  }
}

export interface ProjectAnalysisRequest extends AgentRequest {
  context: {
    project_id: string
    analysis_type: 'progress' | 'risks' | 'timeline' | 'budget'
  }
}

export interface ProjectAnalysisResponse extends AgentResponse {
  data: {
    analysis_type: string
    findings: string[]
    recommendations: string[]
    metrics: Record<string, number>
    risk_level: 'low' | 'medium' | 'high'
  }
} 