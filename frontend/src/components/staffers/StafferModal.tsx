"use client";

import { EditStafferDetails } from "@/app/staffers/components/EditStafferDetails";
import { EditStafferRates } from "@/app/staffers/components/EditStafferRates";
import { EditStafferSkills } from "@/app/staffers/components/EditStafferSkills";
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
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Staffer } from "../../../../shared/schemas/typescript/staffer";

interface StafferModalProps {
   isOpen: boolean;
   onClose: () => void;
   staffer?: Staffer | null;
   onSuccess: () => void;
}

function StafferModalContent({
   isOpen,
   onClose,
   staffer,
}: Omit<StafferModalProps, "onSuccess">) {
   const { loading, error, handleSubmit, resetForm } = useEditStaffers();

   const handleClose = () => {
      resetForm();
      onClose();
   };

   if (!isOpen) return null;

   return (
      <Modal isOpen={isOpen} onClose={handleClose}>
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
                  <EditStafferDetails />

                  {/* Rates Section */}
                  <EditStafferRates />

                  {/* Skills Section */}
                  <EditStafferSkills />

                  <div className="flex justify-end space-x-4 pt-4">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
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
