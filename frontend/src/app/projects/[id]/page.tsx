"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Project } from "@/types/project";
import { ProjectStatus } from "@/types/base";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProjectModal } from "../components/ProjectModal";

export default function ProjectPage({
   params
}: {
   params: Promise<{ id: string }>;
}) {
   const { id } = use(params);
   const [project, setProject] = useState<Project | null>(null);
   const [loading, setLoading] = useState(true);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const supabase = createClient();

   useEffect(() => {
      fetchProject();
   }, [id]);

   async function fetchProject() {
      setLoading(true);
      setError(null);

      try {
         const { data, error } = await supabase
            .from("projects")
            .select(
               `
               project_id,
               client_id,
               project_name,
               project_status,
               project_start_date,
               project_due_date,
               created_at,
               last_updated_at
            `
            )
            .eq("project_id", id)
            .single();

         if (error) throw error;
         if (data) {
            setProject(data as Project);
         }
      } catch (err) {
         console.error("Error fetching project:", err);
         setError("Failed to load project details. Please try again later.");
      } finally {
         setLoading(false);
      }
   }

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
                        <div>
                           <label className="text-sm font-medium">
                              Created
                           </label>
                           <p>
                              {new Date(
                                 project.created_at
                              ).toLocaleDateString()}
                           </p>
                        </div>
                        <div>
                           <label className="text-sm font-medium">
                              Last Updated
                           </label>
                           <p>
                              {new Date(
                                 project.last_updated_at
                              ).toLocaleDateString()}
                           </p>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Placeholder for future sections */}
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

            {/* Placeholder for Tasks, Team, and other sections */}
            <Card>
               <CardHeader>
                  <CardTitle>Project Tasks</CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-muted-foreground">
                     Project tasks will be displayed here
                  </p>
               </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Team Members</CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-muted-foreground">
                     Team member assignments will be displayed here
                  </p>
               </CardContent>
            </Card>

            <ProjectModal
               project={project}
               isOpen={isEditModalOpen}
               onClose={() => setIsEditModalOpen(false)}
               onSuccess={fetchProject}
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
