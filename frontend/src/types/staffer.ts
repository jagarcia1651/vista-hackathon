import { BaseEntity, SkillStatus } from "./base";

export interface Staffer extends BaseEntity {
   id: string;
   first_name: string;
   last_name: string;
   email: string;
   title: string;
   seniority_id?: string;
   time_zone?: string;
   capacity: number;
}

export interface StafferSkill extends BaseEntity {
   skill_id: string;
   staffer_id: string;
   skill_name: string;
   skill_level: SkillStatus;
   years_experience: number;
   is_certified: boolean;
}

export interface StafferRate extends BaseEntity {
   rate_id: string;
   staffer_id: string;
   rate_type: string;
   rate_amount: number;
   currency: string;
   effective_date: string;
   end_date?: string;
}

export interface StafferTimeOff extends BaseEntity {
   time_off_id: string;
   staffer_id: string;
   start_date: string;
   end_date: string;
   time_off_type: string;
   is_approved: boolean;
   notes?: string;
}
