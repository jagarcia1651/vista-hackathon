import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import type { Project } from "@/types/project";
import { ProjectStatus } from "@/types/base";
import { useState } from "react";
import { Modal } from "@/components/shared/Modal";

interface ProjectModalProps {
   project?: Project;
   isOpen: boolean;
   onClose: () => void;
   onSuccess: () => void;
}

export function ProjectModal({
   project,
   isOpen,
   onClose,
   onSuccess
}: ProjectModalProps) {
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState<Partial<Project>>(
      project || {
         project_name: "",
         project_status: ProjectStatus.ACTIVE,
         project_start_date: new Date().toISOString().split("T")[0],
         project_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
      }
   );

   const supabase = createClient();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
         if (project?.project_id) {
            // Update existing project
            const { error } = await supabase
               .from("projects")
               .update({
                  ...formData,
                  last_updated_at: new Date().toISOString()
               })
               .eq("project_id", project.project_id);

            if (error) throw error;
         } else {
            // Create new project
            const { error } = await supabase.from("projects").insert({
               ...formData,
               created_at: new Date().toISOString(),
               last_updated_at: new Date().toISOString()
            });

            if (error) throw error;
         }

         onSuccess();
         onClose();
      } catch (error) {
         console.error("Error saving project:", error);
         // TODO: Add error handling UI
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
                     >
                        <option value={ProjectStatus.ACTIVE}>Active</option>
                        <option value={ProjectStatus.ON_HOLD}>On Hold</option>
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
                        value={formData.project_start_date?.split("T")[0]}
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
                        value={formData.project_due_date?.split("T")[0]}
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
