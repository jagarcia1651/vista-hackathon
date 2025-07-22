"use client";

import { EditStafferDetails } from "@/app/staffers/components/EditStafferDetails";
import { EditStafferSkills } from "@/app/staffers/components/EditStafferSkills";
import { useStaffers } from "@/app/staffers/contexts/StaffersContext";
import { CreateStafferData } from "@/app/staffers/services/stafferService";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Staffer } from "../../../../shared/schemas/typescript/staffer";

interface StafferModalProps {
   isOpen: boolean;
   onClose: () => void;
   staffer?: Staffer | null;
   onSuccess: () => void;
}

export function StafferModal({
   isOpen,
   onClose,
   staffer = null,
   onSuccess,
}: StafferModalProps) {
   const { seniorities, createStaffer, updateStaffer } = useStaffers();

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   const [formData, setFormData] = useState<CreateStafferData>({
      first_name: "",
      last_name: "",
      email: "",
      time_zone: "",
      title: "",
      seniority_id: "",
      capacity: 40,
   });

   // Reset form when modal opens/closes or staffer changes
   useEffect(() => {
      if (isOpen) {
         if (staffer) {
            // Populate form with existing staffer data
            setFormData({
               first_name: staffer.first_name || "",
               last_name: staffer.last_name || "",
               email: staffer.email || "",
               time_zone: staffer.time_zone || "",
               title: staffer.title || "",
               seniority_id: staffer.seniority_id || "",
               capacity: staffer.capacity || 40,
            });
         } else {
            // Reset form for new staffer
            setFormData({
               first_name: "",
               last_name: "",
               email: "",
               time_zone: "",
               title: "",
               seniority_id: "",
               capacity: 40,
            });
         }
         setError("");
      }
   }, [staffer, isOpen]);

   const handleInputChange = (
      field: keyof CreateStafferData,
      value: string | number
   ) => {
      setFormData((prev) => ({
         ...prev,
         [field]: value,
      }));
   };

   const validateForm = (): boolean => {
      // Basic validation
      if (!formData.first_name.trim()) {
         setError("First name is required");
         return false;
      }
      if (!formData.last_name.trim()) {
         setError("Last name is required");
         return false;
      }
      if (!formData.email.trim()) {
         setError("Email is required");
         return false;
      }
      if (!formData.title.trim()) {
         setError("Title is required");
         return false;
      }
      if (formData.capacity <= 0 || formData.capacity > 168) {
         setError("Capacity must be between 0 and 168 hours per week");
         return false;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
         setError("Please enter a valid email address");
         return false;
      }

      return true;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
         return;
      }

      setLoading(true);
      setError("");

      try {
         // Clean up the form data - remove empty fields if not provided
         const cleanedData = {
            ...formData,
            time_zone: formData.time_zone?.trim() || undefined,
            seniority_id: formData.seniority_id?.trim() || undefined,
         };

         let success = false;

         if (staffer?.id) {
            // Update existing staffer
            success = await updateStaffer({
               id: staffer.id,
               ...cleanedData,
            });
         } else {
            // Create new staffer
            success = await createStaffer(cleanedData);
         }

         if (success) {
            onSuccess();
            onClose();
         }
         // If not successful, error will be displayed from context
      } catch (err) {
         setError("An unexpected error occurred");
      } finally {
         setLoading(false);
      }
   };

   return (
      <Modal isOpen={isOpen} onClose={onClose}>
         <Card className="max-w-4xl w-full">
            <CardHeader>
               <CardTitle>
                  {staffer ? "Edit Staffer" : "Create New Staffer"}
               </CardTitle>
               <CardDescription>
                  {staffer
                     ? "Update the staffer information below"
                     : "Enter the details for the new team member"}
               </CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                     <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                     </div>
                  )}

                  {/* Basic Information Section */}
                  <EditStafferDetails
                     formData={formData}
                     onInputChange={handleInputChange}
                     seniorities={seniorities}
                  />

                  {/* Skills Section */}
                  <EditStafferSkills staffer={staffer} />

                  <div className="flex justify-end space-x-4 pt-4">
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
                           ? staffer
                              ? "Updating..."
                              : "Creating..."
                           : staffer
                           ? "Update Staffer"
                           : "Create Staffer"}
                     </Button>
                  </div>
               </form>
            </CardContent>
         </Card>
      </Modal>
   );
}
