import { createClient } from "@/utils/supabase/client";
import type { ProjectTask } from "@/types/project";

export interface CreateTaskData {
   project_id: string;
   project_task_name: string;
   project_task_description: string;
   project_task_status: string;
   project_task_start_date: string;
   project_task_due_date: string;
   estimated_hours: number;
   actual_hours?: number;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
   project_task_id: string;
}

class TaskService {
   private supabase = createClient();

   async getProjectTasks(projectId: string) {
      try {
         const { data, error } = await this.supabase
            .from("project_tasks")
            .select(
               `
          project_task_id,
          project_id,
          project_task_name,
          project_task_description,
          project_task_status,
          project_task_start_date,
          project_task_due_date,
          project_phase_id,
          estimated_hours,
          actual_hours,
          created_at,
          last_updated_at
        `
            )
            .eq("project_id", projectId)
            .order("created_at", { ascending: false });

         if (error) {
            console.error("Error fetching tasks:", error);
            throw error;
         }

         return { data: data as ProjectTask[], error: null };
      } catch (error) {
         console.error("Error in getProjectTasks:", error);
         return {
            data: null,
            error:
               error instanceof Error ? error.message : "Failed to fetch tasks"
         };
      }
   }

   async getPhaseTasksWithAssignments(phaseId: string) {
      try {
         const { data, error } = await this.supabase
            .from("project_tasks")
            .select(
               `
               project_task_id,
               project_id,
               project_phase_id,
               project_task_name,
               project_task_description,
               project_task_status,
               project_task_start_date,
               project_task_due_date,
               estimated_hours,
               actual_hours,
               created_at,
               last_updated_at,
               staffer_assignments:staffer_assignments(
                  staffer_assignment_id,
                  staffer:staffers(
                     id,
                     first_name,
                     last_name,
                     email,
                     title
                  )
               )
            `
            )
            .eq("project_phase_id", phaseId)
            .order("created_at", { ascending: false });

         if (error) {
            console.error("Error fetching phase tasks:", error);
            throw error;
         }

         return { data: data as ProjectTask[], error: null };
      } catch (error) {
         console.error("Error in getPhaseTasksWithAssignments:", error);
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Failed to fetch phase tasks"
         };
      }
   }

   async createTask(taskData: CreateTaskData) {
      try {
         const { data, error } = await this.supabase
            .from("project_tasks")
            .insert([
               {
                  ...taskData,
                  actual_hours: taskData.actual_hours || 0,
                  created_at: new Date().toISOString(),
                  last_updated_at: new Date().toISOString()
               }
            ])
            .select()
            .single();

         if (error) {
            console.error("Error creating task:", error);
            throw error;
         }

         return { data: data as ProjectTask, error: null };
      } catch (error) {
         console.error("Error in createTask:", error);
         return {
            data: null,
            error:
               error instanceof Error ? error.message : "Failed to create task"
         };
      }
   }

   async updateTask(taskData: UpdateTaskData) {
      try {
         const { project_task_id, ...updateData } = taskData;

         const { data, error } = await this.supabase
            .from("project_tasks")
            .update({
               ...updateData,
               last_updated_at: new Date().toISOString()
            })
            .eq("project_task_id", project_task_id)
            .select()
            .single();

         if (error) {
            console.error("Error updating task:", error);
            throw error;
         }

         return { data: data as ProjectTask, error: null };
      } catch (error) {
         console.error("Error in updateTask:", error);
         return {
            data: null,
            error:
               error instanceof Error ? error.message : "Failed to update task"
         };
      }
   }

   async deleteTask(taskId: string) {
      try {
         const { error } = await this.supabase
            .from("project_tasks")
            .delete()
            .eq("project_task_id", taskId);

         if (error) {
            console.error("Error deleting task:", error);
            throw error;
         }

         return { success: true, error: null };
      } catch (error) {
         console.error("Error in deleteTask:", error);
         return {
            success: false,
            error:
               error instanceof Error ? error.message : "Failed to delete task"
         };
      }
   }
}

export const taskService = new TaskService();
