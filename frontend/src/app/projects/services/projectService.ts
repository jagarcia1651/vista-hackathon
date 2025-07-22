import { createClient } from "@/utils/supabase/client";
import type { Project } from "@/types/project";
import { ProjectStatus } from "@/types/base";

export interface CreateProjectData {
   project_name: string;
   project_status: ProjectStatus;
   client_id: string;
   project_start_date?: string;
   project_due_date?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
   project_id: string;
}

class ProjectService {
   private supabase = createClient();

   async getAllProjects() {
      try {
         const { data, error } = await this.supabase
            .from("projects")
            .select(
               `
          project_id,
          client_id,
          project_name,
          project_status,
          project_start_date,
          project_due_date,
          created_at,
          last_updated_at
        `
            )
            .order("created_at", { ascending: false });

         if (error) {
            console.error("Error fetching projects:", error);
            throw error;
         }

         return { data: data as Project[], error: null };
      } catch (error) {
         console.error("Error in getAllProjects:", error);
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Failed to fetch projects"
         };
      }
   }

   async getProjectById(projectId: string) {
      try {
         const { data, error } = await this.supabase
            .from("projects")
            .select(
               `
          project_id,
          client_id,
          project_name,
          project_status,
          project_start_date,
          project_due_date,
          created_at,
          last_updated_at
        `
            )
            .eq("project_id", projectId)
            .single();

         if (error) {
            console.error("Error fetching project:", error);
            throw error;
         }

         return { data: data as Project, error: null };
      } catch (error) {
         console.error("Error in getProjectById:", error);
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Failed to fetch project"
         };
      }
   }

   async getClients() {
      try {
         const { data, error } = await this.supabase
            .from("clients")
            .select("client_id, client_name")
            .order("client_name");

         if (error) {
            console.error("Error fetching clients:", error);
            throw error;
         }

         return { data, error: null };
      } catch (error) {
         console.error("Error in getClients:", error);
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Failed to fetch clients"
         };
      }
   }

   async createProject(projectData: CreateProjectData) {
      try {
         // Validate required fields
         if (!projectData.project_name) {
            throw new Error("Project name is required");
         }
         if (!projectData.project_status) {
            throw new Error("Project status is required");
         }
         if (!projectData.client_id) {
            throw new Error("Client is required");
         }

         const { data, error } = await this.supabase
            .from("projects")
            .insert([
               {
                  ...projectData,
                  created_at: new Date().toISOString(),
                  last_updated_at: new Date().toISOString()
               }
            ])
            .select()
            .single();

         if (error) {
            console.error("Supabase error creating project:", error);
            throw error;
         }

         return { data: data as Project, error: null };
      } catch (error) {
         console.error("Error in createProject:", error);
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Failed to create project"
         };
      }
   }

   async updateProject(projectData: UpdateProjectData) {
      try {
         if (!projectData.project_id) {
            throw new Error("Project ID is required for updates");
         }

         const { project_id, ...updateData } = projectData;

         const { data, error } = await this.supabase
            .from("projects")
            .update({
               ...updateData,
               last_updated_at: new Date().toISOString()
            })
            .eq("project_id", project_id)
            .select()
            .single();

         if (error) {
            console.error("Supabase error updating project:", error);
            throw error;
         }
         return { data: data as Project, error: null };
      } catch (error) {
         console.error("Error in updateProject:", error);
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Failed to update project"
         };
      }
   }

   async deleteProject(projectId: string) {
      try {
         if (!projectId) {
            throw new Error("Project ID is required for deletion");
         }

         const { error } = await this.supabase
            .from("projects")
            .delete()
            .eq("project_id", projectId);

         if (error) {
            console.error("Supabase error deleting project:", error);
            throw error;
         }

         return { success: true, error: null };
      } catch (error) {
         console.error("Error in deleteProject:", error);
         return {
            success: false,
            error:
               error instanceof Error
                  ? error.message
                  : "Failed to delete project"
         };
      }
   }
}

export const projectService = new ProjectService();
