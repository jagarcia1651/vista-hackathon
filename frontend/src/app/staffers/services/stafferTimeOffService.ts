import { createClient } from "@/utils/supabase/client";
import { StafferTimeOff } from "../../../../../shared/schemas/typescript/staffer";

export interface CreateStafferTimeOffData {
   staffer_id: string;
   time_off_start_datetime: string;
   time_off_end_datetime: string;
   time_off_cumulative_hours: number;
}

export interface UpdateStafferTimeOffData
   extends Partial<Omit<CreateStafferTimeOffData, "staffer_id">> {
   time_off_id: string;
}

class StafferTimeOffService {
   private supabase = createClient();

   // Get all time off entries for a specific staffer
   async getStafferTimeOff(stafferId: string) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_time_off")
            .select("*")
            .eq("staffer_id", stafferId)
            .order("time_off_start_datetime", { ascending: true });

         if (error) {
            throw new Error(
               `Failed to fetch staffer time off: ${error.message}`
            );
         }

         return { data: data as StafferTimeOff[], error: null };
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

   // Get a single time off entry by ID
   async getTimeOffById(timeOffId: string) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_time_off")
            .select("*")
            .eq("time_off_id", timeOffId)
            .single();

         if (error) {
            throw new Error(`Failed to fetch time off entry: ${error.message}`);
         }

         return { data: data as StafferTimeOff, error: null };
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

   // Create a new time off entry
   async createStafferTimeOff(timeOffData: CreateStafferTimeOffData) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_time_off")
            .insert([timeOffData])
            .select()
            .single();

         if (error) {
            throw new Error(
               `Failed to create time off entry: ${error.message}`
            );
         }

         // If creation was successful, notify the backend orchestrator
         const createdTimeOff = data as StafferTimeOff;
         if (createdTimeOff) {
            try {
               const payload = {
                  time_off_id: createdTimeOff.time_off_id,
                  staffer_id: createdTimeOff.staffer_id,
                  time_off_start_datetime:
                     createdTimeOff.time_off_start_datetime,
                  time_off_end_datetime: createdTimeOff.time_off_end_datetime,
                  time_off_cumulative_hours:
                     createdTimeOff.time_off_cumulative_hours,
                  created_at: createdTimeOff.created_at,
                  last_updated_at: createdTimeOff.last_updated_at,
               };

               console.log("Sending time off data to backend:", payload);

               // First, call debug endpoint to see what we're sending
               try {
                  const debugResponse = await fetch(
                     "/api/v1/agent/time-off-created-debug",
                     {
                        method: "POST",
                        headers: {
                           "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                     }
                  );
                  const debugResult = await debugResponse.json();
                  console.log("Debug endpoint response:", debugResult);
               } catch (debugError) {
                  console.error("Debug endpoint error:", debugError);
               }

               // Call the backend endpoint to trigger orchestrator
               const response = await fetch("/api/v1/agent/time-off-created", {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/json",
                  },
                  body: JSON.stringify(payload),
               });

               if (!response.ok) {
                  const errorText = await response.text();
                  console.error(
                     "Backend response error:",
                     response.status,
                     errorText
                  );
               } else {
                  console.log("Successfully notified backend orchestrator");
               }
            } catch (notificationError) {
               // Log the error but don't fail the time off creation
               console.warn(
                  "Failed to notify orchestrator about time off creation:",
                  notificationError
               );
            }
         }

         return { data: createdTimeOff, error: null };
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

   // Update an existing time off entry
   async updateStafferTimeOff(timeOffData: UpdateStafferTimeOffData) {
      try {
         const { time_off_id, ...updateData } = timeOffData;

         const { data, error } = await this.supabase
            .from("staffer_time_off")
            .update(updateData)
            .eq("time_off_id", time_off_id)
            .select()
            .single();

         if (error) {
            throw new Error(
               `Failed to update time off entry: ${error.message}`
            );
         }

         return { data: data as StafferTimeOff, error: null };
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

   // Delete a time off entry
   async deleteStafferTimeOff(timeOffId: string) {
      try {
         const { error } = await this.supabase
            .from("staffer_time_off")
            .delete()
            .eq("time_off_id", timeOffId);

         if (error) {
            throw new Error(
               `Failed to delete time off entry: ${error.message}`
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

   // Get time off entries within a date range
   async getStafferTimeOffByDateRange(
      stafferId: string,
      startDate: string,
      endDate: string
   ) {
      try {
         const { data, error } = await this.supabase
            .from("staffer_time_off")
            .select("*")
            .eq("staffer_id", stafferId)
            .gte("time_off_start_datetime", startDate)
            .lte("time_off_end_datetime", endDate)
            .order("time_off_start_datetime", { ascending: true });

         if (error) {
            throw new Error(
               `Failed to fetch time off entries: ${error.message}`
            );
         }

         return { data: data as StafferTimeOff[], error: null };
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

   // Get upcoming time off entries
   async getUpcomingTimeOff(stafferId: string) {
      try {
         const today = new Date().toISOString();

         const { data, error } = await this.supabase
            .from("staffer_time_off")
            .select("*")
            .eq("staffer_id", stafferId)
            .gte("time_off_start_datetime", today)
            .order("time_off_start_datetime", { ascending: true });

         if (error) {
            throw new Error(
               `Failed to fetch upcoming time off: ${error.message}`
            );
         }

         return { data: data as StafferTimeOff[], error: null };
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

   // Get total time off hours for a year
   async getTotalTimeOffHours(stafferId: string, year: number) {
      try {
         const startOfYear = `${year}-01-01T00:00:00Z`;
         const endOfYear = `${year}-12-31T23:59:59Z`;

         const { data, error } = await this.supabase
            .from("staffer_time_off")
            .select("time_off_cumulative_hours")
            .eq("staffer_id", stafferId)
            .gte("time_off_start_datetime", startOfYear)
            .lte("time_off_end_datetime", endOfYear);

         if (error) {
            throw new Error(
               `Failed to calculate total time off hours: ${error.message}`
            );
         }

         const totalHours = data.reduce(
            (sum, entry) => sum + entry.time_off_cumulative_hours,
            0
         );
         return { data: totalHours, error: null };
      } catch (error) {
         return {
            data: 0,
            error:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   }
}

// Export a singleton instance
export const stafferTimeOffService = new StafferTimeOffService();
