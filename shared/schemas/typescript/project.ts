/**
 * Project Entity Types
 */

import { BaseEntity, ProjectStatus, TaskStatus } from './base'
import type { Client } from './client'
import type { Staffer } from './staffer'

export interface Project extends BaseEntity {
  project_id: string
  client_id: string
  project_name: string
  project_status: string
  project_start_date: string
  project_due_date: string
}

export interface ProjectPhase extends BaseEntity {
  project_phase_id: string
  project_id: string
  project_phase_number: number
  project_phase_name: string
  project_phase_description: string
  project_phase_status: string
  project_phase_start_date: string
  project_phase_due_date: string
}

export interface ProjectTask extends BaseEntity {
  project_task_id: string
  project_id: string
  project_phase_id: string
  project_task_name: string
  project_task_description: string
  project_task_status: string
  project_task_start_date: string
  project_task_due_date: string
  estimated_hours: number
  actual_hours: number
}

export interface ProjectTeam extends BaseEntity {
  project_team_id: string
  project_team_name: string
  project_id: string
  project_phase_id: string
}

export interface StafferAssignment extends BaseEntity {
  staffer_assignment_id: string
  staffer_id: string
  project_task_id: string
}

// Business logic types
export interface ProjectWithDetails extends Project {
  client: Client
  phases: ProjectPhase[]
  totalTasks: number
  completedTasks: number
  totalEstimatedHours: number
  totalActualHours: number
  progress: number
}

export interface ProjectPhaseWithTasks extends ProjectPhase {
  tasks: ProjectTask[]
  assignedStaffers: Staffer[]
  progress: number
}

export interface ProjectTaskWithAssignments extends ProjectTask {
  assignedStaffers: Staffer[]
  isOverdue: boolean
  daysRemaining: number
}

// Planning and template types
export interface ProjectTemplate {
  template_id: string
  template_name: string
  phases: PhaseTemplate[]
  estimated_duration_days: number
  required_skills: SkillRequirement[]
}

export interface PhaseTemplate {
  phase_name: string
  phase_order: number
  tasks: TaskTemplate[]
  dependencies: string[]
}

export interface TaskTemplate {
  task_name: string
  estimated_hours: number
  required_skills: SkillRequirement[]
  dependencies: string[]
}

export interface SkillRequirement {
  skill_id: string
  required_level: string
  hours_needed: number
  is_mandatory: boolean
}

// Analytics types
export interface ProjectMetrics {
  project_id: string
  on_time_delivery: boolean
  budget_adherence: number
  client_satisfaction: number
  team_utilization: number
  scope_changes: number
}

export interface ProjectFinancials {
  project_id: string
  total_estimated_cost: number
  total_actual_cost: number
  total_billable_amount: number
  profit_margin: number
  budget_variance: number
}

// Filter types
export interface ProjectFilters {
  status?: ProjectStatus[]
  client_ids?: string[]
  start_date_range?: [string, string]
  due_date_range?: [string, string]
  assigned_staffer_ids?: string[]
}

// Progress helper
export type ProjectProgress = {
  percentage: number
  tasks_completed: number
  tasks_total: number
  on_schedule: boolean
}

// Type unions
export type ProjectEntity = Project | ProjectPhase | ProjectTask 