import { createClient } from "@/utils/supabase/client";

export interface Staffer {
   id: string;
   first_name: string;
   last_name: string;
   email: string;
   time_zone?: string;
   title: string;
   seniority_id?: string;
   capacity: number;
   created_at?: string;
   last_updated_at?: string;
   user_id?: string;
}

export interface CreateStafferData {
   first_name: string;
   last_name: string;
   email: string;
   time_zone?: string;
   title: string;
   seniority_id?: string;
   capacity: number;
   user_id?: string;
}

export interface UpdateStafferData extends Partial<CreateStafferData> {
   id: string;
}

class StafferService {
   private supabase = createClient();

   // Get all staffers
   async getAllStaffers() {
      try {
         const { data, error } = await this.supabase
            .from("staffers")
            .select("*")
            .order("last_name", { ascending: true });

         if (error) {
            throw new Error(`Failed to fetch staffers: ${error.message}`);
         }

         return { data: data as Staffer[], error: null };
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

   // Get a single staffer by ID
   async getStafferById(stafferId: string) {
      try {
         const { data, error } = await this.supabase
            .from("staffers")
            .select("*")
            .eq("id", stafferId)
            .single();

         if (error) {
            throw new Error(`Failed to fetch staffer: ${error.message}`);
         }

         return { data: data as Staffer, error: null };
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

   // Create a new staffer
   async createStaffer(stafferData: CreateStafferData) {
      try {
         const { data, error } = await this.supabase
            .from("staffers")
            .insert([stafferData])
            .select()
            .single();

         if (error) {
            throw new Error(`Failed to create staffer: ${error.message}`);
         }

         return { data: data as Staffer, error: null };
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

   // Update an existing staffer
   async updateStaffer(stafferData: UpdateStafferData) {
      try {
         const { id, ...updateData } = stafferData;

         console.log("updateData", updateData);

         const { data, error } = await this.supabase
            .from("staffers")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

         if (error) {
            throw new Error(`Failed to update staffer: ${error.message}`);
         }

         return { data: data as Staffer, error: null };
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

   // Delete a staffer
   async deleteStaffer(stafferId: string) {
      try {
         const { error } = await this.supabase
            .from("staffers")
            .delete()
            .eq("id", stafferId);

         if (error) {
            throw new Error(`Failed to delete staffer: ${error.message}`);
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

   // Search staffers by name or email
   async searchStaffers(query: string) {
      try {
         const { data, error } = await this.supabase
            .from("staffers")
            .select("*")
            .or(
               `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`
            )
            .order("last_name", { ascending: true });

         if (error) {
            throw new Error(`Failed to search staffers: ${error.message}`);
         }

         return { data: data as Staffer[], error: null };
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

   // Get staffers by capacity range
   async getStaffersByCapacity(minCapacity: number, maxCapacity: number) {
      try {
         const { data, error } = await this.supabase
            .from("staffers")
            .select("*")
            .gte("capacity", minCapacity)
            .lte("capacity", maxCapacity)
            .order("capacity", { ascending: false });

         if (error) {
            throw new Error(
               `Failed to fetch staffers by capacity: ${error.message}`
            );
         }

         return { data: data as Staffer[], error: null };
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
export const stafferService = new StafferService();
