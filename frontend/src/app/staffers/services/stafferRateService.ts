import { createClient } from "@/utils/supabase/client";
import { StafferRate } from "../../../../../shared/schemas/typescript/staffer";

export interface CreateStafferRateData {
   staffer_id: string;
   cost_rate: number;
   bill_rate: number;
}

export interface UpdateStafferRateData
   extends Partial<Omit<CreateStafferRateData, "staffer_id">> {
   staffer_rate_id: string;
}

class StafferRateService {
   private supabase = createClient();

   // Get rate for a specific staffer (should be only one)
   async getStafferRate(stafferId: string) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_rates")
            .select("*")
            .eq("staffer_id", stafferId)
            .single();

         if (error) {
            // If no rate found, return null instead of error
            if (error.code === "PGRST116") {
               return { data: null, error: null };
            }
            throw new Error(`Failed to fetch staffer rate: ${error.message}`);
         }

         return { data: data as StafferRate, error: null };
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

   // Create a new staffer rate
   async createStafferRate(rateData: CreateStafferRateData) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_rates")
            .insert([rateData])
            .select()
            .single();

         if (error) {
            throw new Error(`Failed to create staffer rate: ${error.message}`);
         }

         return { data: data as StafferRate, error: null };
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

   // Update an existing staffer rate
   async updateStafferRate(rateData: UpdateStafferRateData) {
      try {
         const { staffer_rate_id, ...updateData } = rateData;

         const { data, error } = await this.supabase
            .from("staffer_rates")
            .update(updateData)
            .eq("staffer_rate_id", staffer_rate_id)
            .select()
            .single();

         if (error) {
            throw new Error(`Failed to update staffer rate: ${error.message}`);
         }

         return { data: data as StafferRate, error: null };
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

   // Delete a staffer rate
   async deleteStafferRate(stafferRateId: string) {
      try {
         const { error } = await this.supabase
            .from("staffer_rates")
            .delete()
            .eq("staffer_rate_id", stafferRateId);

         if (error) {
            throw new Error(`Failed to delete staffer rate: ${error.message}`);
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

   // Check if a staffer has a rate
   async stafferHasRate(stafferId: string): Promise<boolean> {
      try {
         const { data, error } = await this.supabase
            .from("staffer_rates")
            .select("staffer_rate_id")
            .eq("staffer_id", stafferId)
            .single();

         return data !== null && !error;
      } catch {
         return false;
      }
   }
}

// Export a singleton instance
export const stafferRateService = new StafferRateService();
