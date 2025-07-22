"use client";

import { StafferModal } from "@/components/staffers/StafferModal";
import {
   ErrorDisplay,
   LoadingState,
   StaffersHeader,
   StaffersSearch,
   StaffersTable,
} from "./components";
import { StaffersProvider, useStaffers } from "./contexts/StaffersContext";

function StaffersPageContent() {
   const {
      loading,
      error,
      searchQuery,
      setSearchQuery,
      filteredStaffers,
      seniorities,
      deleteLoading,
      isModalOpen,
      selectedStaffer,
      openModal,
      closeModal,
      deleteStaffer,
   } = useStaffers();

   // Simple success handler - the context will handle data updates automatically
   const handleModalSuccess = () => {
      closeModal();
   };

   if (loading) {
      return <LoadingState />;
   }

   return (
      <div className="min-h-screen bg-slate-50">
         <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <StaffersHeader onCreateNew={() => openModal()} />

            <StaffersSearch
               searchQuery={searchQuery}
               onSearch={setSearchQuery}
            />

            <ErrorDisplay error={error} />

            <StaffersTable
               staffers={filteredStaffers}
               searchQuery={searchQuery}
               deleteLoading={deleteLoading}
               seniorities={seniorities}
               onEdit={openModal}
               onDelete={deleteStaffer}
               onCreateNew={() => openModal()}
            />

            <StafferModal
               isOpen={isModalOpen}
               onClose={closeModal}
               staffer={selectedStaffer}
               onSuccess={handleModalSuccess}
            />
         </div>
      </div>
   );
}

export default function StaffersPage() {
   return (
      <StaffersProvider>
         <StaffersPageContent />
      </StaffersProvider>
   );
}
