"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProjectTask } from "@/types/project";

interface TasksGridProps {
   tasks: ProjectTask[];
   onEdit: (task: ProjectTask) => void;
   onDelete: (task: ProjectTask) => void;
}

function formatDate(dateString: string): string {
   try {
      // First try to parse as ISO string
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
         return date.toLocaleDateString();
      }

      // If that fails, try to parse as YYYY-MM-DD
      const [year, month, day] = dateString.split("-").map(Number);
      if (year && month && day) {
         const date = new Date(year, month - 1, day);
         return date.toLocaleDateString();
      }

      return dateString;
   } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
   }
}

export function TasksGrid({ tasks, onEdit, onDelete }: TasksGridProps) {
   const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
         case "not_started":
            return "bg-slate-100 text-slate-800";
         case "in_progress":
            return "bg-blue-100 text-blue-800";
         case "completed":
            return "bg-green-100 text-green-800";
         case "blocked":
            return "bg-red-100 text-red-800";
         default:
            return "bg-gray-100 text-gray-800";
      }
   };

   if (tasks.length === 0) {
      return (
         <Card className="p-6">
            <div className="text-center text-slate-500">
               <p className="text-lg font-medium">No tasks found</p>
               <p className="mt-1">Create your first task to get started.</p>
            </div>
         </Card>
      );
   }

   return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
         <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
               <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                     <th className="px-4 py-3 text-sm font-medium text-gray-500">
                        Task Name
                     </th>
                     <th className="px-4 py-3 text-sm font-medium text-gray-500">
                        Status
                     </th>
                     <th className="px-4 py-3 text-sm font-medium text-gray-500">
                        Start Date
                     </th>
                     <th className="px-4 py-3 text-sm font-medium text-gray-500">
                        Due Date
                     </th>
                     <th className="px-4 py-3 text-sm font-medium text-gray-500">
                        Hours (Actual/Est)
                     </th>
                     <th className="px-4 py-3 text-sm font-medium text-gray-500">
                        Actions
                     </th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                  {tasks.map(task => (
                     <tr
                        key={task.project_task_id}
                        className="hover:bg-gray-50"
                     >
                        <td className="px-4 py-3">
                           <div>
                              <div className="font-medium text-gray-900">
                                 {task.project_task_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                 {task.project_task_description}
                              </div>
                           </div>
                        </td>
                        <td className="px-4 py-3">
                           <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                 task.project_task_status
                              )}`}
                           >
                              {task.project_task_status}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                           {formatDate(task.project_task_start_date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                           {formatDate(task.project_task_due_date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                           {task.actual_hours} / {task.estimated_hours}
                        </td>
                        <td className="px-4 py-3">
                           <div className="flex gap-2">
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => onEdit(task)}
                              >
                                 Edit
                              </Button>
                              <Button
                                 variant="outline"
                                 size="sm"
                                 className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                 onClick={() => onDelete(task)}
                              >
                                 Delete
                              </Button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}
