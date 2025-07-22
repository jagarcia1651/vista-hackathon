import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import type {
   ProjectTask,
   Project
} from "../../../../shared/schemas/typescript/project";

interface ProjectTaskWithProject extends ProjectTask {
   project: Pick<Project, "project_name">;
}

export default async function ProjectTasks() {
   const supabase = await createClient();

   // Fetch recent tasks
   const { data: tasks } = (await supabase
      .from("project_tasks")
      .select(
         `
      project_task_id,
      project_id,
      project_phase_id,
      project_task_name,
      project_task_description,
      project_task_status,
      project_task_start_date,
      project_task_due_date,
      estimated_hours,
      actual_hours,
      created_at,
      last_updated_at,
      project:projects (
        project_name
      )
    `
      )
      .order("project_task_due_date", { ascending: true })
      .limit(4)) as { data: ProjectTaskWithProject[] | null };

   const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
         case "in_progress":
            return "bg-blue-100 text-blue-800";
         case "completed":
            return "bg-green-100 text-green-800";
         case "queued":
            return "bg-gray-100 text-gray-800";
         default:
            return "bg-yellow-100 text-yellow-800";
      }
   };

   return (
      <div>
         <h2 className="text-xl font-semibold mb-4">
            Project Management Tasks
         </h2>
         <Card className="p-6">
            <div className="space-y-4">
               {tasks?.map(task => (
                  <div
                     key={task.project_task_id}
                     className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                  >
                     <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                           <span className="text-sm text-muted-foreground">
                              @projectmanager
                           </span>
                           <span className="font-medium">
                              {task.project_task_name}
                           </span>
                           <span className="text-sm text-muted-foreground">
                              {task.project.project_name}
                           </span>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <span
                           className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              task.project_task_status
                           )}`}
                        >
                           {task.project_task_status}
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         </Card>
      </div>
   );
}
