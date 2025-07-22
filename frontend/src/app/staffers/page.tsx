"use client";

import { StafferModal } from "@/components/staffers/StafferModal";
import { useEffect, useState } from "react";
import {
   ErrorDisplay,
   LoadingState,
   StaffersHeader,
   StaffersSearch,
   StaffersTable,
} from "./components";
import { Staffer, stafferService } from "./services/stafferService";

export default function StaffersPage() {
   const [staffers, setStaffers] = useState<Staffer[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [searchQuery, setSearchQuery] = useState("");
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedStaffer, setSelectedStaffer] = useState<Staffer | null>(null);
   const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

   // Load staffers on component mount
   useEffect(() => {
      loadStaffers();
   }, []);

   const loadStaffers = async () => {
      setLoading(true);
      setError("");

      try {
         const result = await stafferService.getAllStaffers();
         if (result.error) {
            setError(result.error);
         } else {
            setStaffers(result.data || []);
         }
      } catch (err) {
         setError("Failed to load staffers");
      } finally {
         setLoading(false);
      }
   };

   const handleSearch = async (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
         loadStaffers();
         return;
      }

      setLoading(true);
      const result = await stafferService.searchStaffers(query);

      if (result.error) {
         setError(result.error);
      } else {
         setStaffers(result.data || []);
      }
      setLoading(false);
   };

   const handleCreateNew = () => {
      setSelectedStaffer(null);
      setIsModalOpen(true);
   };

   const handleEditStaffer = (staffer: Staffer) => {
      setSelectedStaffer(staffer);
      setIsModalOpen(true);
   };

   const handleDeleteStaffer = async (staffer: Staffer) => {
      if (!staffer.id) return;

      const confirmed = window.confirm(
         `Are you sure you want to delete ${staffer.first_name} ${staffer.last_name}? This action cannot be undone.`
      );

      if (!confirmed) return;

      setDeleteLoading(staffer.id);

      const result = await stafferService.deleteStaffer(staffer.id);

      if (result.error) {
         setError(result.error);
      } else {
         // Refresh the list
         loadStaffers();
      }

      setDeleteLoading(null);
   };

   const handleModalSuccess = () => {
      loadStaffers(); // Refresh the list after create/update
   };

   if (loading) {
      return <LoadingState />;
   }

   return (
      <div className="min-h-screen bg-slate-50">
         <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <StaffersHeader onCreateNew={handleCreateNew} />

            <StaffersSearch searchQuery={searchQuery} onSearch={handleSearch} />

            <ErrorDisplay error={error} />

            <StaffersTable
               staffers={staffers}
               searchQuery={searchQuery}
               deleteLoading={deleteLoading}
               onEdit={handleEditStaffer}
               onDelete={handleDeleteStaffer}
               onCreateNew={handleCreateNew}
            />

            <StafferModal
               isOpen={isModalOpen}
               onClose={() => setIsModalOpen(false)}
               staffer={selectedStaffer}
               onSuccess={handleModalSuccess}
            />
         </div>
      </div>
   );
}
