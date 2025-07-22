"use client";

import {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react";
import {
   Seniority,
   Staffer,
} from "../../../../../shared/schemas/typescript/staffer";
import { seniorityService } from "../services/seniorityService";
import {
   CreateStafferData,
   stafferService,
   UpdateStafferData,
} from "../services/stafferService";

interface StaffersContextType {
   // Data
   staffers: Staffer[];
   filteredStaffers: Staffer[];
   seniorities: Seniority[];

   // Loading states
   loading: boolean;
   deleteLoading: string | null;

   // Error state
   error: string;

   // Search
   searchQuery: string;
   setSearchQuery: (query: string) => void;

   // Modal state
   isModalOpen: boolean;
   selectedStaffer: Staffer | null;
   openModal: (staffer?: Staffer) => void;
   closeModal: () => void;

   // Actions
   refreshStaffers: () => Promise<void>;
   createStaffer: (data: CreateStafferData) => Promise<boolean>;
   updateStaffer: (data: UpdateStafferData) => Promise<boolean>;
   deleteStaffer: (staffer: Staffer) => Promise<void>;
}

const StaffersContext = createContext<StaffersContextType | undefined>(
   undefined
);

interface StaffersProviderProps {
   children: ReactNode;
}

export function StaffersProvider({ children }: StaffersProviderProps) {
   // State
   const [staffers, setStaffers] = useState<Staffer[]>([]);
   const [seniorities, setSeniorities] = useState<Seniority[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [searchQuery, setSearchQuery] = useState("");
   const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

   // Modal state
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedStaffer, setSelectedStaffer] = useState<Staffer | null>(null);

   // Memoized filtered staffers based on search query
   const filteredStaffers = useMemo(() => {
      if (!searchQuery.trim()) {
         return staffers;
      }

      const query = searchQuery.toLowerCase().trim();
      return staffers.filter((staffer) => {
         const firstName = staffer.first_name?.toLowerCase() || "";
         const lastName = staffer.last_name?.toLowerCase() || "";
         const email = staffer.email?.toLowerCase() || "";
         const fullName = `${firstName} ${lastName}`.trim();

         return (
            firstName.includes(query) ||
            lastName.includes(query) ||
            email.includes(query) ||
            fullName.includes(query)
         );
      });
   }, [staffers, searchQuery]);

   // Load staffers function - memoized to prevent unnecessary re-creates
   const refreshStaffers = useCallback(async () => {
      setLoading(true);
      setError("");

      try {
         const [staffersResult, senioritiesResult] = await Promise.all([
            stafferService.getAllStaffers(),
            seniorityService.getAllSeniorities(),
         ]);

         if (staffersResult.error) {
            setError(staffersResult.error);
         } else {
            setStaffers(staffersResult.data || []);
         }

         if (senioritiesResult.data) {
            setSeniorities(senioritiesResult.data);
         }
      } catch (err) {
         setError("Failed to load data");
      } finally {
         setLoading(false);
      }
   }, []);

   // Load data on mount
   useEffect(() => {
      refreshStaffers();
   }, [refreshStaffers]);

   // Modal handlers - memoized to prevent re-renders
   const openModal = useCallback((staffer?: Staffer) => {
      setSelectedStaffer(staffer || null);
      setIsModalOpen(true);
   }, []);

   const closeModal = useCallback(() => {
      setIsModalOpen(false);
      setSelectedStaffer(null);
   }, []);

   // CRUD operations - memoized
   const createStaffer = useCallback(
      async (data: CreateStafferData): Promise<boolean> => {
         try {
            const result = await stafferService.createStaffer(data);
            if (result.error) {
               setError(result.error);
               return false;
            }

            // Add the new staffer to the current list instead of refetching
            if (result.data) {
               setStaffers((prev) =>
                  [...prev, result.data!].sort((a, b) =>
                     (a.last_name || "").localeCompare(b.last_name || "")
                  )
               );
            }
            return true;
         } catch (err) {
            setError("Failed to create staffer");
            return false;
         }
      },
      []
   );

   const updateStaffer = useCallback(
      async (data: UpdateStafferData): Promise<boolean> => {
         try {
            const result = await stafferService.updateStaffer(data);
            if (result.error) {
               setError(result.error);
               return false;
            }

            // Update the staffer in the current list instead of refetching
            if (result.data) {
               setStaffers((prev) =>
                  prev
                     .map((staffer) =>
                        staffer.id === result.data!.id ? result.data! : staffer
                     )
                     .sort((a, b) =>
                        (a.last_name || "").localeCompare(b.last_name || "")
                     )
               );
            }
            return true;
         } catch (err) {
            setError("Failed to update staffer");
            return false;
         }
      },
      []
   );

   const deleteStaffer = useCallback(async (staffer: Staffer) => {
      if (!staffer.id) return;

      const confirmed = window.confirm(
         `Are you sure you want to delete ${staffer.first_name} ${staffer.last_name}? This action cannot be undone.`
      );

      if (!confirmed) return;

      setDeleteLoading(staffer.id);

      try {
         const result = await stafferService.deleteStaffer(staffer.id);
         if (result.error) {
            setError(result.error);
         } else {
            // Remove the staffer from the current list instead of refetching
            setStaffers((prev) => prev.filter((s) => s.id !== staffer.id));
         }
      } catch (err) {
         setError("Failed to delete staffer");
      } finally {
         setDeleteLoading(null);
      }
   }, []);

   // Memoized context value to prevent unnecessary re-renders
   const contextValue = useMemo(
      () => ({
         // Data
         staffers,
         filteredStaffers,
         seniorities,

         // Loading states
         loading,
         deleteLoading,

         // Error state
         error,

         // Search
         searchQuery,
         setSearchQuery,

         // Modal state
         isModalOpen,
         selectedStaffer,
         openModal,
         closeModal,

         // Actions
         refreshStaffers,
         createStaffer,
         updateStaffer,
         deleteStaffer,
      }),
      [
         staffers,
         filteredStaffers,
         seniorities,
         loading,
         deleteLoading,
         error,
         searchQuery,
         isModalOpen,
         selectedStaffer,
         openModal,
         closeModal,
         refreshStaffers,
         createStaffer,
         updateStaffer,
         deleteStaffer,
      ]
   );

   return (
      <StaffersContext.Provider value={contextValue}>
         {children}
      </StaffersContext.Provider>
   );
}

// Custom hook to use the staffers context
export function useStaffers() {
   const context = useContext(StaffersContext);
   if (context === undefined) {
      throw new Error("useStaffers must be used within a StaffersProvider");
   }
   return context;
}
