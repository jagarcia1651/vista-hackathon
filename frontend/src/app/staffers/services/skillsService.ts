import { createClient } from "@/utils/supabase/client";
import { Skill } from "../../../../../shared/schemas/typescript/staffer";

export interface CreateSkillData {
   skill_name: string;
   skill_description: string;
   is_certification: boolean;
}

export interface UpdateSkillData extends Partial<CreateSkillData> {
   skill_id: string;
}

class SkillsService {
   private supabase = createClient();

   // Get all skills
   async getAllSkills() {
      try {
         const { data, error } = await this.supabase
            .from("skills")
            .select("*")
            .order("skill_name", { ascending: true });

         if (error) {
            throw new Error(`Failed to fetch skills: ${error.message}`);
         }

         return { data: data as Skill[], error: null };
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

   // Get a single skill by ID
   async getSkillById(skillId: string) {
      try {
         const { data, error } = await this.supabase
            .from("skills")
            .select("*")
            .eq("skill_id", skillId)
            .single();

         if (error) {
            throw new Error(`Failed to fetch skill: ${error.message}`);
         }

         return { data: data as Skill, error: null };
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

   // Create a new skill
   async createSkill(skillData: CreateSkillData) {
      try {
         const { data, error } = await this.supabase
            .from("skills")
            .insert([skillData])
            .select()
            .single();

         if (error) {
            throw new Error(`Failed to create skill: ${error.message}`);
         }

         return { data: data as Skill, error: null };
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

   // Update an existing skill
   async updateSkill(skillData: UpdateSkillData) {
      try {
         const { skill_id, ...updateData } = skillData;

         const { data, error } = await this.supabase
            .from("skills")
            .update(updateData)
            .eq("skill_id", skill_id)
            .select()
            .single();

         if (error) {
            throw new Error(`Failed to update skill: ${error.message}`);
         }

         return { data: data as Skill, error: null };
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

   // Delete a skill
   async deleteSkill(skillId: string) {
      try {
         const { error } = await this.supabase
            .from("skills")
            .delete()
            .eq("skill_id", skillId);

         if (error) {
            throw new Error(`Failed to delete skill: ${error.message}`);
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

   // Search skills by name or description
   async searchSkills(query: string) {
      try {
         const { data, error } = await this.supabase
            .from("skills")
            .select("*")
            .or(
               `skill_name.ilike.%${query}%,skill_description.ilike.%${query}%`
            )
            .order("skill_name", { ascending: true });

         if (error) {
            throw new Error(`Failed to search skills: ${error.message}`);
         }

         return { data: data as Skill[], error: null };
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

   // Get skills by certification status
   async getSkillsByCertification(isCertification: boolean) {
      try {
         const { data, error } = await this.supabase
            .from("skills")
            .select("*")
            .eq("is_certification", isCertification)
            .order("skill_name", { ascending: true });

         if (error) {
            throw new Error(
               `Failed to fetch skills by certification status: ${error.message}`
            );
         }

         return { data: data as Skill[], error: null };
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

   // Get only certification skills
   async getCertificationSkills() {
      return this.getSkillsByCertification(true);
   }

   // Get only non-certification skills
   async getNonCertificationSkills() {
      return this.getSkillsByCertification(false);
   }
}

// Export a singleton instance
export const skillsService = new SkillsService();
