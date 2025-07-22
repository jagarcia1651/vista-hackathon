"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
   ProjectTask,
   ProjectTaskWithAssignments,
   StafferAssignment
} from "@/types/project";
import type { Staffer } from "@/types/staffer";
import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/Modal";
import { taskService } from "../services/taskService";
import { assignmentService } from "../services/assignmentService";
import { teamService } from "../services/teamService";
import { X } from "lucide-react";

interface TaskModalProps {
   projectId: string;
   task?: ProjectTask;
   isOpen: boolean;
   onClose: () => void;
   onSuccess: () => void;
}

function getInitialFormData(
   projectId: string,
   task?: ProjectTask
): Partial<ProjectTask> {
   if (task) {
      return {
         ...task,
         project_task_start_date: task.project_task_start_date.split("T")[0],
         project_task_due_date: task.project_task_due_date.split("T")[0]
      };
   }
   return {
      project_id: projectId,
      project_task_name: "",
      project_task_description: "",
      project_task_status: "not_started",
      project_task_start_date: new Date().toISOString().split("T")[0],
      project_task_due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
         .toISOString()
         .split("T")[0],
      estimated_hours: 0,
      actual_hours: 0
   };
}

export function TaskModal({
   projectId,
   task,
   isOpen,
   onClose,
   onSuccess
}: TaskModalProps) {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [formData, setFormData] = useState<Partial<ProjectTask>>(() =>
      getInitialFormData(projectId, task)
   );
   const [availableStaffers, setAvailableStaffers] = useState<Staffer[]>([]);
   const [selectedStafferId, setSelectedStafferId] = useState<string>("");
   const [assignments, setAssignments] = useState<
      (StafferAssignment & { staffer: Staffer })[]
   >([]);

   // Reset form data when task changes
   useEffect(() => {
      setFormData(getInitialFormData(projectId, task));
      if (task) {
         loadAssignments();
      }
   }, [task, projectId]);

   useEffect(() => {
      loadAvailableStaffers();
   }, []);

   const loadAssignments = async () => {
      if (!task) return;

      try {
         const { data, error } = await assignmentService.getTaskAssignments(
            task.project_task_id
         );
         if (error) throw error;
         setAssignments(data || []);
      } catch (err) {
         console.error("Error loading assignments:", err);
      }
   };

   const loadAvailableStaffers = async () => {
      try {
         const { data, error } = await teamService.getAvailableStaffers();
         if (error) throw error;
         if (data) {
            const staffers: Staffer[] = (data as any[]).map(rawStaffer => ({
               id: rawStaffer.id,
               first_name: rawStaffer.first_name,
               last_name: rawStaffer.last_name,
               email: rawStaffer.email,
               title: rawStaffer.title,
               capacity: rawStaffer.capacity,
               time_zone: rawStaffer.time_zone,
               created_at: rawStaffer.created_at || new Date().toISOString(),
               last_updated_at:
                  rawStaffer.last_updated_at || new Date().toISOString(),
               user_id: rawStaffer.user_id,
               seniority: rawStaffer.seniority && {
                  seniority_name: rawStaffer.seniority.seniority_name,
                  seniority_level: rawStaffer.seniority.seniority_level
               }
            }));
            setAvailableStaffers(staffers);
         }
      } catch (err) {
         console.error("Error loading staffers:", err);
      }
   };

   const handleAssignStaffer = async () => {
      if (!task?.project_task_id || !selectedStafferId) return;

      setLoading(true);
      setError(null);

      try {
         const { error } = await assignmentService.assignStaffer({
            staffer_id: selectedStafferId,
            project_task_id: task.project_task_id
         });

         if (error) throw error;

         setSelectedStafferId("");
         loadAssignments();
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
         loadAssignments();
      } catch (err) {
         console.error("Error removing assignment:", err);
         setError("Failed to remove assignment");
      } finally {
         setLoading(false);
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
         if (task?.project_task_id) {
            // Update existing task
            const result = await taskService.updateTask({
               project_task_id: task.project_task_id,
               ...formData
            });

            if (result.error) throw new Error(result.error);
         } else {
            // Create new task
            const result = await taskService.createTask({
               project_id: projectId,
               project_task_name: formData.project_task_name!,
               project_task_description: formData.project_task_description!,
               project_task_status: formData.project_task_status!,
               project_task_start_date: formData.project_task_start_date!,
               project_task_due_date: formData.project_task_due_date!,
               estimated_hours: formData.estimated_hours!,
               actual_hours: formData.actual_hours
            });

            if (result.error) throw new Error(result.error);
         }

         onSuccess();
         onClose();
      } catch (err) {
         console.error("Error saving task:", err);
         setError(err instanceof Error ? err.message : "Failed to save task");
      } finally {
         setLoading(false);
      }
   };

   return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
         <Card>
            <CardHeader>
               <CardTitle>{task ? "Edit Task" : "Create New Task"}</CardTitle>
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
                        <label className="text-sm font-medium">Task Name</label>
                        <Input
                           value={formData.project_task_name || ""}
                           onChange={e =>
                              setFormData({
                                 ...formData,
                                 project_task_name: e.target.value
                              })
                           }
                           required
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-medium">
                           Description
                        </label>
                        <Textarea
                           value={formData.project_task_description || ""}
                           onChange={e =>
                              setFormData({
                                 ...formData,
                                 project_task_description: e.target.value
                              })
                           }
                           required
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <select
                           className="w-full px-3 py-2 border rounded-md"
                           value={formData.project_task_status || "not_started"}
                           onChange={e =>
                              setFormData({
                                 ...formData,
                                 project_task_status: e.target.value
                              })
                           }
                           required
                        >
                           <option value="not_started">Not Started</option>
                           <option value="in_progress">In Progress</option>
                           <option value="completed">Completed</option>
                           <option value="blocked">Blocked</option>
                        </select>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-sm font-medium">
                              Start Date
                           </label>
                           <Input
                              type="date"
                              value={formData.project_task_start_date || ""}
                              onChange={e =>
                                 setFormData({
                                    ...formData,
                                    project_task_start_date: e.target.value
                                 })
                              }
                              required
                           />
                        </div>

                        <div className="space-y-2">
                           <label className="text-sm font-medium">
                              Due Date
                           </label>
                           <Input
                              type="date"
                              value={formData.project_task_due_date || ""}
                              onChange={e =>
                                 setFormData({
                                    ...formData,
                                    project_task_due_date: e.target.value
                                 })
                              }
                              required
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-sm font-medium">
                              Estimated Hours
                           </label>
                           <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={formData.estimated_hours || 0}
                              onChange={e =>
                                 setFormData({
                                    ...formData,
                                    estimated_hours: parseFloat(e.target.value)
                                 })
                              }
                              required
                           />
                        </div>

                        <div className="space-y-2">
                           <label className="text-sm font-medium">
                              Actual Hours
                           </label>
                           <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={formData.actual_hours || 0}
                              onChange={e =>
                                 setFormData({
                                    ...formData,
                                    actual_hours: parseFloat(e.target.value)
                                 })
                              }
                           />
                        </div>
                     </div>
                  </div>

                  {task && (
                     <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                           <h3 className="text-sm font-medium">
                              Assigned Team Members
                           </h3>
                           <div className="flex items-center gap-2">
                              <select
                                 className="px-3 py-1 border rounded-md text-sm"
                                 value={selectedStafferId}
                                 onChange={e =>
                                    setSelectedStafferId(e.target.value)
                                 }
                              >
                                 <option value="">Assign staffer...</option>
                                 {availableStaffers
                                    .filter(
                                       staffer =>
                                          !assignments.some(
                                             assignment =>
                                                assignment.staffer.id ===
                                                staffer.id
                                          )
                                    )
                                    .map(staffer => (
                                       <option
                                          key={staffer.id}
                                          value={staffer.id}
                                       >
                                          {staffer.first_name}{" "}
                                          {staffer.last_name}
                                       </option>
                                    ))}
                              </select>
                              <Button
                                 type="button"
                                 size="sm"
                                 onClick={handleAssignStaffer}
                                 disabled={!selectedStafferId || loading}
                              >
                                 Assign
                              </Button>
                           </div>
                        </div>

                        <div className="space-y-2">
                           {assignments.map(assignment => (
                              <div
                                 key={assignment.staffer_assignment_id}
                                 className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                              >
                                 <div className="text-sm">
                                    {assignment.staffer.first_name}{" "}
                                    {assignment.staffer.last_name}
                                    <span className="text-gray-500 ml-2">
                                       {assignment.staffer.title}
                                    </span>
                                 </div>
                                 <Button
                                    type="button"
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
                     </div>
                  )}

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
                           : task
                           ? "Save Changes"
                           : "Create Task"}
                     </Button>
                  </div>
               </form>
            </CardContent>
         </Card>
      </Modal>
   );
}
