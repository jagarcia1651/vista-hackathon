"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ProjectPhaseWithTasks } from "@/types/project";
import { TaskStatus } from "@/types/base";

interface ProjectPhasesProps {
   projectId: string;
   phases: ProjectPhaseWithTasks[];
   onAddPhase: () => void;
}

export function ProjectPhases({
   projectId,
   phases,
   onAddPhase
}: ProjectPhasesProps) {
   const router = useRouter();

   const getStatusBadge = (status: string) => {
      switch (status.toLowerCase()) {
         case TaskStatus.COMPLETED:
            return "bg-black text-white";
         case TaskStatus.IN_PROGRESS_ON_TRACK:
            return "bg-blue-100 text-blue-800";
         case TaskStatus.IN_PROGRESS_OFF_TRACK:
            return "bg-red-100 text-red-800";
         case TaskStatus.TODO:
            return "bg-gray-100 text-gray-800";
         default:
            return "bg-gray-50 text-gray-800";
      }
   };

   const getStatusLabel = (status: string) => {
      switch (status.toLowerCase()) {
         case TaskStatus.COMPLETED:
            return "Completed";
         case TaskStatus.IN_PROGRESS_ON_TRACK:
            return "In Progress - On Track";
         case TaskStatus.IN_PROGRESS_OFF_TRACK:
            return "In Progress - Off Track";
         case TaskStatus.CANCELLED:
            return "Cancelled";
         default:
            return "To Do";
      }
   };

   const getTaskIcon = (completed: boolean) => {
      return completed ? (
         <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : (
         <Circle className="w-5 h-5 text-gray-300" />
      );
   };

   if (phases.length === 0) {
      return (
         <Card>
            <CardContent className="pt-6">
               <div className="text-center text-slate-500 py-8">
                  <p className="text-lg font-medium">No phases defined</p>
                  <p className="mt-1">Add project phases to track progress</p>
                  <Button onClick={onAddPhase} className="mt-4">
                     <Plus className="w-4 h-4 mr-2" />
                     Add Phase
                  </Button>
               </div>
            </CardContent>
         </Card>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Project Phases</h2>
            <Button onClick={onAddPhase}>
               <Plus className="w-4 h-4 mr-2" />
               Add Phase
            </Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {phases.map(phase => (
               <Card
                  key={phase.project_phase_id}
                  className="relative cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() =>
                     router.push(
                        `/projects/${projectId}/phases/${phase.project_phase_id}`
                     )
                  }
               >
                  <CardContent className="pt-6">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <h3 className="text-2xl font-semibold mb-1">
                              {phase.project_phase_name}
                           </h3>
                           <div className="flex items-center gap-2">
                              <span
                                 className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                                    phase.project_phase_status
                                 )}`}
                              >
                                 {getStatusLabel(phase.project_phase_status)}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="text-sm text-gray-600 mb-4">
                        {new Date(
                           phase.project_phase_start_date
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                           phase.project_phase_due_date
                        ).toLocaleDateString()}
                     </div>

                     <div className="mb-4">
                        <div className="flex justify-between items-center text-sm font-medium mb-2">
                           <span>Progress</span>
                           <span>{phase.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                           <div
                              className="h-full bg-black rounded-full"
                              style={{ width: `${phase.progress}%` }}
                           />
                        </div>
                     </div>

                     <div className="space-y-4 mb-6">
                        {phase.tasks.length > 0 ? (
                           <div className="space-y-2">
                              {phase.tasks.slice(0, 3).map(task => (
                                 <div
                                    key={task.project_task_id}
                                    className="flex items-center gap-2"
                                 >
                                    {getTaskIcon(
                                       task.project_task_status ===
                                          TaskStatus.COMPLETED
                                    )}
                                    <div className="flex-1 min-w-0">
                                       <div
                                          className={`text-sm truncate ${
                                             task.project_task_status ===
                                             "completed"
                                                ? "line-through text-gray-400"
                                                : ""
                                          }`}
                                       >
                                          {task.project_task_name}
                                       </div>
                                       {task.project_task_status !==
                                          "completed" && (
                                          <div className="text-xs text-gray-500">
                                             Due{" "}
                                             {new Date(
                                                task.project_task_due_date
                                             ).toLocaleDateString()}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              ))}
                              {phase.tasks.length > 3 && (
                                 <div className="text-sm text-gray-600 text-center pt-2">
                                    +{phase.tasks.length - 3} more tasks
                                 </div>
                              )}
                           </div>
                        ) : (
                           <div className="text-sm text-gray-500 text-center py-2">
                              No tasks created
                           </div>
                        )}
                     </div>

                     <div className="flex justify-between items-center text-sm text-gray-600">
                        <div>
                           <span className="font-medium">
                              {phase.tasks.reduce(
                                 (sum, task) => sum + (task.actual_hours || 0),
                                 0
                              )}
                           </span>{" "}
                           /{" "}
                           {phase.tasks.reduce(
                              (sum, task) => sum + task.estimated_hours,
                              0
                           )}{" "}
                           hours
                        </div>
                        <Button variant="outline" className="ml-auto">
                           View Details
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>
   );
}
