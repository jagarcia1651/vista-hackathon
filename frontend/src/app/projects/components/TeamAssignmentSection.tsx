"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectTeam, ProjectTeamMembership } from "@/types/project";
import type { Staffer } from "@/types/staffer";
import { teamService } from "../services/teamService";
import { Plus, X } from "lucide-react";

interface TeamAssignmentSectionProps {
   projectId: string;
   phaseId?: string;
}

interface TeamWithMembers extends ProjectTeam {
   project_team_memberships: (ProjectTeamMembership & {
      staffer: Staffer;
   })[];
}

interface StafferResponse {
   id: string;
   first_name: string;
   last_name: string;
   email: string;
   title: string;
   capacity: number;
   time_zone?: string | null;
   seniority?: {
      seniority_name: string;
      seniority_level: number;
   } | null;
}

export function TeamAssignmentSection({
   projectId,
   phaseId
}: TeamAssignmentSectionProps) {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [team, setTeam] = useState<TeamWithMembers | null>(null);
   const [availableStaffers, setAvailableStaffers] = useState<Staffer[]>([]);
   const [selectedStafferId, setSelectedStafferId] = useState<string>("");
   const [teamName, setTeamName] = useState("");
   const [showTeamForm, setShowTeamForm] = useState(false);

   useEffect(() => {
      if (phaseId) {
         loadTeam();
      }
      loadAvailableStaffers();
   }, [phaseId]);

   const loadTeam = async () => {
      if (!phaseId) return;

      try {
         const { data, error } = await teamService.getTeamByPhase(phaseId);
         if (error) throw error;
         if (data) {
            setTeam(data as TeamWithMembers);
            setTeamName(data.project_team_name);
         }
      } catch (err) {
         console.error("Error loading team:", err);
      }
   };

   const loadAvailableStaffers = async () => {
      try {
         const { data, error } = await teamService.getAvailableStaffers();
         if (error) throw error;
         if (data) {
            const staffers: Staffer[] = data.map(rawStaffer => {
               const staffer = rawStaffer as unknown as {
                  id: string;
                  first_name: string;
                  last_name: string;
                  email: string;
                  title: string;
                  capacity: number;
                  time_zone?: string;
                  seniority?: {
                     seniority_name: string;
                     seniority_level: number;
                  };
               };

               return {
                  id: staffer.id,
                  first_name: staffer.first_name,
                  last_name: staffer.last_name,
                  email: staffer.email,
                  title: staffer.title,
                  capacity: staffer.capacity,
                  time_zone: staffer.time_zone,
                  created_at: new Date().toISOString(),
                  last_updated_at: new Date().toISOString(),
                  seniority: staffer.seniority
               };
            });
            setAvailableStaffers(staffers);
         }
      } catch (err) {
         console.error("Error loading staffers:", err);
      }
   };

   const handleCreateTeam = async () => {
      if (!teamName.trim()) {
         setError("Team name is required");
         return;
      }

      if (!phaseId) {
         setError("Phase ID is required");
         return;
      }

      setLoading(true);
      setError(null);

      try {
         const { data, error } = await teamService.createTeam({
            project_team_name: teamName,
            project_id: projectId,
            project_phase_id: phaseId
         });

         if (error) throw error;
         if (data) {
            setTeam(data as TeamWithMembers);
            setShowTeamForm(false);
         }
      } catch (err) {
         console.error("Error creating team:", err);
         setError("Failed to create team");
      } finally {
         setLoading(false);
      }
   };

   const handleAddMember = async () => {
      if (!selectedStafferId || !team) return;

      setLoading(true);
      setError(null);

      try {
         const { error } = await teamService.addTeamMember({
            project_team_id: team.project_team_id,
            staffer_id: selectedStafferId
         });

         if (error) throw error;
         loadTeam(); // Reload team to get updated members
         setSelectedStafferId("");
      } catch (err) {
         console.error("Error adding team member:", err);
         setError("Failed to add team member");
      } finally {
         setLoading(false);
      }
   };

   const handleRemoveMember = async (membershipId: string) => {
      setLoading(true);
      setError(null);

      try {
         const { error } = await teamService.removeTeamMember(membershipId);
         if (error) throw error;
         loadTeam(); // Reload team to get updated members
      } catch (err) {
         console.error("Error removing team member:", err);
         setError("Failed to remove team member");
      } finally {
         setLoading(false);
      }
   };

   if (!phaseId) {
      return (
         <div className="text-sm text-gray-500 italic">
            Save the phase first to manage team assignments
         </div>
      );
   }

   if (!team && !showTeamForm) {
      return (
         <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-4">
               No team assigned to this phase
            </p>
            <Button onClick={() => setShowTeamForm(true)}>
               <Plus className="w-4 h-4 mr-2" />
               Create Team
            </Button>
         </div>
      );
   }

   if (showTeamForm) {
      return (
         <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-sm font-medium">Team Name</label>
               <Input
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="Enter team name"
               />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex justify-end gap-2">
               <Button
                  variant="outline"
                  onClick={() => setShowTeamForm(false)}
                  disabled={loading}
               >
                  Cancel
               </Button>
               <Button onClick={handleCreateTeam} disabled={loading}>
                  {loading ? "Creating..." : "Create Team"}
               </Button>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="font-medium">{team?.project_team_name}</h3>
            <div className="flex items-center gap-2">
               <select
                  className="px-3 py-1 border rounded-md text-sm"
                  value={selectedStafferId}
                  onChange={e => setSelectedStafferId(e.target.value)}
               >
                  <option value="">Select staffer...</option>
                  {availableStaffers.map(staffer => (
                     <option key={staffer.id} value={staffer.id}>
                        {staffer.first_name} {staffer.last_name} -{" "}
                        {staffer.title}
                     </option>
                  ))}
               </select>
               <Button
                  size="sm"
                  onClick={handleAddMember}
                  disabled={!selectedStafferId || loading}
               >
                  Add
               </Button>
            </div>
         </div>

         {error && <div className="text-sm text-red-600">{error}</div>}

         <div className="space-y-2">
            {team?.project_team_memberships?.map(membership => (
               <div
                  key={membership.project_team_membership_id}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
               >
                  <div className="text-sm">
                     {membership.staffer?.first_name}{" "}
                     {membership.staffer?.last_name}
                     <span className="text-gray-500 ml-2">
                        {membership.staffer?.title}
                     </span>
                  </div>
                  <Button
                     size="sm"
                     variant="ghost"
                     onClick={() =>
                        handleRemoveMember(
                           membership.project_team_membership_id
                        )
                     }
                     disabled={loading}
                  >
                     <X className="w-4 h-4" />
                  </Button>
               </div>
            ))}
         </div>
      </div>
   );
}
