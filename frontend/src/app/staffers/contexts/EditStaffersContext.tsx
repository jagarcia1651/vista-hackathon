"use client";

import {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useEffect,
   useState,
} from "react";
import {
   Skill,
   Staffer,
   StafferRate,
   StafferTimeOff,
} from "../../../../../shared/schemas/typescript/staffer";
import { skillsService } from "../services/skillsService";
import { stafferRateService } from "../services/stafferRateService";
import { CreateStafferData, stafferService } from "../services/stafferService";
import {
   StafferSkillWithDetails,
   staffersSkillsService,
} from "../services/staffersSkillsService";
import {
   CreateStafferTimeOffData,
   stafferTimeOffService,
} from "../services/stafferTimeOffService";
import { useStaffers } from "./StaffersContext";

interface PendingSkillUpdate {
   staffer_skill_id: string;
   skill_status?: string;
   certification_active_date?: string;
   certification_expiry_date?: string;
}

interface PendingSkillDetails {
   skill_id: string;
   skill_status: string;
   certification_active_date?: string;
   certification_expiry_date?: string;
}

interface PendingRateData {
   cost_rate: number;
   bill_rate: number;
}

interface PendingTimeOffUpdate {
   time_off_id: string;
   time_off_start_datetime?: string;
   time_off_end_datetime?: string;
   time_off_cumulative_hours?: number;
}

interface PendingTimeOffDetails {
   tempId: string; // Temporary ID for new entries
   staffer_id: string;
   time_off_start_datetime: string;
   time_off_end_datetime: string;
   time_off_cumulative_hours: number;
}

interface EditStaffersContextType {
   // Form state
   formData: CreateStafferData;
   loading: boolean;
   error: string;

   // Skills state
   allSkills: Skill[];
   skillsLookup: Record<string, Skill>;
   stafferSkills: StafferSkillWithDetails[];
   skillSearchQuery: string;
   filteredSkills: Skill[];
   showSkillDropdown: boolean;
   skillsLoading: boolean;
   expandedSkills: Set<string>;

   // Rate state
   currentRate: StafferRate | null;
   pendingRateData: PendingRateData | null;
   rateLoading: boolean;

   // Time off state
   timeOffEntries: StafferTimeOff[];
   pendingTimeOffAdditions: PendingTimeOffDetails[];
   pendingTimeOffDeletions: string[];
   pendingTimeOffUpdates: PendingTimeOffUpdate[];
   timeOffLoading: boolean;

   // Pending changes
   pendingSkillAdditions: string[];
   pendingSkillDeletions: string[];
   pendingSkillUpdates: PendingSkillUpdate[];
   pendingSkillDetails: PendingSkillDetails[];

   // Form handlers
   handleInputChange: (
      field: keyof CreateStafferData,
      value: string | number
   ) => void;
   validateForm: () => boolean;
   handleSubmit: (e: React.FormEvent) => Promise<void>;

   // Skills handlers
   handleAddSkill: (skill: Skill) => void;
   handleRemoveSkill: (stafferSkill: StafferSkillWithDetails) => void;
   handleRemovePendingSkill: (skillId: string) => void;
   handleSkillUpdate: (
      stafferSkillId: string,
      field: string,
      value: string
   ) => void;
   handlePendingSkillUpdate: (
      skillId: string,
      field: string,
      value: string
   ) => void;
   setSkillSearchQuery: (query: string) => void;
   setShowSkillDropdown: (show: boolean) => void;
   toggleSkillExpansion: (skillId: string) => void;

   // Rate handlers
   handleRateChange: (field: "cost_rate" | "bill_rate", value: number) => void;

   // Time off handlers
   handleAddTimeOff: (
      timeOffData: Omit<CreateStafferTimeOffData, "staffer_id">
   ) => void;
   handleUpdateTimeOff: (
      timeOffId: string,
      field: string,
      value: string | number
   ) => void;
   handleDeleteTimeOff: (timeOffId: string) => void;
   handleDeletePendingTimeOff: (tempId: string) => void;
   handleUpdatePendingTimeOff: (
      tempId: string,
      field: string,
      value: string | number
   ) => void;

