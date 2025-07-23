import { createClient } from "@/utils/supabase/client";
import type { ProjectTeam, ProjectTeamMembership } from "@/types/project";
import type { Staffer } from "@/types/staffer";

const supabase = createClient();

export const teamService = {
   async getProjectTeams(projectId: string) {
      return supabase
         .from("project_teams")
         .select(
            `
        *,
        project_team_memberships (
          *,
          staffer: staffers (
            id,
            first_name,
            last_name,
            email,
            title
          )
        )
      `
         )
         .eq("project_id", projectId);
   },

   async getTeamByPhase(phaseId: string) {
      const { data, error } = await supabase
         .from("project_teams")
         .select(
            `
        *,
        project_team_memberships (
          *,
          staffer: staffers (
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
         .maybeSingle(); // Use maybeSingle instead of single to handle no results

      if (error && error.code !== "PGRST116") {
         // PGRST116 is the "no results" error code
         throw error;
      }

      return { data, error: null };
   },

   async createTeam(
      team: Omit<
         ProjectTeam,
         "project_team_id" | "created_at" | "last_updated_at"
      >
   ) {
      return supabase.from("project_teams").insert([team]).select().single();
   },

   async updateTeam(teamId: string, team: Partial<ProjectTeam>) {
      return supabase
         .from("project_teams")
         .update(team)
         .eq("project_team_id", teamId)
         .select()
         .single();
   },

   async deleteTeam(teamId: string) {
      return supabase
         .from("project_teams")
         .delete()
         .eq("project_team_id", teamId);
   },

   async addTeamMember(
      membership: Omit<
         ProjectTeamMembership,
         "project_team_membership_id" | "created_at" | "last_updated_at"
      >
   ) {
      return supabase
         .from("project_team_memberships")
         .insert([membership])
         .select()
         .single();
   },

   async removeTeamMember(membershipId: string) {
      return supabase
         .from("project_team_memberships")
         .delete()
         .eq("project_team_membership_id", membershipId);
   },

   async getAvailableStaffers() {
      return supabase.from("staffers").select(`
        id,
        first_name,
        last_name,
        email,
        title,
        capacity,
        seniority: seniorities (
          seniority_name,
          seniority_level
        )
      `);
   }
};
