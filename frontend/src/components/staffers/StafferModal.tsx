"use client";

import { EditStafferDetails } from "@/app/staffers/components/EditStafferDetails";
import { EditStafferRates } from "@/app/staffers/components/EditStafferRates";
import { EditStafferSkills } from "@/app/staffers/components/EditStafferSkills";
import { EditStafferTimeOff } from "@/app/staffers/components/EditStafferTimeOff";
import {
   EditStaffersProvider,
   useEditStaffers,
} from "@/app/staffers/contexts/EditStaffersContext";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { useState } from "react";
import { Staffer } from "../../../../shared/schemas/typescript/staffer";

interface StafferModalProps {
   isOpen: boolean;
   onClose: () => void;
   staffer?: Staffer | null;
   onSuccess: () => void;
}

type TabType = "details" | "timeoff";

function StafferModalContent({
   isOpen,
   onClose,
   staffer,
}: Omit<StafferModalProps, "onSuccess">) {
   const { loading, error, handleSubmit, resetForm } = useEditStaffers();
   const [activeTab, setActiveTab] = useState<TabType>("details");

   const handleClose = () => {
      resetForm();
      setActiveTab("details"); // Reset to details tab when closing
      onClose();
   };

   const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSubmit(e);
   };

   if (!isOpen) return null;

   // Only show tabs if staffer exists (editing mode)
   const isNewStaffer = !staffer;

   const tabs = [
      {
         id: "details" as TabType,
         label: "Details",
         icon: User,
         description: "Basic information, rates, and skills",
      },
      // Only show Time Off tab for existing staffers
      ...(isNewStaffer
         ? []
         : [
              {
                 id: "timeoff" as TabType,
                 label: "Time Off",
                 icon: Calendar,
                 description: "PTO and leave entries",
              },
           ]),
   ];

   return (
      <Modal isOpen={isOpen} onClose={handleClose}>
         <Card className="max-w-5xl w-full">
            <CardHeader>
               <CardTitle>
                  {staffer ? "Edit Staffer" : "Create New Staffer"}
               </CardTitle>
               <CardDescription>
                  {staffer
                     ? "Update the staffer information below"
                     : "Enter the details for the new team member"}
               </CardDescription>

               {/* Tab Navigation - Only show if not a new staffer */}
               {!isNewStaffer && (
                  <div className="border-b border-slate-200 mt-4">
                     <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                           const Icon = tab.icon;
                           const isActive = activeTab === tab.id;

                           return (
                              <button
                                 key={tab.id}
                                 type="button"
                                 onClick={() => setActiveTab(tab.id)}
                                 className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    isActive
                                       ? "border-blue-500 text-blue-600"
                                       : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                 }`}
                              >
                                 <Icon className="w-4 h-4" />
                                 {tab.label}
                              </button>
                           );
                        })}
                     </nav>
                  </div>
               )}
            </CardHeader>
            <CardContent>
               {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
                     {error}
                  </div>
               )}

               {activeTab === "details" || isNewStaffer ? (
                  <form
                     id="staffer-form"
                     onSubmit={handleFormSubmit}
                     className="space-y-6"
                  >
                     {/* Basic Information Section */}
                     <EditStafferDetails />

                     {/* Rates Section */}
                     <EditStafferRates />

                     {/* Skills Section */}
                     <EditStafferSkills />
                  </form>
               ) : (
                  <div className="space-y-6">
                     {/* Time Off Section */}
                     <EditStafferTimeOff staffer={staffer || null} />
                  </div>
               )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-4 border-t border-slate-200 pt-4">
               <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
               >
                  Cancel
               </Button>
               <Button
                  type={
                     activeTab === "details" || isNewStaffer
                        ? "submit"
                        : "button"
                  }
                  form={
                     activeTab === "details" || isNewStaffer
                        ? "staffer-form"
                        : undefined
                  }
                  onClick={
                     activeTab === "timeoff" && !isNewStaffer
                        ? handleFormSubmit
                        : undefined
                  }
                  disabled={loading}
               >
                  {loading
                     ? staffer
                        ? "Updating..."
                        : "Creating..."
                     : staffer
                     ? "Update Staffer"
                     : "Create Staffer"}
               </Button>
            </CardFooter>
         </Card>
      </Modal>
   );
}

export function StafferModal({
   isOpen,
   onClose,
   staffer = null,
   onSuccess,
}: StafferModalProps) {
   return (
      <EditStaffersProvider
         staffer={staffer}
         onSuccess={onSuccess}
         onClose={onClose}
      >
         <StafferModalContent
            isOpen={isOpen}
            onClose={onClose}
            staffer={staffer}
         />
      </EditStaffersProvider>
   );
}
