"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
   ArrowLeft,
   Users,
   CheckCircle2,
   Circle,
   Plus,
   Edit
} from "lucide-react";
import type { ProjectPhaseWithTasks, ProjectTask } from "@/types/project";
import type { Staffer } from "@/types/staffer";
import { phaseService } from "@/app/projects/services/phaseService";
import { taskService } from "@/app/projects/services/taskService";
import { teamService } from "@/app/projects/services/teamService";
import { TasksGrid } from "@/app/projects/components/TasksGrid";
import { TaskModal } from "@/app/projects/components/TaskModal";
import { PhaseModal } from "@/app/projects/components/PhaseModal";
import { TaskStatus } from "@/types/base";

type PageParams = {
   id: string;
   phaseId: string;
};

export default function PhaseDetailPage({
   params
}: {
   params: Promise<PageParams>;
}) {
   const router = useRouter();
   const unwrappedParams = use<PageParams>(params);
   const [phase, setPhase] = useState<ProjectPhaseWithTasks | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
   const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
   const [selectedTask, setSelectedTask] = useState<ProjectTask | undefined>();

   const fetchPhaseDetails = async () => {
      try {
         // Fetch phase details directly by ID
         const { data: phaseData, error: phaseError } =
            await phaseService.getPhaseById(unwrappedParams.phaseId);
         if (phaseError) throw new Error(String(phaseError));
         if (!phaseData) throw new Error("Phase not found");

         // Fetch tasks for this phase with assignments
         const { data: tasksData, error: tasksError } =
            await taskService.getPhaseTasksWithAssignments(
               unwrappedParams.phaseId
            );
         if (tasksError) throw new Error(String(tasksError));

         // Fetch team members for this phase
         const { data: teamData, error: teamError } =
            await teamService.getTeamByPhase(unwrappedParams.phaseId);

         // Extract staffers from team data if it exists
         const teamMembers =
            teamData?.project_team_memberships
               ?.map((membership: { staffer: Staffer }) => membership.staffer)
               .filter(Boolean) || [];

         setPhase({
            ...phaseData,
            tasks: tasksData || [],
            assignedStaffers: teamMembers,
            progress: calculateProgress(tasksData || [])
         });
         setError(null);
      } catch (error) {
         console.error("Error fetching phase details:", error);
         setError(error instanceof Error ? error.message : "An error occurred");
         setPhase(null);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchPhaseDetails();
   }, [unwrappedParams.id, unwrappedParams.phaseId]);

   const calculateProgress = (tasks: any[]) => {
      if (!tasks || tasks.length === 0) return 0;
      const completedTasks = tasks.filter(
         task => task.project_task_status === TaskStatus.COMPLETED
      ).length;
      return Math.round((completedTasks / tasks.length) * 100);
   };

   const handleNavigateToProjects = () => {
      router.push("/projects");
   };

   const handleNavigateToProject = () => {
      router.push(`/projects/${phase?.project_id || unwrappedParams.id}`);
   };

   const handleAddTask = () => {
      setSelectedTask(undefined);
      setIsTaskModalOpen(true);
   };

   const handleEditTask = (task: ProjectTask) => {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
   };

   const handleDeleteTask = async (task: ProjectTask) => {
      try {
         // Add confirmation dialog here if needed
         await taskService.deleteTask(task.project_task_id);
         // Refresh phase details to get updated task list
         fetchPhaseDetails();
      } catch (error) {
         console.error("Error deleting task:", error);
      }
   };

   const handleTaskSave = async (taskData: any) => {
      try {
         if (selectedTask) {
            await taskService.updateTask({
               ...taskData,
               project_task_id: selectedTask.project_task_id
            });
         } else {
            await taskService.createTask({
               ...taskData,
               project_id: unwrappedParams.id,
               project_phase_id: unwrappedParams.phaseId
            });
         }
         setIsTaskModalOpen(false);
         fetchPhaseDetails();
      } catch (error) {
         console.error("Error saving task:", error);
      }
   };

   const handleEditPhase = () => {
      setIsPhaseModalOpen(true);
   };

   const handlePhaseSave = async () => {
      setIsPhaseModalOpen(false);
      await fetchPhaseDetails(); // Refresh the phase data
   };

   if (loading) {
      return <div>Loading...</div>;
   }

   if (error || !phase) {
      return (
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div className="space-x-4">
                  <Button variant="outline" onClick={handleNavigateToProjects}>
                     Return to Projects
                  </Button>
                  <Button variant="outline" onClick={handleNavigateToProject}>
                     Return to Project
                  </Button>
               </div>
            </div>
            <Card>
               <CardContent className="py-8">
                  <div className="text-center text-gray-500">
                     <h2 className="text-xl font-semibold mb-2">
                        Error Loading Phase
                     </h2>
                     <p>{error || "Phase not found"}</p>
                     <p className="mt-4">Please check the URL and try again</p>
                  </div>
               </CardContent>
            </Card>
         </div>
      );
   }

   return (
      <div className="space-y-6 p-6">
         {/* Navigation */}
         <div className="flex items-center justify-between">
            <div className="space-x-4">
               <Button variant="outline" onClick={handleNavigateToProjects}>
                  Return to Projects
               </Button>
               <Button variant="outline" onClick={handleNavigateToProject}>
                  Return to Project
               </Button>
            </div>
         </div>

         {/* Phase Header */}
         <div className="flex items-start justify-between">
            <div>
               <h1 className="text-3xl font-bold mb-2">
                  {phase.project_phase_name}
               </h1>
               <p className="text-gray-600">
                  {phase.project_phase_description}
               </p>
            </div>
            <div className="flex flex-col items-end gap-2">
               <Button variant="outline" onClick={handleEditPhase}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Phase
               </Button>
               <div className="text-sm text-gray-600">
                  {new Date(
                     phase.project_phase_start_date
                  ).toLocaleDateString()}{" "}
                  -{" "}
                  {new Date(phase.project_phase_due_date).toLocaleDateString()}
               </div>
               <div>
                  <span
                     className={`px-3 py-1 rounded-full text-sm font-medium ${
                        phase.project_phase_status === "completed"
                           ? "bg-black text-white"
                           : phase.project_phase_status === "in_progress"
                           ? "bg-gray-100 text-gray-800"
                           : "bg-gray-50 text-gray-800"
                     }`}
                  >
                     {phase.project_phase_status}
                  </span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Section */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Users className="w-5 h-5" />
                     Phase Team
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  {phase.assignedStaffers &&
                  phase.assignedStaffers.length > 0 ? (
                     <div className="space-y-4">
                        {phase.assignedStaffers.map((staffer: Staffer) => (
                           <div
                              key={staffer.id}
                              className="flex items-center justify-between"
                           >
                              <div>
                                 <div className="font-medium">{`${staffer.first_name} ${staffer.last_name}`}</div>
                                 <div className="text-sm text-gray-600">
                                    {staffer.title}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center text-gray-500 py-4">
                        No team members assigned
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* Progress Section */}
            <Card>
               <CardHeader>
                  <CardTitle>Progress</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     <div>
                        <div className="text-sm font-medium mb-2">
                           Overall Progress
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                           <div
                              className="h-full bg-black rounded-full"
                              style={{ width: `${phase.progress}%` }}
                           />
                        </div>
                        <div className="text-sm font-medium mt-1 text-right">
                           {phase.progress}%
                        </div>
                     </div>
                     <div>
                        <div className="text-sm font-medium mb-2">
                           Task Completion
                        </div>
                        <div className="text-2xl font-bold">
                           {
                              phase.tasks.filter(
                                 t =>
                                    t.project_task_status ===
                                    TaskStatus.COMPLETED
                              ).length
                           }{" "}
                           / {phase.tasks.length}
                        </div>
                        <div className="text-sm text-gray-600">
                           tasks completed
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Hours Section */}
            <Card>
               <CardHeader>
                  <CardTitle>Hours</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     <div>
                        <div className="text-sm font-medium mb-2">
                           Estimated Hours
                        </div>
                        <div className="text-2xl font-bold">
                           {phase.tasks.reduce(
                              (sum, task) => sum + task.estimated_hours,
                              0
                           )}
                        </div>
                     </div>
                     <div>
                        <div className="text-sm font-medium mb-2">
                           Actual Hours
                        </div>
                        <div className="text-2xl font-bold">
                           {phase.tasks.reduce(
                              (sum, task) => sum + (task.actual_hours || 0),
                              0
                           )}
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Tasks Section */}
         <div className="space-y-4">
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-semibold">Tasks</h2>
               <Button onClick={handleAddTask}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
               </Button>
            </div>
            <TasksGrid
               tasks={phase.tasks}
               onEdit={handleEditTask}
               onDelete={handleDeleteTask}
            />
         </div>

         {/* Task Modal */}
         <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onSuccess={handleTaskSave}
            task={selectedTask}
            projectId={unwrappedParams.id}
         />

         {/* Phase Modal */}
         <PhaseModal
            projectId={unwrappedParams.id}
            phase={phase}
            isOpen={isPhaseModalOpen}
            onClose={() => setIsPhaseModalOpen(false)}
            onSuccess={handlePhaseSave}
         />
      </div>
   );
}
