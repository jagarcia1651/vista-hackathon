/**
 * Base Types and Common Interfaces
 */

export interface BaseEntity {
   created_at: string;
   last_updated_at: string;
}

// Common status enums
export enum ProjectStatus {
   RFP = "RFP",
   QUOTED = "Quoted",
   LOST = "Lost",
   PENDING = "Pending",
   IN_PROGRESS_ON_TRACK = "In Progress - On Track",
   IN_PROGRESS_OFF_TRACK = "In Progress - Off Track",
   COMPLETED = "Completed",
   CANCELLED = "Cancelled"
}

export enum TaskStatus {
   TODO = "To Do",
   IN_PROGRESS_ON_TRACK = "In Progress - On Track",
   IN_PROGRESS_OFF_TRACK = "In Progress - Off Track",
   COMPLETED = "Completed",
   CANCELLED = "Cancelled"
}

export enum QuoteStatus {
   DRAFT = "draft",
   PENDING_APPROVAL = "pending_approval",
   SENT = "sent",
   ACCEPTED = "accepted",
   REJECTED = "rejected",
   EXPIRED = "expired"
}

export enum SkillStatus {
   LEARNING = "learning",
   COMPETENT = "competent",
   EXPERT = "expert",
   CERTIFIED = "certified"
}

export enum ClientContactStatus {
   ACTIVE = "active",
   INACTIVE = "inactive",
   PRIMARY = "primary",
   BILLING = "billing"
}

export enum HolidayType {
   FIXED = "fixed",
   FLOATING = "floating",
   CALCULATED = "calculated"
}
