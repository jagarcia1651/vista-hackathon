import { createClient } from "@/utils/supabase/client";
import { Seniority } from "../../../../../shared/schemas/typescript/staffer";

export interface CreateSeniorityData {
   seniority_name: string;
   seniority_level: number;
}

export interface UpdateSeniorityData extends Partial<CreateSeniorityData> {
   seniority_id: string;
}

class SeniorityService {
   private supabase = createClient();

   // Get all seniorities
   async getAllSeniorities() {
      try {
         const { data, error } = await this.supabase
            .from("seniorities")
            .select("*")
            .order("seniority_level", { ascending: true });

         if (error) {
            throw new Error(`Failed to fetch seniorities: ${error.message}`);
         }

         return { data: data as Seniority[], error: null };
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

   // Get a single seniority by ID
   async getSeniorityById(seniorityId: string) {
      try {
         const { data, error } = await this.supabase
            .from("seniorities")
            .select("*")
            .eq("seniority_id", seniorityId)
            .single();

         if (error) {
            throw new Error(`Failed to fetch seniority: ${error.message}`);
         }

         return { data: data as Seniority, error: null };
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

   // Create a new seniority
   async createSeniority(seniorityData: CreateSeniorityData) {
      try {
         const { data, error } = await this.supabase
            .from("seniorities")
            .insert([seniorityData])
            .select()
            .single();

         if (error) {
            throw new Error(`Failed to create seniority: ${error.message}`);
         }

         return { data: data as Seniority, error: null };
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

   // Update an existing seniority
   async updateSeniority(seniorityData: UpdateSeniorityData) {
      try {
         const { seniority_id, ...updateData } = seniorityData;

         const { data, error } = await this.supabase
            .from("seniorities")
            .update(updateData)
            .eq("seniority_id", seniority_id)
            .select()
            .single();

         if (error) {
            throw new Error(`Failed to update seniority: ${error.message}`);
         }

         return { data: data as Seniority, error: null };
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

   // Delete a seniority
   async deleteSeniority(seniorityId: string) {
      try {
         const { error } = await this.supabase
            .from("seniorities")
            .delete()
            .eq("seniority_id", seniorityId);

         if (error) {
            throw new Error(`Failed to delete seniority: ${error.message}`);
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

   // Get seniorities by level range
   async getSenioritiesByLevelRange(minLevel: number, maxLevel: number) {
      try {
         const { data, error } = await this.supabase
            .from("seniorities")
            .select("*")
            .gte("seniority_level", minLevel)
            .lte("seniority_level", maxLevel)
            .order("seniority_level", { ascending: true });

         if (error) {
            throw new Error(
               `Failed to fetch seniorities by level: ${error.message}`
            );
         }

         return { data: data as Seniority[], error: null };
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

   // Search seniorities by name
   async searchSeniorities(query: string) {
      try {
         const { data, error } = await this.supabase
            .from("seniorities")
            .select("*")
            .ilike("seniority_name", `%${query}%`)
            .order("seniority_level", { ascending: true });

         if (error) {
            throw new Error(`Failed to search seniorities: ${error.message}`);
         }

         return { data: data as Seniority[], error: null };
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
export const seniorityService = new SeniorityService();
