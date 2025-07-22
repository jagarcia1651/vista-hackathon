import { createClient } from "@/utils/supabase/client";
import type { StafferAssignment } from "@/types/project";

const supabase = createClient();

export const assignmentService = {
   async getTaskAssignments(taskId: string) {
      return supabase
         .from("staffer_assignments")
         .select(
            `
        *,
        staffer: staffers (
          id,
          first_name,
          last_name,
          email,
          title
        )
      `
         )
         .eq("project_task_id", taskId);
   },

   async getStafferAssignments(stafferId: string) {
      return supabase
         .from("staffer_assignments")
         .select(
            `
        *,
        project_task: project_tasks (
          project_task_id,
          project_task_name,
          project_task_status,
          project_task_start_date,
          project_task_due_date,
          estimated_hours,
          actual_hours
        )
      `
         )
         .eq("staffer_id", stafferId);
   },

   async assignStaffer(
      assignment: Omit<
         StafferAssignment,
         "staffer_assignment_id" | "created_at" | "last_updated_at"
      >
   ) {
      return supabase
         .from("staffer_assignments")
         .insert([assignment])
         .select()
         .single();
   },

   async removeAssignment(assignmentId: string) {
      return supabase
         .from("staffer_assignments")
         .delete()
         .eq("staffer_assignment_id", assignmentId);
   }
};
