import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/project";
import { ProjectStatus } from "@/types/base";
import { useRouter } from "next/navigation";

interface ProjectsGridProps {
   projects: Project[];
   onEdit: (project: Project) => void;
}

export function ProjectsGrid({ projects, onEdit }: ProjectsGridProps) {
   if (!projects.length) {
      return (
         <Card className="p-6">
            <div className="text-center">
               <h3 className="text-lg font-medium">No projects found</h3>
               <p className="text-sm text-muted-foreground">
                  Try adjusting your search or create a new project
               </p>
            </div>
         </Card>
      );
   }

   return (
      <Card>
         <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
               {projects.length} project{projects.length !== 1 ? "s" : ""} found
            </CardDescription>
         </CardHeader>
         <CardContent>
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-900">
                           Project Name
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">
                           Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">
                           Start Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">
                           Due Date
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-slate-900">
                           Actions
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     {projects.map(project => (
                        <ProjectRow
                           key={project.project_id}
                           project={project}
                           onEdit={onEdit}
                        />
                     ))}
                  </tbody>
               </table>
            </div>
         </CardContent>
      </Card>
   );
}

interface ProjectRowProps {
   project: Project;
   onEdit: (project: Project) => void;
}

function ProjectRow({ project, onEdit }: ProjectRowProps) {
   const router = useRouter();

   return (
      <tr
         className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
         onClick={() => router.push(`/projects/${project.project_id}`)}
      >
         <td className="py-3 px-4">
            <div className="font-medium text-slate-900">
               {project.project_name}
            </div>
         </td>
         <td className="py-3 px-4">
            <span
               className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${getStatusColor(
                  project.project_status as ProjectStatus
               )}`}
            >
               {project.project_status}
            </span>
         </td>
         <td className="py-3 px-4">
            <div className="text-slate-600">
               {new Date(project.project_start_date).toLocaleDateString()}
            </div>
         </td>
         <td className="py-3 px-4">
            <div className="text-slate-600">
               {new Date(project.project_due_date).toLocaleDateString()}
            </div>
         </td>
         <td className="py-3 px-4">
            <div className="flex justify-end space-x-2">
               <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                     e.stopPropagation();
                     onEdit(project);
                  }}
               >
                  Edit
               </Button>
            </div>
         </td>
      </tr>
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
