import { createClient } from "@/utils/supabase/client";
import type { ProjectPhase } from "@/types/project";

const supabase = createClient();

export const phaseService = {
   async getProjectPhases(projectId: string) {
      return supabase
         .from("project_phases")
         .select("*")
         .eq("project_id", projectId)
         .order("project_phase_number", { ascending: true });
   },

   async getPhaseById(phaseId: string) {
      return supabase
         .from("project_phases")
         .select("*")
         .eq("project_phase_id", phaseId)
         .single();
   },

   async createPhase(
      phase: Omit<
         ProjectPhase,
         "project_phase_id" | "created_at" | "last_updated_at"
      >
   ) {
      return supabase.from("project_phases").insert([phase]).select().single();
   },

   async updatePhase(phaseId: string, phase: Partial<ProjectPhase>) {
      return supabase
         .from("project_phases")
         .update(phase)
         .eq("project_phase_id", phaseId)
         .select()
         .single();
   },

   async deletePhase(phaseId: string) {
      return supabase
         .from("project_phases")
         .delete()
         .eq("project_phase_id", phaseId);
   },

   async getNextPhaseNumber(projectId: string) {
      const { data } = await supabase
         .from("project_phases")
         .select("project_phase_number")
         .eq("project_id", projectId)
         .order("project_phase_number", { ascending: false })
         .limit(1);

      return data && data.length > 0 ? data[0].project_phase_number + 1 : 1;
   }
};
