"use client";

import {
   CreateStafferData,
   Staffer,
   stafferService,
} from "@/app/staffers/services/stafferService";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface StafferModalProps {
   isOpen: boolean;
   onClose: () => void;
   staffer?: Staffer | null;
   onSuccess: () => void;
}

export function StafferModal({
   isOpen,
   onClose,
   staffer,
   onSuccess,
}: StafferModalProps) {
   const [formData, setFormData] = useState<CreateStafferData>({
      first_name: "",
      last_name: "",
      email: "",
      time_zone: "",
      title: "",
      capacity: 40, // Default to 40 hours per week
   });
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   // Reset form when modal opens/closes or staffer changes
   useEffect(() => {
      if (isOpen) {
         if (staffer) {
            // Edit mode - populate form with existing data
            setFormData({
               first_name: staffer.first_name,
               last_name: staffer.last_name,
               email: staffer.email,
               time_zone: staffer.time_zone || "",
               title: staffer.title,
               capacity: staffer.capacity,
               seniority_id: staffer.seniority_id,
               user_id: staffer.user_id,
            });
         } else {
            // Create mode - reset form
            setFormData({
               first_name: "",
               last_name: "",
               email: "",
               time_zone: "",
               title: "",
               capacity: 40, // Default to 40 hours per week
            });
         }
         setError("");
      }
   }, [isOpen, staffer]);

   const handleInputChange = (
      field: keyof CreateStafferData,
      value: string | number
   ) => {
      setFormData((prev) => ({
         ...prev,
         [field]: value,
      }));
   };

   const validateForm = () => {
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
      if (!formData.email.includes("@")) {
         setError("Please enter a valid email address");
         return false;
      }
      if (!formData.title.trim()) {
         setError("Title is required");
         return false;
      }
      if (formData.capacity <= 0 || formData.capacity > 168) {
         // Max 168 hours per week
         setError("Capacity must be between 0 and 168 hours per week");
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
         let result;

         // Clean up the form data - remove empty time_zone if not provided
         const cleanedData = {
            ...formData,
            time_zone: formData.time_zone?.trim() || undefined,
         };

         if (staffer) {
            // Update existing staffer
            result = await stafferService.updateStaffer({
               id: staffer.id,
               ...cleanedData,
            });
         } else {
            // Create new staffer
            result = await stafferService.createStaffer(cleanedData);
         }

         if (result.error) {
            setError(result.error);
         } else {
            onSuccess();
            onClose();
         }
      } catch (err) {
         setError("An unexpected error occurred");
      } finally {
         setLoading(false);
      }
   };

   if (!isOpen) {
      return null;
   }

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-slate-900 bg-opacity-50"
            onClick={onClose}
         />

         {/* Modal */}
         <div className="relative z-10 w-full max-w-md mx-4">
            <Card>
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
                  <form onSubmit={handleSubmit} className="space-y-4">
                     {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                           {error}
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label
                              htmlFor="first_name"
                              className="text-sm font-medium text-slate-900"
                           >
                              First Name
                           </label>
                           <Input
                              id="first_name"
                              type="text"
                              value={formData.first_name}
                              onChange={(e) =>
                                 handleInputChange("first_name", e.target.value)
                              }
                              placeholder="John"
                              required
                           />
                        </div>

                        <div className="space-y-2">
                           <label
                              htmlFor="last_name"
                              className="text-sm font-medium text-slate-900"
                           >
                              Last Name
                           </label>
                           <Input
                              id="last_name"
                              type="text"
                              value={formData.last_name}
                              onChange={(e) =>
                                 handleInputChange("last_name", e.target.value)
                              }
                              placeholder="Doe"
                              required
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label
                           htmlFor="email"
                           className="text-sm font-medium text-slate-900"
                        >
                           Email
                        </label>
                        <Input
                           id="email"
                           type="email"
                           value={formData.email}
                           onChange={(e) =>
                              handleInputChange("email", e.target.value)
                           }
                           placeholder="john.doe@company.com"
                           required
                        />
                     </div>

                     <div className="space-y-2">
                        <label
                           htmlFor="time_zone"
                           className="text-sm font-medium text-slate-900"
                        >
                           Time Zone{" "}
                           <span className="text-slate-500 text-xs">
                              (optional)
                           </span>
                        </label>
                        <Input
                           id="time_zone"
                           type="text"
                           value={formData.time_zone || ""}
                           onChange={(e) =>
                              handleInputChange("time_zone", e.target.value)
                           }
                           placeholder="America/New_York"
                        />
                     </div>

                     <div className="space-y-2">
                        <label
                           htmlFor="title"
                           className="text-sm font-medium text-slate-900"
                        >
                           Title
                        </label>
                        <Input
                           id="title"
                           type="text"
                           value={formData.title}
                           onChange={(e) =>
                              handleInputChange("title", e.target.value)
                           }
                           placeholder="Senior Consultant"
                           required
                        />
                     </div>

                     <div className="space-y-2">
                        <label
                           htmlFor="capacity"
                           className="text-sm font-medium text-slate-900"
                        >
                           Weekly Capacity (hours)
                        </label>
                        <Input
                           id="capacity"
                           type="number"
                           step="0.5"
                           min="0"
                           max="168"
                           value={formData.capacity}
                           onChange={(e) =>
                              handleInputChange(
                                 "capacity",
                                 parseFloat(e.target.value) || 0
                              )
                           }
                           placeholder="40"
                           required
                        />
                        <div className="text-xs text-slate-500">
                           Enter weekly working hours (e.g., 40 for full-time,
                           20 for part-time)
                        </div>
                     </div>

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
         </div>
      </div>
   );
}
