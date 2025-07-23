"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { ProjectTask, StafferAssignment } from "@/types/project";
import type { Staffer } from "@/types/staffer";
import { assignmentService } from "../services/assignmentService";
import { taskService } from "../services/taskService";
import { teamService } from "../services/teamService";
import { X } from "lucide-react";
import { TaskStatus } from "@/types/base";

interface TaskAssignmentSectionProps {
   projectId: string;
   phaseId?: string;
}

interface TeamMembership {
   project_team_membership_id: string;
   staffer: Staffer;
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

interface TaskWithAssignments extends ProjectTask {
   staffer_assignments: (StafferAssignment & {
      staffer: Staffer;
   })[];
}

export function TaskAssignmentSection({
   projectId,
   phaseId
}: TaskAssignmentSectionProps) {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [tasks, setTasks] = useState<TaskWithAssignments[]>([]);
   const [availableStaffers, setAvailableStaffers] = useState<Staffer[]>([]);
   const [selectedStaffers, setSelectedStaffers] = useState<
      Record<string, string>
   >({});

   useEffect(() => {
      loadTasks();
      loadAvailableStaffers();
   }, [projectId, phaseId]);

   const loadTasks = async () => {
      try {
         const { data: tasksData, error: tasksError } =
            await taskService.getProjectTasks(projectId);
         if (tasksError) throw tasksError;

         const tasksWithAssignments = await Promise.all(
            (tasksData || []).map(async task => {
               const { data: assignmentsData } =
                  await assignmentService.getTaskAssignments(
                     task.project_task_id
                  );
               return {
                  ...task,
                  staffer_assignments: assignmentsData || []
               } as TaskWithAssignments;
            })
         );

         setTasks(tasksWithAssignments);
      } catch (err) {
         console.error("Error loading tasks:", err);
         setError("Failed to load tasks");
      }
   };

   const loadAvailableStaffers = async () => {
      try {
         let staffers: Staffer[] = [];

         if (phaseId) {
            // If we have a phase, get staffers from the phase's team
            const { data: teamData } = await teamService.getTeamByPhase(
               phaseId
            );
            if (teamData?.project_team_memberships) {
               staffers = (
                  teamData.project_team_memberships as TeamMembership[]
               )
                  .map(membership => membership.staffer)
                  .filter((staffer): staffer is Staffer => !!staffer);
            }
         } else {
            // Otherwise, get all available staffers
            const { data } = await teamService.getAvailableStaffers();
            if (data) {
               const rawStaffers = data as unknown as StafferResponse[];
               staffers = rawStaffers.map(rawStaffer => ({
                  id: rawStaffer.id,
                  first_name: rawStaffer.first_name,
                  last_name: rawStaffer.last_name,
                  email: rawStaffer.email,
                  title: rawStaffer.title,
                  capacity: rawStaffer.capacity,
                  time_zone: rawStaffer.time_zone || undefined,
                  created_at: new Date().toISOString(),
                  last_updated_at: new Date().toISOString(),
                  seniority: rawStaffer.seniority || undefined
               }));
            }
         }

         setAvailableStaffers(staffers);
      } catch (err) {
         console.error("Error loading staffers:", err);
      }
   };

   const handleAssignStaffer = async (taskId: string) => {
      const stafferId = selectedStaffers[taskId];
      if (!stafferId) return;

      setLoading(true);
      setError(null);

      try {
         const { error } = await assignmentService.assignStaffer({
            staffer_id: stafferId,
            project_task_id: taskId
         });

         if (error) throw error;

         // Clear the selection and reload tasks
         setSelectedStaffers(prev => {
            const next = { ...prev };
            delete next[taskId];
            return next;
         });
         loadTasks();
      } catch (err) {
         console.error("Error assigning staffer:", err);
         setError("Failed to assign staffer");
      } finally {
         setLoading(false);
      }
   };

   const handleRemoveAssignment = async (assignmentId: string) => {
      setLoading(true);
      setError(null);

      try {
         const { error } = await assignmentService.removeAssignment(
            assignmentId
         );
         if (error) throw error;
         loadTasks();
      } catch (err) {
         console.error("Error removing assignment:", err);
         setError("Failed to remove assignment");
      } finally {
         setLoading(false);
      }
   };

   const getStatusColor = (status: TaskStatus) => {
      switch (status) {
         case TaskStatus.COMPLETED:
            return "bg-green-100 text-green-800";
         case TaskStatus.IN_PROGRESS_ON_TRACK:
            return "bg-blue-100 text-blue-800";
         case TaskStatus.IN_PROGRESS_OFF_TRACK:
            return "bg-orange-100 text-orange-800";
         case TaskStatus.CANCELLED:
            return "bg-red-100 text-red-800";
         default:
            return "bg-gray-100 text-gray-800";
      }
   };

   if (tasks.length === 0) {
      return (
         <div className="text-sm text-gray-500 italic">
            No tasks available for assignment
         </div>
      );
   }

   return (
      <div className="space-y-4">
         {error && <div className="text-sm text-red-600">{error}</div>}

         <div className="space-y-4">
            {tasks.map(task => (
               <div
                  key={task.project_task_id}
                  className="border rounded-lg p-4 space-y-3"
               >
                  <div className="flex items-center justify-between">
                     <div>
                        <h4 className="font-medium">
                           {task.project_task_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                           {task.project_task_description}
                        </p>
                     </div>
                     <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                           task.project_task_status as TaskStatus
                        )}`}
                     >
                        {task.project_task_status}
                     </span>
                  </div>

                  <div className="flex items-center justify-between">
                     <div className="flex flex-wrap gap-2">
                        {task.staffer_assignments.map(assignment => (
                           <div
                              key={assignment.staffer_assignment_id}
                              className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-md text-sm"
                           >
                              <span>
                                 {assignment.staffer.first_name}{" "}
                                 {assignment.staffer.last_name}
                              </span>
                              <Button
                                 size="sm"
                                 variant="ghost"
                                 className="h-6 w-6 p-0"
                                 onClick={() =>
                                    handleRemoveAssignment(
                                       assignment.staffer_assignment_id
                                    )
                                 }
                                 disabled={loading}
                              >
                                 <X className="h-4 w-4" />
                              </Button>
                           </div>
                        ))}
                     </div>

                     <div className="flex items-center gap-2">
                        <select
                           className="px-3 py-1 border rounded-md text-sm"
                           value={selectedStaffers[task.project_task_id] || ""}
                           onChange={e =>
                              setSelectedStaffers(prev => ({
                                 ...prev,
                                 [task.project_task_id]: e.target.value
                              }))
                           }
                        >
                           <option value="">Assign staffer...</option>
                           {availableStaffers
                              .filter(
                                 staffer =>
                                    !task.staffer_assignments.some(
                                       assignment =>
                                          assignment.staffer.id === staffer.id
                                    )
                              )
                              .map(staffer => (
                                 <option key={staffer.id} value={staffer.id}>
                                    {staffer.first_name} {staffer.last_name}
                                 </option>
                              ))}
                        </select>
                        <Button
                           size="sm"
                           onClick={() =>
                              handleAssignStaffer(task.project_task_id)
                           }
                           disabled={
                              !selectedStaffers[task.project_task_id] || loading
                           }
                        >
                           Assign
                        </Button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