   // Utility functions
   getPendingUpdateValue: (
      stafferSkillId: string,
      field: string,
      originalValue: string | undefined
   ) => string;
   getPendingSkillValue: (skillId: string, field: string) => string;
   getVisibleStafferSkills: () => StafferSkillWithDetails[];
   getCurrentRateValue: (field: "cost_rate" | "bill_rate") => number;
   getVisibleTimeOffEntries: () => StafferTimeOff[];
   getPendingTimeOffUpdateValue: (
      timeOffId: string,
      field: string,
      originalValue: string | number | undefined
   ) => string | number;
   getPendingTimeOffValue: (tempId: string, field: string) => string | number;

   // Control functions
   resetForm: () => void;
   initializeForStaffer: (staffer: Staffer | null) => void;
}

const EditStaffersContext = createContext<EditStaffersContextType | undefined>(
   undefined
);

interface EditStaffersProviderProps {
   children: ReactNode;
   staffer: Staffer | null;
   onSuccess: () => void;
   onClose: () => void;
}

export function EditStaffersProvider({
   children,
   staffer,
   onSuccess,
   onClose,
}: EditStaffersProviderProps) {
   const { seniorities, updateStaffer, refreshStaffers } = useStaffers();

   // Form state
   const [formData, setFormData] = useState<CreateStafferData>({
      first_name: "",
      last_name: "",
      email: "",
      time_zone: "",
      title: "",
      seniority_id: "",
      capacity: 40,
   });
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   // Skills state
   const [allSkills, setAllSkills] = useState<Skill[]>([]);
   const [skillsLookup, setSkillsLookup] = useState<Record<string, Skill>>({});
   const [stafferSkills, setStafferSkills] = useState<
      StafferSkillWithDetails[]
   >([]);
   const [skillSearchQuery, setSkillSearchQuery] = useState("");
   const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
   const [showSkillDropdown, setShowSkillDropdown] = useState(false);
   const [skillsLoading, setSkillsLoading] = useState(false);
   const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

   // Rate state
   const [currentRate, setCurrentRate] = useState<StafferRate | null>(null);
   const [pendingRateData, setPendingRateData] =
      useState<PendingRateData | null>(null);
   const [rateLoading, setRateLoading] = useState(false);

   // Time off state
   const [timeOffEntries, setTimeOffEntries] = useState<StafferTimeOff[]>([]);
   const [pendingTimeOffAdditions, setPendingTimeOffAdditions] = useState<
      PendingTimeOffDetails[]
   >([]);
   const [pendingTimeOffDeletions, setPendingTimeOffDeletions] = useState<
      string[]
   >([]);
   const [pendingTimeOffUpdates, setPendingTimeOffUpdates] = useState<
      PendingTimeOffUpdate[]
   >([]);
   const [timeOffLoading, setTimeOffLoading] = useState(false);

   // Pending changes
   const [pendingSkillAdditions, setPendingSkillAdditions] = useState<string[]>(
      []
   );
   const [pendingSkillDeletions, setPendingSkillDeletions] = useState<string[]>(
      []
   );
   const [pendingSkillUpdates, setPendingSkillUpdates] = useState<
      PendingSkillUpdate[]
   >([]);
   const [pendingSkillDetails, setPendingSkillDetails] = useState<
      PendingSkillDetails[]
   >([]);

   // Load all skills on mount and create lookup map
   useEffect(() => {
      const loadSkills = async () => {
         const { data, error } = await skillsService.getAllSkills();
         if (data && !error) {
            setAllSkills(data);
            // Create lookup map for fast skill name retrieval
            const lookup = data.reduce((acc, skill) => {
               acc[skill.skill_id] = skill;
               return acc;
            }, {} as Record<string, Skill>);
            setSkillsLookup(lookup);
         }
      };
      loadSkills();
   }, []);

   // Initialize form and skills when staffer changes
   const initializeForStaffer = useCallback(
      (currentStaffer: Staffer | null) => {
         if (currentStaffer) {
            // Populate form with existing staffer data
            setFormData({
               first_name: currentStaffer.first_name || "",
               last_name: currentStaffer.last_name || "",
               email: currentStaffer.email || "",
               time_zone: currentStaffer.time_zone || "",
               title: currentStaffer.title || "",
               seniority_id: currentStaffer.seniority_id || "",
               capacity: currentStaffer.capacity || 40,
            });

            // Load staffer skills
            if (currentStaffer.id) {
               const loadStafferSkills = async () => {
                  setSkillsLoading(true);
                  const { data, error } =
                     await staffersSkillsService.getSkillsForStaffer(
                        currentStaffer.id
                     );
                  if (data && !error) {
                     setStafferSkills(data);
                  }
                  setSkillsLoading(false);
               };
               loadStafferSkills();

               // Load staffer rate
               const loadStafferRate = async () => {
                  setRateLoading(true);
                  const { data, error } =
                     await stafferRateService.getStafferRate(currentStaffer.id);
                  if (data && !error) {
                     setCurrentRate(data);
                  } else {
                     setCurrentRate(null);
                  }
                  setRateLoading(false);
               };
               loadStafferRate();

               // Load staffer time off
               const loadStafferTimeOff = async () => {
                  setTimeOffLoading(true);
                  const { data, error } =
                     await stafferTimeOffService.getStafferTimeOff(
                        currentStaffer.id
                     );
                  if (data && !error) {
                     setTimeOffEntries(data);
                  } else {
                     setTimeOffEntries([]);
                  }
                  setTimeOffLoading(false);
               };
               loadStafferTimeOff();
            }
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
            setStafferSkills([]);
            setCurrentRate(null);
            setTimeOffEntries([]);
         }

         // Reset all pending changes
         setPendingSkillAdditions([]);
         setPendingSkillDeletions([]);
         setPendingSkillUpdates([]);
         setPendingSkillDetails([]);
         setPendingRateData(null);
         setPendingTimeOffAdditions([]);
         setPendingTimeOffDeletions([]);
         setPendingTimeOffUpdates([]);
         setExpandedSkills(new Set());
         setError("");
         setSkillSearchQuery("");
         setShowSkillDropdown(false);
      },
      []
   );

   // Initialize when staffer prop changes
   useEffect(() => {
      initializeForStaffer(staffer);
   }, [staffer, initializeForStaffer]);

   // Filter skills based on search query and exclude already assigned/pending skills
   useEffect(() => {
      const assignedSkillIds = stafferSkills.map((ss) => ss.skill_id);
      const allExcludedIds = [...assignedSkillIds, ...pendingSkillAdditions];
      let filtered: Skill[];

      if (!skillSearchQuery.trim()) {
         // Show all skills when no search query (and when focused)
         filtered = allSkills.filter(
            (skill) =>
               !allExcludedIds.includes(skill.skill_id) &&
               !pendingSkillDeletions.includes(skill.skill_id)
         );
      } else {
         // Filter based on search query
         filtered = allSkills.filter(
            (skill) =>
               !allExcludedIds.includes(skill.skill_id) &&
               !pendingSkillDeletions.includes(skill.skill_id) &&
               (skill.skill_name
                  .toLowerCase()
                  .includes(skillSearchQuery.toLowerCase()) ||
                  skill.skill_description
                     .toLowerCase()
                     .includes(skillSearchQuery.toLowerCase()))
         );
      }

      setFilteredSkills(filtered.slice(0, 20)); // Show more results for better UX
   }, [
      skillSearchQuery,
      allSkills,
      stafferSkills,
      pendingSkillAdditions,
      pendingSkillDeletions,
   ]);

   // Form handlers
   const handleInputChange = useCallback(
      (field: keyof CreateStafferData, value: string | number) => {
         setFormData((prev) => ({
            ...prev,
            [field]: value,
         }));
      },
      []
   );

   const validateForm = useCallback((): boolean => {
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

      // Rate validation (if pending rate data exists)
      if (pendingRateData) {
         if (pendingRateData.cost_rate < 0) {
            setError("Cost rate must be 0 or greater");
            return false;
         }
         if (pendingRateData.bill_rate < 0) {
            setError("Bill rate must be 0 or greater");
            return false;
         }
      }

      // Time off validation
      for (const timeOff of pendingTimeOffAdditions) {
         if (
            new Date(timeOff.time_off_start_datetime) >=
            new Date(timeOff.time_off_end_datetime)
         ) {
            setError("End date must be after start date for time off entries");
            return false;
         }
         if (timeOff.time_off_cumulative_hours <= 0) {
            setError("Time off hours must be greater than 0");
            return false;
         }
      }

      return true;
   }, [formData, pendingRateData, pendingTimeOffAdditions]);

   const applySkillChanges = useCallback(
      async (stafferId: string) => {
         const promises = [];

         // Apply skill deletions
         for (const stafferSkillId of pendingSkillDeletions) {
            promises.push(
               staffersSkillsService.deleteStafferSkill(stafferSkillId)
            );
         }

         // Apply skill updates
         for (const update of pendingSkillUpdates) {
            const updateData = { ...update };
            promises.push(staffersSkillsService.updateStafferSkill(updateData));
         }

         // Apply skill additions with detailed information
         for (const skillId of pendingSkillAdditions) {
            const skillDetails = pendingSkillDetails.find(
               (detail) => detail.skill_id === skillId
            );

            promises.push(
               staffersSkillsService.createStafferSkill({
                  staffer_id: stafferId,
                  skill_id: skillId,
                  skill_status: skillDetails?.skill_status || "competent",
                  certification_active_date:
                     skillDetails?.certification_active_date || undefined,
                  certification_expiry_date:
                     skillDetails?.certification_expiry_date || undefined,
               })
            );
         }

         if (promises.length > 0) {
            try {
               await Promise.all(promises);
            } catch (err) {
               console.error("Error applying skill changes:", err);
               throw new Error("Failed to update skills");
            }
         }
      },
      [
         pendingSkillDeletions,
         pendingSkillUpdates,
         pendingSkillAdditions,
         pendingSkillDetails,
      ]
   );

   const applyRateChanges = useCallback(
      async (stafferId: string) => {
         if (!pendingRateData) return;

         try {
            if (currentRate) {
               // Update existing rate
               await stafferRateService.updateStafferRate({
                  staffer_rate_id: currentRate.staffer_rate_id,
                  cost_rate: pendingRateData.cost_rate,
                  bill_rate: pendingRateData.bill_rate,
               });
            } else {
               // Create new rate
               await stafferRateService.createStafferRate({
                  staffer_id: stafferId,
                  cost_rate: pendingRateData.cost_rate,
                  bill_rate: pendingRateData.bill_rate,
               });
            }
         } catch (err) {
            console.error("Error applying rate changes:", err);
            throw new Error("Failed to update rates");
         }
      },
      [currentRate, pendingRateData]
   );

   const applyTimeOffChanges = useCallback(
      async (stafferId: string) => {
         const promises = [];

         // Apply time off deletions
         for (const timeOffId of pendingTimeOffDeletions) {
            promises.push(
               stafferTimeOffService.deleteStafferTimeOff(timeOffId)
            );
         }

         // Apply time off updates
         for (const update of pendingTimeOffUpdates) {
            const updateData = { ...update };
            promises.push(
               stafferTimeOffService.updateStafferTimeOff(updateData)
            );
         }

         // Apply time off additions
         for (const timeOffData of pendingTimeOffAdditions) {
            const { tempId, ...createData } = timeOffData;
            promises.push(
               stafferTimeOffService.createStafferTimeOff({
                  ...createData,
                  staffer_id: stafferId,
               })
            );
         }

         if (promises.length > 0) {
            try {
               await Promise.all(promises);
            } catch (err) {
               console.error("Error applying time off changes:", err);
               throw new Error("Failed to update time off entries");
            }
         }
      },
      [pendingTimeOffDeletions, pendingTimeOffUpdates, pendingTimeOffAdditions]
   );

   const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
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
            let stafferId = staffer?.id;

            if (staffer?.id) {
               // Update existing staffer
               success = await updateStaffer({
                  id: staffer.id,
                  ...cleanedData,
               });
            } else {
               // Create new staffer - use stafferService directly to get the created staffer data
               const result = await stafferService.createStaffer(cleanedData);

               if (result.error) {
                  setError(result.error);
                  return;
               }

               if (result.data) {
                  success = true;
                  stafferId = result.data.id;
                  // Refresh the staffers list in the main context
                  await refreshStaffers();
               }
            }

            if (success && stafferId) {
               // Apply skill changes if there are any
               const hasSkillChanges =
                  pendingSkillAdditions.length > 0 ||
                  pendingSkillDeletions.length > 0 ||
                  pendingSkillUpdates.length > 0;

               if (hasSkillChanges) {
                  await applySkillChanges(stafferId);
               }

               // Apply rate changes if there are any
               if (pendingRateData) {
                  await applyRateChanges(stafferId);
               }

               // Apply time off changes if there are any
               const hasTimeOffChanges =
                  pendingTimeOffAdditions.length > 0 ||
                  pendingTimeOffDeletions.length > 0 ||
                  pendingTimeOffUpdates.length > 0;

               if (hasTimeOffChanges) {
                  await applyTimeOffChanges(stafferId);
               }

               onSuccess();
               onClose();
            }
            // If not successful, error will be displayed from context
         } catch (err) {
            setError(
               err instanceof Error
                  ? err.message
                  : "An unexpected error occurred"
            );
         } finally {
            setLoading(false);
         }
      },
      [
         validateForm,
         formData,
         staffer,
         updateStaffer,
         pendingSkillAdditions,
         pendingSkillDeletions,
         pendingSkillUpdates,
         pendingRateData,
         pendingTimeOffAdditions,
         pendingTimeOffDeletions,
         pendingTimeOffUpdates,
         applySkillChanges,
         applyRateChanges,
         applyTimeOffChanges,
         refreshStaffers,
         onSuccess,
         onClose,
      ]
   );

   // Skills handlers
   const handleAddSkill = useCallback((skill: Skill) => {
      // Allow adding skills for both existing and new staffers
      // Add to pending additions for immediate visual feedback
      setPendingSkillAdditions((prev) => [...prev, skill.skill_id]);

      // Initialize pending skill details with default values
      setPendingSkillDetails((prev) => [
         ...prev,
         {
            skill_id: skill.skill_id,
            skill_status: "competent",
            certification_active_date: "",
            certification_expiry_date: "",
         },
      ]);

      setSkillSearchQuery("");
      setShowSkillDropdown(false);
   }, []);

   const handleRemoveSkill = useCallback(
      (stafferSkill: StafferSkillWithDetails) => {
         if (!staffer?.id) return;

         // Add to pending deletions for immediate visual feedback
         setPendingSkillDeletions((prev) => [
            ...prev,
            stafferSkill.staffer_skill_id,
         ]);
         // Remove from expanded if it was expanded
         setExpandedSkills((prev) => {
            const newSet = new Set(prev);
            newSet.delete(stafferSkill.staffer_skill_id);
            return newSet;
         });
      },
      [staffer?.id]
   );

   const handleRemovePendingSkill = useCallback((skillId: string) => {
      // Remove from pending additions
      setPendingSkillAdditions((prev) => prev.filter((id) => id !== skillId));
      // Remove from pending skill details
      setPendingSkillDetails((prev) =>
         prev.filter((detail) => detail.skill_id !== skillId)
      );
      // Remove from expanded if it was expanded
      setExpandedSkills((prev) => {
         const newSet = new Set(prev);
         newSet.delete(`pending-${skillId}`);
         return newSet;
      });
   }, []);

   const handleSkillUpdate = useCallback(
      (stafferSkillId: string, field: string, value: string) => {
         setPendingSkillUpdates((prev) => {
            const existing = prev.find(
               (update) => update.staffer_skill_id === stafferSkillId
            );
            if (existing) {
               return prev.map((update) =>
                  update.staffer_skill_id === stafferSkillId
                     ? { ...update, [field]: value }
                     : update
               );
            } else {
               return [
                  ...prev,
                  { staffer_skill_id: stafferSkillId, [field]: value },
               ];
            }
         });
      },
      []
   );

   const handlePendingSkillUpdate = useCallback(
      (skillId: string, field: string, value: string) => {
         setPendingSkillDetails((prev) => {
            return prev.map((detail) =>
               detail.skill_id === skillId
                  ? { ...detail, [field]: value }
                  : detail
            );
         });
      },
      []
   );

   const toggleSkillExpansion = useCallback((skillId: string) => {
      setExpandedSkills((prev) => {
         const newSet = new Set(prev);
         if (newSet.has(skillId)) {
            newSet.delete(skillId);
         } else {
            newSet.add(skillId);
         }
         return newSet;
      });
   }, []);

   // Rate handlers
   const handleRateChange = useCallback(
      (field: "cost_rate" | "bill_rate", value: number) => {
         setPendingRateData((prev) => {
            const currentCostRate =
               prev?.cost_rate ?? currentRate?.cost_rate ?? 0;
            const currentBillRate =
               prev?.bill_rate ?? currentRate?.bill_rate ?? 0;

            return {
               cost_rate: field === "cost_rate" ? value : currentCostRate,
               bill_rate: field === "bill_rate" ? value : currentBillRate,
            };
         });
      },
      [currentRate]
   );

   // Time off handlers
   const handleAddTimeOff = useCallback(
      (timeOffData: Omit<CreateStafferTimeOffData, "staffer_id">) => {
         if (!staffer?.id) return;

         const tempId = `temp-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;

         setPendingTimeOffAdditions((prev) => [
            ...prev,
            {
               tempId,
               staffer_id: staffer.id,
               ...timeOffData,
            },
         ]);
      },
      [staffer?.id]
   );

   const handleUpdateTimeOff = useCallback(
      (timeOffId: string, field: string, value: string | number) => {
         setPendingTimeOffUpdates((prev) => {
            const existing = prev.find(
               (update) => update.time_off_id === timeOffId
            );
            if (existing) {
               return prev.map((update) =>
                  update.time_off_id === timeOffId
                     ? { ...update, [field]: value }
                     : update
               );
            } else {
               return [...prev, { time_off_id: timeOffId, [field]: value }];
            }
         });
      },
      []
   );

   const handleDeleteTimeOff = useCallback((timeOffId: string) => {
      setPendingTimeOffDeletions((prev) => [...prev, timeOffId]);
   }, []);

   const handleDeletePendingTimeOff = useCallback((tempId: string) => {
      setPendingTimeOffAdditions((prev) =>
         prev.filter((entry) => entry.tempId !== tempId)
      );
   }, []);

   const handleUpdatePendingTimeOff = useCallback(
      (tempId: string, field: string, value: string | number) => {
         setPendingTimeOffAdditions((prev) => {
            return prev.map((entry) =>
               entry.tempId === tempId ? { ...entry, [field]: value } : entry
            );
         });
      },
      []
   );

   // Utility functions
   const getPendingUpdateValue = useCallback(
      (
         stafferSkillId: string,
         field: string,
         originalValue: string | undefined
      ): string => {
         const pendingUpdate = pendingSkillUpdates.find(
            (update) => update.staffer_skill_id === stafferSkillId
         );
         return (
            (pendingUpdate?.[field as keyof PendingSkillUpdate] as string) ||
            originalValue ||
            ""
         );
      },
      [pendingSkillUpdates]
   );

   const getPendingSkillValue = useCallback(
      (skillId: string, field: string): string => {
         const pendingDetail = pendingSkillDetails.find(
            (detail) => detail.skill_id === skillId
         );
         return (
            (pendingDetail?.[field as keyof PendingSkillDetails] as string) ||
            ""
         );
      },
      [pendingSkillDetails]
   );

   const getVisibleStafferSkills =
      useCallback((): StafferSkillWithDetails[] => {
         return stafferSkills.filter(
            (ss) => !pendingSkillDeletions.includes(ss.staffer_skill_id)
         );
      }, [stafferSkills, pendingSkillDeletions]);

   const getCurrentRateValue = useCallback(
      (field: "cost_rate" | "bill_rate"): number => {
         return pendingRateData?.[field] ?? currentRate?.[field] ?? 0;
      },
      [pendingRateData, currentRate]
   );

   const getVisibleTimeOffEntries = useCallback((): StafferTimeOff[] => {
      return timeOffEntries.filter(
         (entry) => !pendingTimeOffDeletions.includes(entry.time_off_id)
      );
   }, [timeOffEntries, pendingTimeOffDeletions]);

   const getPendingTimeOffUpdateValue = useCallback(
      (
         timeOffId: string,
         field: string,
         originalValue: string | number | undefined
      ): string | number => {
         const pendingUpdate = pendingTimeOffUpdates.find(
            (update) => update.time_off_id === timeOffId
         );
         return (
            pendingUpdate?.[field as keyof PendingTimeOffUpdate] ??
            originalValue ??
            ""
         );
      },
      [pendingTimeOffUpdates]
   );

   const getPendingTimeOffValue = useCallback(
      (tempId: string, field: string): string | number => {
         const pendingEntry = pendingTimeOffAdditions.find(
            (entry) => entry.tempId === tempId
         );
         return pendingEntry?.[field as keyof PendingTimeOffDetails] ?? "";
      },
      [pendingTimeOffAdditions]
   );

   const resetForm = useCallback(() => {
      setPendingSkillAdditions([]);
      setPendingSkillDeletions([]);
      setPendingSkillUpdates([]);
      setPendingSkillDetails([]);
      setPendingRateData(null);
      setPendingTimeOffAdditions([]);
      setPendingTimeOffDeletions([]);
      setPendingTimeOffUpdates([]);
      setExpandedSkills(new Set());
      setError("");
      setSkillSearchQuery("");
      setShowSkillDropdown(false);
   }, []);

   const contextValue: EditStaffersContextType = {
      // Form state
      formData,
      loading,
      error,

      // Skills state
      allSkills,
      skillsLookup,
      stafferSkills,
      skillSearchQuery,
      filteredSkills,
      showSkillDropdown,
      skillsLoading,
      expandedSkills,

      // Rate state
      currentRate,
      pendingRateData,
      rateLoading,

      // Time off state
      timeOffEntries,
      pendingTimeOffAdditions,
      pendingTimeOffDeletions,
      pendingTimeOffUpdates,
      timeOffLoading,

      // Pending changes
      pendingSkillAdditions,
      pendingSkillDeletions,
      pendingSkillUpdates,
      pendingSkillDetails,

      // Form handlers
      handleInputChange,
      validateForm,
      handleSubmit,

      // Skills handlers
      handleAddSkill,
      handleRemoveSkill,
      handleRemovePendingSkill,
      handleSkillUpdate,
      handlePendingSkillUpdate,
      setSkillSearchQuery,
      setShowSkillDropdown,
      toggleSkillExpansion,

      // Rate handlers
      handleRateChange,

      // Time off handlers
      handleAddTimeOff,
      handleUpdateTimeOff,
      handleDeleteTimeOff,
      handleDeletePendingTimeOff,
      handleUpdatePendingTimeOff,

      // Utility functions
      getPendingUpdateValue,
      getPendingSkillValue,
      getVisibleStafferSkills,
      getCurrentRateValue,
      getVisibleTimeOffEntries,
      getPendingTimeOffUpdateValue,
      getPendingTimeOffValue,

      // Control functions
      resetForm,
      initializeForStaffer,
   };

   return (
      <EditStaffersContext.Provider value={contextValue}>
         {children}
      </EditStaffersContext.Provider>
   );
}

export function useEditStaffers(): EditStaffersContextType {
   const context = useContext(EditStaffersContext);
   if (context === undefined) {
      throw new Error(
         "useEditStaffers must be used within an EditStaffersProvider"
      );
   }
   return context;
}
