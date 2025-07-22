"use client";

import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import type { Project } from "@/types/project";
import { ProjectStatus } from "@/types/base";
import { ProjectsSearch } from "./components/ProjectsSearch";
import { ProjectsGrid } from "./components/ProjectsGrid";
import { ProjectModal } from "./components/ProjectModal";
import { ProjectsHeader } from "./components/ProjectsHeader";
import { ProjectFilters } from "./components/ProjectFilters";

export default function ProjectsPage() {
   const [projects, setProjects] = useState<Project[]>([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | null>(
      null
   );
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedProject, setSelectedProject] = useState<
      Project | undefined
   >();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const supabase = createClient();

   useEffect(() => {
      fetchProjects();
   }, []);

   async function fetchProjects() {
      setLoading(true);
      setError(null);

      try {
         const { data, error } = await supabase.from("projects").select(`
            project_id,
            client_id,
            project_name,
            project_status,
            project_start_date,
            project_due_date,
            created_at,
            last_updated_at
         `);

         if (error) throw error;

         setProjects(data as Project[]);
      } catch (err) {
         console.error("Error fetching projects:", err);
         setError("Failed to load projects. Please try again later.");
      } finally {
         setLoading(false);
      }
   }

   const openModal = (project?: Project) => {
      setSelectedProject(project);
      setIsModalOpen(true);
   };

   const closeModal = () => {
      setSelectedProject(undefined);
      setIsModalOpen(false);
   };

   const handleModalSuccess = () => {
      closeModal();
      fetchProjects();
   };

   const projectStats = projects.reduce(
      (acc, project) => {
         acc[project.project_status as ProjectStatus]++;
         return acc;
      },
      {
         [ProjectStatus.RFP]: 0,
         [ProjectStatus.QUOTED]: 0,
         [ProjectStatus.LOST]: 0,
         [ProjectStatus.PENDING]: 0,
         [ProjectStatus.IN_PROGRESS_ON_TRACK]: 0,
         [ProjectStatus.IN_PROGRESS_OFF_TRACK]: 0,
         [ProjectStatus.COMPLETED]: 0,
         [ProjectStatus.CANCELLED]: 0
      }
   );

   const filteredProjects = projects.filter(project => {
      const matchesSearch = project.project_name
         .toLowerCase()
         .includes(searchQuery.toLowerCase());
      const matchesStatus =
         !selectedStatus || project.project_status === selectedStatus;
      return matchesSearch && matchesStatus;
   });

   if (loading) {
      return (
         <div className="container mx-auto p-6">
            <div className="text-center">Loading projects...</div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-slate-50">
         <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <ProjectsHeader onCreateNew={() => openModal()}>
               <ProjectFilters
                  stats={projectStats}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
               />
            </ProjectsHeader>

            <ProjectsSearch
               searchQuery={searchQuery}
               onSearch={setSearchQuery}
            />

            {error && (
               <Card className="p-4 mb-6 bg-red-50 text-red-700">{error}</Card>
            )}

            <ProjectsGrid projects={filteredProjects} onEdit={openModal} />

            <ProjectModal
               isOpen={isModalOpen}
               onClose={closeModal}
               project={selectedProject}
               onSuccess={handleModalSuccess}
            />
         </div>
      </div>
   );
}
