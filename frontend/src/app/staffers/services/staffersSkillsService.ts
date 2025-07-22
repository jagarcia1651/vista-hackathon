import { createClient } from "@/utils/supabase/client";
import {
   Skill,
   Staffer,
   StafferSkill,
} from "../../../../../shared/schemas/typescript/staffer";

export interface CreateStafferSkillData {
   staffer_id: string;
   skill_id: string;
   skill_status: string;
   certification_active_date?: string;
   certification_expiry_date?: string;
}

export interface UpdateStafferSkillData
   extends Partial<Omit<CreateStafferSkillData, "staffer_id" | "skill_id">> {
   staffer_skill_id: string;
}

export interface StafferSkillWithDetails extends StafferSkill {
   skill: Skill;
   staffer: Staffer;
}

class StaffersSkillsService {
   private supabase = createClient();

   // Get all staffer skills
   async getAllStafferSkills() {
      try {
         const { data, error } = await this.supabase
            .from("staffer_skills")
            .select("*")
            .order("created_at", { ascending: false });

         if (error) {
            throw new Error(`Failed to fetch staffer skills: ${error.message}`);
         }

         return { data: data as StafferSkill[], error: null };
      } catch (error) {
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }

   // Get a single staffer skill by ID
   async getStafferSkillById(stafferSkillId: string) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_skills")
            .select("*")
            .eq("staffer_skill_id", stafferSkillId)
            .single();

         if (error) {
            throw new Error(`Failed to fetch staffer skill: ${error.message}`);
         }

         return { data: data as StafferSkill, error: null };
      } catch (error) {
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }

   // Get all skills for a specific staffer
   async getSkillsForStaffer(stafferId: string) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_skills")
            .select(
               `
               *,
               skills!skill_id (*)
            `
            )
            .eq("staffer_id", stafferId)
            .order("skill_status", { ascending: false });

         if (error) {
            throw new Error(
               `Failed to fetch skills for staffer: ${error.message}`
            );
         }

         return { data: data as StafferSkillWithDetails[], error: null };
      } catch (error) {
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }

   // Get all staffers with a specific skill
   async getStaffersWithSkill(skillId: string) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_skills")
            .select(
               `
               *,
               staffers!staffer_id (*)
            `
            )
            .eq("skill_id", skillId)
            .order("skill_status", { ascending: false });

         if (error) {
            throw new Error(
               `Failed to fetch staffers with skill: ${error.message}`
            );
         }

         return { data: data as StafferSkillWithDetails[], error: null };
      } catch (error) {
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }

   // Create a new staffer skill relationship
   async createStafferSkill(stafferSkillData: CreateStafferSkillData) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_skills")
            .insert([stafferSkillData])
            .select()
            .single();

         if (error) {
            throw new Error(`Failed to create staffer skill: ${error.message}`);
         }

         return { data: data as StafferSkill, error: null };
      } catch (error) {
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }

   // Update an existing staffer skill
   async updateStafferSkill(stafferSkillData: UpdateStafferSkillData) {
      try {
         const { staffer_skill_id, ...updateData } = stafferSkillData;

         const { data, error } = await this.supabase
            .from("staffer_skills")
            .update(updateData)
            .eq("staffer_skill_id", staffer_skill_id)
            .select()
            .single();

         if (error) {
            throw new Error(`Failed to update staffer skill: ${error.message}`);
         }

         return { data: data as StafferSkill, error: null };
      } catch (error) {
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }

   // Delete a staffer skill relationship
   async deleteStafferSkill(stafferSkillId: string) {
      try {
         const { error } = await this.supabase
            .from("staffer_skills")
            .delete()
            .eq("staffer_skill_id", stafferSkillId);

         if (error) {
            throw new Error(`Failed to delete staffer skill: ${error.message}`);
         }

         return { success: true, error: null };
      } catch (error) {
         return {
            success: false,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }

   // Delete all skills for a staffer
   async deleteAllSkillsForStaffer(stafferId: string) {
      try {
         const { error } = await this.supabase
            .from("staffer_skills")
            .delete()
            .eq("staffer_id", stafferId);

         if (error) {
            throw new Error(
               `Failed to delete skills for staffer: ${error.message}`
            );
         }

         return { success: true, error: null };
      } catch (error) {
         return {
            success: false,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }

   // Get staffers by skill status
   async getStafferSkillsByStatus(skillStatus: string) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_skills")
            .select(
               `
               *,
               skills!skill_id (*),
               staffers!staffer_id (*)
            `
            )
            .eq("skill_status", skillStatus)
            .order("created_at", { ascending: false });

         if (error) {
            throw new Error(
               `Failed to fetch staffer skills by status: ${error.message}`
            );
         }

         return { data: data as StafferSkillWithDetails[], error: null };
      } catch (error) {
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }

   // Get expiring certifications
   async getExpiringCertifications(beforeDate: string) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_skills")
            .select(
               `
               *,
               skills!skill_id (*),
               staffers!staffer_id (*)
            `
            )
            .eq("skill_status", "certified")
            .not("certification_expiry_date", "is", null)
            .lte("certification_expiry_date", beforeDate)
            .order("certification_expiry_date", { ascending: true });

         if (error) {
            throw new Error(
               `Failed to fetch expiring certifications: ${error.message}`
            );
         }

         return { data: data as StafferSkillWithDetails[], error: null };
      } catch (error) {
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }

   // Check if a staffer has a specific skill
   async stafferHasSkill(stafferId: string, skillId: string) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_skills")
            .select("staffer_skill_id")
            .eq("staffer_id", stafferId)
            .eq("skill_id", skillId)
            .single();

         if (error && error.code !== "PGRST116") {
            throw new Error(`Failed to check staffer skill: ${error.message}`);
         }

         return { exists: !!data, error: null };
      } catch (error) {
         return {
            exists: false,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }

   // Bulk assign skills to a staffer
   async bulkAssignSkillsToStaffer(
      stafferId: string,
      skillAssignments: Omit<CreateStafferSkillData, "staffer_id">[]
   ) {
      try {
         const skillsData = skillAssignments.map((skill) => ({
            ...skill,
            staffer_id: stafferId,
         }));

         const { data, error } = await this.supabase
            .from("staffer_skills")
            .insert(skillsData)
            .select();

         if (error) {
            throw new Error(`Failed to bulk assign skills: ${error.message}`);
         }

         return { data: data as StafferSkill[], error: null };
      } catch (error) {
         return {
            data: null,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }
}

// Export a singleton instance
export const staffersSkillsService = new StaffersSkillsService();
