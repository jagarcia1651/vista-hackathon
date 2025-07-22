import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Project } from "@/types/project";
import { ProjectStatus } from "@/types/base";
import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/Modal";
import { projectService } from "../services/projectService";

interface ProjectModalProps {
   project?: Project;
   isOpen: boolean;
   onClose: () => void;
   onSuccess: () => void;
}

interface Client {
   client_id: string;
   client_name: string;
}

function formatDateForInput(dateString: string | undefined): string {
   if (!dateString) return new Date().toISOString().split("T")[0];
   try {
      return new Date(dateString).toISOString().split("T")[0];
   } catch (e) {
      console.error("Error formatting date:", e);
      return new Date().toISOString().split("T")[0];
   }
}

export function ProjectModal({
   project,
   isOpen,
   onClose,
   onSuccess
}: ProjectModalProps) {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [clients, setClients] = useState<Client[]>([]);
   const [formData, setFormData] = useState<Partial<Project>>(() => {
      if (project) {
         return {
            ...project,
            project_start_date: formatDateForInput(project.project_start_date),
            project_due_date: formatDateForInput(project.project_due_date)
         };
      }
      return {
         project_name: "",
         project_status: ProjectStatus.RFP,
         client_id: "",
         project_start_date: formatDateForInput(new Date().toISOString()),
         project_due_date: formatDateForInput(
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
         )
      };
   });

   // Reset form data when project changes
   useEffect(() => {
      if (project) {
         setFormData({
            ...project,
            project_start_date: formatDateForInput(project.project_start_date),
            project_due_date: formatDateForInput(project.project_due_date)
         });
      }
   }, [project]);

   useEffect(() => {
      async function loadClients() {
         const { data, error } = await projectService.getClients();
         if (error) {
            setError(`Failed to load clients: ${error}`);
            return;
         }
         setClients(data || []);
      }
      loadClients();
   }, []);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
         console.log("Submitting form data:", formData);

         if (project?.project_id) {
            // Update existing project
            const result = await projectService.updateProject({
               project_id: project.project_id,
               ...formData
            });
            console.log("Update result:", result);

            if (result.error) throw new Error(result.error);
         } else {
            // Create new project
            const result = await projectService.createProject({
               project_name: formData.project_name!,
               project_status: formData.project_status!,
               client_id: formData.client_id!,
               project_start_date: formData.project_start_date,
               project_due_date: formData.project_due_date
            });
            console.log("Create result:", result);

            if (result.error) throw new Error(result.error);
         }

         onSuccess();
         onClose();
      } catch (err) {
         console.error("Error saving project:", err);
         setError(
            err instanceof Error
               ? err.message
               : "Failed to save project. Please check all required fields are filled out correctly."
         );
      } finally {
         setLoading(false);
      }
   };

   return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
         <Card>
            <CardHeader>
               <CardTitle>
                  {project ? "Edit Project" : "Create New Project"}
               </CardTitle>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                     <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                     </div>
                  )}
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Project Name</label>
                     <Input
                        value={formData.project_name}
                        onChange={e =>
                           setFormData({
                              ...formData,
                              project_name: e.target.value
                           })
                        }
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Client</label>
                     <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.client_id}
                        onChange={e =>
                           setFormData({
                              ...formData,
                              client_id: e.target.value
                           })
                        }
                        required
                     >
                        <option value="">Select a client</option>
                        {clients.map(client => (
                           <option
                              key={client.client_id}
                              value={client.client_id}
                           >
                              {client.client_name}
                           </option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Status</label>
                     <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.project_status}
                        onChange={e =>
                           setFormData({
                              ...formData,
                              project_status: e.target.value as ProjectStatus
                           })
                        }
                        required
                     >
                        <option value={ProjectStatus.RFP}>RFP</option>
                        <option value={ProjectStatus.QUOTED}>Quoted</option>
                        <option value={ProjectStatus.LOST}>Lost</option>
                        <option value={ProjectStatus.PENDING}>Pending</option>
                        <option value={ProjectStatus.IN_PROGRESS_ON_TRACK}>
                           In Progress - On Track
                        </option>
                        <option value={ProjectStatus.IN_PROGRESS_OFF_TRACK}>
                           In Progress - Off Track
                        </option>
                        <option value={ProjectStatus.COMPLETED}>
                           Completed
                        </option>
                        <option value={ProjectStatus.CANCELLED}>
                           Cancelled
                        </option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Start Date</label>
                     <Input
                        type="date"
                        value={formData.project_start_date}
                        onChange={e =>
                           setFormData({
                              ...formData,
                              project_start_date: e.target.value
                           })
                        }
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Due Date</label>
                     <Input
                        type="date"
                        value={formData.project_due_date}
                        onChange={e =>
                           setFormData({
                              ...formData,
                              project_due_date: e.target.value
                           })
                        }
                        required
                     />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
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
                           : project
                           ? "Save Changes"
                           : "Create Project"}
                     </Button>
                  </div>
               </form>
            </CardContent>
         </Card>
      </Modal>
   );
}
