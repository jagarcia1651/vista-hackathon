"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/shared/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectPhase } from "@/types/project";
import { phaseService } from "../services/phaseService";
import { TeamAssignmentSection } from "./TeamAssignmentSection";
import { teamService } from "../services/teamService";

type PhaseStatus =
   | "Planned"
   | "In Progress"
   | "Completed"
   | "Blocked"
   | "Cancelled";

const PHASE_STATUSES: PhaseStatus[] = [
   "Planned",
   "In Progress",
   "Completed",
   "Blocked",
   "Cancelled"
];

interface PhaseModalProps {
   projectId: string;
   phase?: ProjectPhase;
   isOpen: boolean;
   onClose: () => void;
   onSuccess: () => void;
}

type NewPhase = Omit<
   ProjectPhase,
   "project_phase_id" | "created_at" | "last_updated_at"
>;

function formatDateForInput(dateString: string | undefined): string {
   if (!dateString) return new Date().toISOString().split("T")[0];
   try {
      return new Date(dateString).toISOString().split("T")[0];
   } catch (e) {
      console.error("Error formatting date:", e);
      return new Date().toISOString().split("T")[0];
   }
}

export function PhaseModal({
   projectId,
   phase,
   isOpen,
   onClose,
   onSuccess
}: PhaseModalProps) {
   const isEditing = !!phase;

   const [formData, setFormData] = useState<Partial<ProjectPhase>>(() => {
      if (phase) {
         return {
            ...phase,
            project_phase_start_date: formatDateForInput(
               phase.project_phase_start_date
            ),
            project_phase_due_date: formatDateForInput(
               phase.project_phase_due_date
            )
         };
      }
      return {
         project_id: projectId,
         project_phase_status: "Planned",
         project_phase_start_date: formatDateForInput(new Date().toISOString()),
         project_phase_due_date: formatDateForInput(
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks from now
         )
      };
   });

   // Reset form data when phase changes or modal opens/closes
   useEffect(() => {
      if (isOpen) {
         if (phase) {
            setFormData({
               ...phase,
               project_phase_start_date: formatDateForInput(
                  phase.project_phase_start_date
               ),
               project_phase_due_date: formatDateForInput(
                  phase.project_phase_due_date
               )
            });
         } else {
            setFormData({
               project_id: projectId,
               project_phase_status: "Planned",
               project_phase_start_date: formatDateForInput(
                  new Date().toISOString()
               ),
               project_phase_due_date: formatDateForInput(
                  new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
               )
            });
         }
      }
   }, [phase, isOpen, projectId]);

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const validateDates = () => {
      const startDate = new Date(formData.project_phase_start_date!);
      const dueDate = new Date(formData.project_phase_due_date!);

      if (dueDate < startDate) {
         setError("Due date must be after start date");
         return false;
      }
      return true;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateDates()) {
         return;
      }

      setLoading(true);
      setError(null);

      try {
         if (isEditing && phase) {
            // Only include fields that exist in the project_phases table
            const phaseUpdate = {
               project_phase_name: formData.project_phase_name,
               project_phase_description: formData.project_phase_description,
               project_phase_status: formData.project_phase_status,
               project_phase_start_date: formData.project_phase_start_date,
               project_phase_due_date: formData.project_phase_due_date
            };

            const { error: updateError } = await phaseService.updatePhase(
               phase.project_phase_id,
               phaseUpdate
            );
            if (updateError) throw updateError;
         } else {
            // Get the next phase number
            const nextPhaseNumber = await phaseService.getNextPhaseNumber(
               projectId
            );

            const newPhase: NewPhase = {
               project_id: projectId,
               project_phase_number: nextPhaseNumber,
               project_phase_name: formData.project_phase_name!,
               project_phase_description: formData.project_phase_description!,
               project_phase_status: formData.project_phase_status!,
               project_phase_start_date: formData.project_phase_start_date!,
               project_phase_due_date: formData.project_phase_due_date!
            };

            const { data: createdPhase, error: createError } =
               await phaseService.createPhase(newPhase);
            if (createError) throw createError;

            // Create an empty team for the phase if it was created successfully
            if (createdPhase) {
               const { error: teamError } = await teamService.createTeam({
                  project_id: projectId,
                  project_phase_id: createdPhase.project_phase_id,
                  project_team_name: `${createdPhase.project_phase_name} Team`
               });
               if (teamError) {
                  console.error("Error creating team:", teamError);
                  // Don't throw here - we still created the phase successfully
               }
            }
         }

         onSuccess();
         onClose();
      } catch (err) {
         console.error("Error saving phase:", err);
         setError("Failed to save phase. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   const handleInputChange = (
      e: React.ChangeEvent<
         HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
   ) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));

      // Clear date validation error when dates change
      if (name.includes("date")) {
         setError(null);
      }
   };

   return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl" stretch>
         <Card>
            <CardHeader>
               <CardTitle>
                  {isEditing ? "Edit Phase" : "Create New Phase"}
               </CardTitle>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                     <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                     </div>
                  )}

                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium">
                           Phase Name
                        </label>
                        <Input
                           name="project_phase_name"
                           value={formData.project_phase_name || ""}
                           onChange={handleInputChange}
                           placeholder="Enter phase name"
                           required
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-medium">
                           Description
                        </label>
                        <Textarea
                           name="project_phase_description"
                           value={formData.project_phase_description || ""}
                           onChange={handleInputChange}
                           placeholder="Enter phase description"
                           required
                        />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-sm font-medium">Status</label>
                           <select
                              name="project_phase_status"
                              value={formData.project_phase_status}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border rounded-md"
                              required
                           >
                              {PHASE_STATUSES.map(status => (
                                 <option key={status} value={status}>
                                    {status}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-sm font-medium">
                                 Start Date
                              </label>
                              <Input
                                 type="date"
                                 name="project_phase_start_date"
                                 value={formData.project_phase_start_date || ""}
                                 onChange={handleInputChange}
                                 required
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-sm font-medium">
                                 Due Date
                              </label>
                              <Input
                                 type="date"
                                 name="project_phase_due_date"
                                 value={formData.project_phase_due_date || ""}
                                 onChange={handleInputChange}
                                 required
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <h3 className="text-sm font-medium">Team Assignment</h3>
                     <TeamAssignmentSection
                        projectId={projectId}
                        phaseId={phase?.project_phase_id}
                     />
                  </div>

                  <div className="flex justify-end gap-3">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                     >
                        Cancel
                     </Button>
                     <Button type="submit" disabled={loading}>
                        {loading
                           ? "Saving..."
                           : isEditing
                           ? "Update Phase"
                           : "Create Phase"}
                     </Button>
                  </div>
               </form>
            </CardContent>
         </Card>
      </Modal>
   );
}
