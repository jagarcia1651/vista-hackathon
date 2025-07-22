/**
 * PSA Domain Types - TypeScript
 * 
 * Centralized export of all PSA domain types for TypeScript/Next.js application
 */

// Base types and enums
export * from './base'

// Core entities
export * from './address'
export * from './agent'
export * from './client'
export * from './holiday'
export * from './project'
export * from './quote'
export * from './staffer'

// Agent-specific types
export * from './agents/project-management'
export * from './agents/resourcing'
export * from './agents/quotes'

// Type unions for convenience
export type ClientEntity = import('./client').Client | import('./client').ClientContact | import('./client').ClientArtifact
export type ProjectEntity = import('./project').Project | import('./project').ProjectPhase | import('./project').ProjectTask
export type ResourceEntity = import('./staffer').Staffer | import('./staffer').StafferSkill | import('./staffer').StafferRate | import('./staffer').StafferTimeOff 