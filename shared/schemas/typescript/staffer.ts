/**
 * Staffer and Resource Entity Types
 */

import { BaseEntity } from "./base";
// Forward declaration to avoid circular dependency
type ProjectTask = any;

export interface Seniority extends BaseEntity {
   seniority_id: string;
   seniority_name: string;
   seniority_level: number;
}

export interface Skill extends BaseEntity {
   skill_id: string;
   skill_name: string;
   skill_description: string;
   is_certification: boolean;
}

export interface Staffer extends BaseEntity {
   id: string;
   title: string;
   seniority_id: string;
   capacity: number;
   time_zone?: string;
   first_name?: string;
   last_name?: string;
   email?: string;
   user_id?: string;
}

export interface StafferSkill extends BaseEntity {
   staffer_skill_id: string;
   staffer_id: string;
   skill_id: string;
   skill_status: string;
   certification_active_date?: string;
   certification_expiry_date?: string;
}

export interface StafferRate extends BaseEntity {
   staffer_rate_id: string;
   staffer_id: string;
   cost_rate: number;
   bill_rate: number;
}

export interface StafferTimeOff extends BaseEntity {
   time_off_id: string;
   staffer_id: string;
   time_off_start_datetime: string;
   time_off_end_datetime: string;
   time_off_cumulative_hours: number;
}

// Business logic types
export interface StafferWithDetails extends Staffer {
   seniority: Seniority;
   skills: (StafferSkill & { skill: Skill })[];
   currentAssignments: ProjectTask[];
   utilizationRate: number;
   availableHours: number;
}

// Capacity planning types
export interface StafferCapacity {
   staffer_id: string;
   total_capacity: number;
   allocated_hours: number;
   available_hours: number;
   utilization_percentage: number;
   upcoming_time_off: TimeOffPeriod[];
}

export interface TimeOffPeriod {
   start_date: string;
   end_date: string;
   total_hours: number;
   type: "vacation" | "sick" | "personal" | "holiday";
}

// Resource allocation types
export interface ResourceAllocation {
   project_task_id: string;
   staffer_id: string;
   allocated_hours: number;
   start_date: string;
   end_date: string;
   allocation_percentage: number;
}

// Analytics types
export interface TeamProductivity {
   period: string;
   total_billable_hours: number;
   total_available_hours: number;
   efficiency_ratio: number;
   top_performers: string[];
   skill_gaps: string[];
}

// Filter types
export interface StafferFilters {
   skill_ids?: string[];
   seniority_levels?: number[];
   availability_start?: string;
   availability_end?: string;
   utilization_threshold?: number;
}

// Availability helper
export type StafferAvailability = {
   is_available: boolean;
   available_hours: number;
   next_available_date: string;
   utilization_rate: number;
};

// Type unions
export type ResourceEntity =
   | Staffer
   | StafferSkill
   | StafferRate
   | StafferTimeOff;
