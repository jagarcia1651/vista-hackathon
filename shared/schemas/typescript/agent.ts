/**
 * Agent Entity and Session Types
 */

import { BaseEntity } from './base'

export interface Agent extends BaseEntity {
  agent_id: string
  agent_domain: string
  agent_name: string
  agent_description: string
  is_enabled: boolean
}

export interface AgentSession {
  session_id: string
  user_id: string
  agent_name: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface AgentRequest {
  session_id: string
  request: string
  context?: Record<string, any>
  user_id: string
}

export interface AgentResponse {
  session_id: string
  response: string
  success: boolean
  data?: any
  error?: string
  thinking_logs?: ThinkingLogEntry[]
}

export interface ThinkingLogEntry {
  id: string
  session_id: string
  agent_name: string
  message: string
  timestamp: string
  log_level: 'info' | 'thinking' | 'action' | 'error'
}

export interface AgentProgressUpdate {
  session_id: string
  agent_name: string
  progress_percentage: number
  current_step: string
  estimated_completion: string
}

export interface MultiAgentWorkflow {
  workflow_id: string
  agents_involved: string[]
  current_agent: string
  workflow_status: 'pending' | 'running' | 'completed' | 'failed'
  data_flow: Record<string, any>
  created_at: string
  updated_at: string
} 