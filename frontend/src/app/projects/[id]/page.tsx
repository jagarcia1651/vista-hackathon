"use client";

import { useEffect, useState, use } from "react";
import type {
   Project,
   ProjectTask,
   ProjectPhase,
   ProjectPhaseWithTasks
} from "@/types/project";
import { ProjectStatus } from "@/types/base";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProjectModal } from "../components/ProjectModal";
import { ProjectPhases } from "../components/ProjectPhases";
import { PhaseModal } from "../components/PhaseModal";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import { phaseService } from "../services/phaseService";

export default function ProjectPage({
   params
}: {
   params: Promise<{ id: string }>;
}) {
   const { id } = use(params);
   const [project, setProject] = useState<Project | null>(null);
   const [phases, setPhases] = useState<ProjectPhaseWithTasks[]>([]);
   const [loading, setLoading] = useState(true);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
   const [selectedPhase, setSelectedPhase] = useState<
      ProjectPhase | undefined
   >();
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      fetchProject();
      fetchPhases();
   }, [id]);

   async function fetchProject() {
      setLoading(true);
      setError(null);

      const { data, error } = await projectService.getProjectById(id);

      if (error) {
         console.error("Error fetching project:", error);
         setError("Failed to load project details. Please try again later.");
      } else if (data) {
         setProject(data);
      }

      setLoading(false);
   }

   async function fetchPhases() {
      const { data: phasesData, error: phasesError } =
         await phaseService.getProjectPhases(id);
      const { data: tasksData, error: tasksError } =
         await taskService.getProjectTasks(id);

      if (phasesError) {
         console.error("Error fetching phases:", phasesError);
         return;
      }

      if (tasksError) {
         console.error("Error fetching tasks:", tasksError);
         return;
      }

      // Map tasks to their respective phases
      const phasesWithTasks = (phasesData || []).map((phase: ProjectPhase) => ({
         ...phase,
         tasks: (tasksData || []).filter(
            (task: ProjectTask) =>
               task.project_phase_id === phase.project_phase_id
         ),
         assignedStaffers: [], // This will be populated when we implement team assignments
         progress: 0 // We'll calculate this below
      }));

      setPhases(phasesWithTasks);
   }

   const handleAddPhase = () => {
      setSelectedPhase(undefined);
      setIsPhaseModalOpen(true);
   };

   const handlePhaseSuccess = () => {
      setIsPhaseModalOpen(false);
      setSelectedPhase(undefined);
      fetchPhases();
   };

   if (loading) {
      return null;
   }

   if (error || !project) {
      return (
         <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
               <div className="text-center">
                  <h2 className="text-xl font-semibold mb-4">
                     {error || "Project not found"}
                  </h2>
                  <Link href="/projects">
                     <Button>Back to Projects</Button>
                  </Link>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-slate-50">
         <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Link href="/projects">
                     <Button variant="outline" className="mr-4">
                        Back to Projects
                     </Button>
                  </Link>
                  <h1 className="text-2xl font-semibold">
                     {project.project_name}
                  </h1>
               </div>
               <div className="flex items-center gap-4">
                  <span
                     className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        project.project_status as ProjectStatus
                     )}`}
                  >
                     {project.project_status}
                  </span>
                  <Button onClick={() => setIsEditModalOpen(true)}>
                     Edit Project
                  </Button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                  <CardHeader>
                     <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        <div>
                           <label className="text-sm font-medium">
                              Start Date
                           </label>
                           <p>
                              {new Date(
                                 project.project_start_date
                              ).toLocaleDateString()}
                           </p>
                        </div>
                        <div>
                           <label className="text-sm font-medium">
                              Due Date
                           </label>
                           <p>
                              {new Date(
                                 project.project_due_date
                              ).toLocaleDateString()}
                           </p>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle>Project Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-muted-foreground">
                        Project metrics and KPIs will be displayed here
                     </p>
                  </CardContent>
               </Card>
            </div>

            {/* Project Phases */}
            <ProjectPhases
               projectId={id}
               phases={phases}
               onAddPhase={handleAddPhase}
            />

            <ProjectModal
               project={project}
               isOpen={isEditModalOpen}
               onClose={() => setIsEditModalOpen(false)}
               onSuccess={fetchProject}
            />

            <PhaseModal
               projectId={id}
               phase={selectedPhase}
               isOpen={isPhaseModalOpen}
               onClose={() => {
                  setIsPhaseModalOpen(false);
                  setSelectedPhase(undefined);
               }}
               onSuccess={handlePhaseSuccess}
            />
         </div>
      </div>
   );
}

function getStatusColor(status: ProjectStatus): string {
   switch (status) {
      case ProjectStatus.RFP:
         return "bg-purple-100 text-purple-800";
      case ProjectStatus.QUOTED:
         return "bg-blue-100 text-blue-800";
      case ProjectStatus.LOST:
         return "bg-red-100 text-red-800";
      case ProjectStatus.PENDING:
         return "bg-yellow-100 text-yellow-800";
      case ProjectStatus.IN_PROGRESS_ON_TRACK:
         return "bg-green-100 text-green-800";
      case ProjectStatus.IN_PROGRESS_OFF_TRACK:
         return "bg-orange-100 text-orange-800";
      case ProjectStatus.COMPLETED:
         return "bg-teal-100 text-teal-800";
      case ProjectStatus.CANCELLED:
         return "bg-gray-100 text-gray-800";
      default:
         return "bg-gray-100 text-gray-800";
   }
}
