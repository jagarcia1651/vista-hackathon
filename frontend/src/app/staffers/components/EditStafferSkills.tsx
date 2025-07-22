import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Plus, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
   Skill,
   Staffer,
} from "../../../../../shared/schemas/typescript/staffer";
import { skillsService } from "../services/skillsService";
import {
   StafferSkillWithDetails,
   staffersSkillsService,
} from "../services/staffersSkillsService";

interface EditStafferSkillsProps {
   staffer: Staffer | null;
   onSkillsChange?: (
      pendingAdditions: string[],
      pendingDeletions: string[],
      pendingUpdates: PendingSkillUpdate[]
   ) => void;
}

interface PendingSkillUpdate {
   staffer_skill_id: string;
   skill_status?: string;
   certification_active_date?: string;
   certification_expiry_date?: string;
}

export function EditStafferSkills({
   staffer,
   onSkillsChange,
}: EditStafferSkillsProps) {
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
   const skillSearchRef = useRef<HTMLDivElement>(null);

   // Track pending changes (only applied on form submission)
   const [pendingAdditions, setPendingAdditions] = useState<string[]>([]);
   const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
   const [pendingUpdates, setPendingUpdates] = useState<PendingSkillUpdate[]>(
      []
   );

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

   // Load staffer skills when staffer changes and reset pending changes
   useEffect(() => {
      setPendingAdditions([]);
      setPendingDeletions([]);
      setPendingUpdates([]);
      setExpandedSkills(new Set());

      if (staffer?.id) {
         const loadStafferSkills = async () => {
            setSkillsLoading(true);
            const { data, error } =
               await staffersSkillsService.getSkillsForStaffer(staffer.id);
            if (data && !error) {
               setStafferSkills(data);
            }
            setSkillsLoading(false);
         };
         loadStafferSkills();
      } else {
         setStafferSkills([]);
      }
   }, [staffer]);

   // Notify parent of pending changes
   useEffect(() => {
      onSkillsChange?.(pendingAdditions, pendingDeletions, pendingUpdates);
   }, [pendingAdditions, pendingDeletions, pendingUpdates, onSkillsChange]);

   // Filter skills based on search query and exclude already assigned/pending skills
   useEffect(() => {
      const assignedSkillIds = stafferSkills.map((ss) => ss.skill_id);
      const allExcludedIds = [...assignedSkillIds, ...pendingAdditions];
      let filtered: Skill[];

      if (!skillSearchQuery.trim()) {
         // Show all skills when no search query (and when focused)
         filtered = allSkills.filter(
            (skill) =>
               !allExcludedIds.includes(skill.skill_id) &&
               !pendingDeletions.includes(skill.skill_id)
         );
      } else {
         // Filter based on search query
         filtered = allSkills.filter(
            (skill) =>
               !allExcludedIds.includes(skill.skill_id) &&
               !pendingDeletions.includes(skill.skill_id) &&
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
      pendingAdditions,
      pendingDeletions,
   ]);

   // Close skill dropdown when clicking outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            skillSearchRef.current &&
            !skillSearchRef.current.contains(event.target as Node)
         ) {
            setShowSkillDropdown(false);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const handleAddSkill = async (skill: Skill) => {
      if (!staffer?.id) {
         // For new staffers, just close the dropdown
         setSkillSearchQuery("");
         setShowSkillDropdown(false);
         return;
      }

      // Add to pending additions for immediate visual feedback
      setPendingAdditions((prev) => [...prev, skill.skill_id]);
      setSkillSearchQuery("");
      setShowSkillDropdown(false);
   };

   const handleRemoveSkill = (stafferSkill: StafferSkillWithDetails) => {
      if (!staffer?.id) return;

      // Add to pending deletions for immediate visual feedback
      setPendingDeletions((prev) => [...prev, stafferSkill.staffer_skill_id]);
      // Remove from expanded if it was expanded
      setExpandedSkills((prev) => {
         const newSet = new Set(prev);
         newSet.delete(stafferSkill.staffer_skill_id);
         return newSet;
      });
   };

   const handleRemovePendingSkill = (skillId: string) => {
      // Remove from pending additions
      setPendingAdditions((prev) => prev.filter((id) => id !== skillId));
   };

   const handleSearchFocus = () => {
      setShowSkillDropdown(true);
   };

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSkillSearchQuery(value);
      setShowSkillDropdown(true);
   };

   const toggleSkillExpansion = (skillId: string) => {
      setExpandedSkills((prev) => {
         const newSet = new Set(prev);
         if (newSet.has(skillId)) {
            newSet.delete(skillId);
         } else {
            newSet.add(skillId);
         }
         return newSet;
      });
   };

   const handleSkillUpdate = (
      stafferSkillId: string,
      field: string,
      value: string
   ) => {
      setPendingUpdates((prev) => {
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
   };

   const getPendingUpdateValue = (
      stafferSkillId: string,
      field: string,
      originalValue: string | undefined
   ): string => {
      const pendingUpdate = pendingUpdates.find(
         (update) => update.staffer_skill_id === stafferSkillId
      );
      return (
         (pendingUpdate?.[field as keyof PendingSkillUpdate] as string) ||
         originalValue ||
         ""
      );
   };

   // Get visible skills (exclude pending deletions, include pending additions)
   const visibleStafferSkills = stafferSkills.filter(
      (ss) => !pendingDeletions.includes(ss.staffer_skill_id)
   );

   return (
      <div className="space-y-4">
         <h3 className="text-lg font-medium text-slate-900">Skills</h3>

         {/* Skills Search Bar */}
         <div className="relative" ref={skillSearchRef}>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
               <Input
                  type="text"
                  placeholder="Search and add skills..."
                  value={skillSearchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  className="pl-10"
                  disabled={!staffer?.id && !!staffer}
               />
            </div>

            {/* Skills Dropdown */}
            {showSkillDropdown && (
               <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredSkills.length > 0 ? (
                     <>
                        {!skillSearchQuery.trim() && (
                           <div className="px-4 py-2 text-xs text-slate-500 bg-slate-50 border-b">
                              All available skills:
                           </div>
                        )}
                        {filteredSkills.map((skill) => (
                           <button
                              key={skill.skill_id}
                              type="button"
                              onClick={() => handleAddSkill(skill)}
                              className="w-full px-4 py-2 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none flex items-center gap-2"
                           >
                              <Plus className="w-4 h-4 text-slate-400" />
                              <div>
                                 <div className="font-medium text-slate-900">
                                    {skill.skill_name}
                                 </div>
                                 <div className="text-sm text-slate-500">
                                    {skill.skill_description}
                                 </div>
                                 {skill.is_certification && (
                                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                                       Certification
                                    </span>
                                 )}
                              </div>
                           </button>
                        ))}
                     </>
                  ) : (
                     <div className="px-4 py-2 text-slate-500">
                        {skillSearchQuery.trim()
                           ? "No skills found"
                           : "No skills available"}
                     </div>
                  )}
               </div>
            )}
         </div>

         {!staffer?.id && (
            <div className="text-sm text-slate-500 italic">
               Skills can be added after creating the staffer
            </div>
         )}

         {/* Current Skills as Accordion Tiles */}
         {skillsLoading ? (
            <div className="text-sm text-slate-500">Loading skills...</div>
         ) : visibleStafferSkills.length > 0 || pendingAdditions.length > 0 ? (
            <div className="space-y-3">
               <label className="text-sm font-medium text-slate-900">
                  Current Skills
               </label>

               {/* Existing skills (not marked for deletion) */}
               {visibleStafferSkills.map((stafferSkill) => {
                  const skill = skillsLookup[stafferSkill.skill_id];
                  const isExpanded = expandedSkills.has(
                     stafferSkill.staffer_skill_id
                  );

                  return (
                     <div
                        key={stafferSkill.staffer_skill_id}
                        className="border border-slate-200 rounded-lg bg-white shadow-sm"
                     >
                        {/* Accordion Header */}
                        <div className="flex items-center justify-between p-4">
                           <div className="flex items-center gap-3 flex-1">
                              <button
                                 type="button"
                                 onClick={() =>
                                    toggleSkillExpansion(
                                       stafferSkill.staffer_skill_id
                                    )
                                 }
                                 className="text-slate-400 hover:text-slate-600"
                              >
                                 {isExpanded ? (
                                    <ChevronDown className="w-5 h-5" />
                                 ) : (
                                    <ChevronRight className="w-5 h-5" />
                                 )}
                              </button>

                              <div className="flex-1">
                                 <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-900">
                                       {skill?.skill_name || "Unknown Skill"}
                                    </span>
                                    {skill?.is_certification && (
                                       <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                          Certification 🏆
                                       </span>
                                    )}
                                 </div>
                                 <div className="text-sm text-slate-600 capitalize">
                                    {getPendingUpdateValue(
                                       stafferSkill.staffer_skill_id,
                                       "skill_status",
                                       stafferSkill.skill_status
                                    )}
                                 </div>
                              </div>
                           </div>

                           <button
                              type="button"
                              onClick={() => handleRemoveSkill(stafferSkill)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                           >
                              <X className="w-4 h-4" />
                           </button>
                        </div>

                        {/* Accordion Content */}
                        {isExpanded && (
                           <div className="px-4 pb-4 border-t border-slate-100">
                              <div className="space-y-4 pt-4">
                                 {/* Skill Description */}
                                 <div>
                                    <label className="text-sm font-medium text-slate-700">
                                       Description
                                    </label>
                                    <p className="text-sm text-slate-600 mt-1">
                                       {skill?.skill_description ||
                                          "No description available"}
                                    </p>
                                 </div>

                                 {/* Skill Status */}
                                 <div>
                                    <label className="text-sm font-medium text-slate-700">
                                       Skill Level
                                    </label>
                                    <select
                                       value={getPendingUpdateValue(
                                          stafferSkill.staffer_skill_id,
                                          "skill_status",
                                          stafferSkill.skill_status
                                       )}
                                       onChange={(e) =>
                                          handleSkillUpdate(
                                             stafferSkill.staffer_skill_id,
                                             "skill_status",
                                             e.target.value
                                          )
                                       }
                                       className="mt-1 block w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                       <option value="learning">
                                          Learning
                                       </option>
                                       <option value="competent">
                                          Competent
                                       </option>
                                       <option value="expert">Expert</option>
                                       <option value="certified">
                                          Certified
                                       </option>
                                    </select>
                                 </div>

                                 {/* Certification Dates (only if it's a certification) */}
                                 {skill?.is_certification && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <div>
                                          <label className="text-sm font-medium text-slate-700">
                                             Certification Active Date
                                          </label>
                                          <Input
                                             type="date"
                                             value={getPendingUpdateValue(
                                                stafferSkill.staffer_skill_id,
                                                "certification_active_date",
                                                stafferSkill.certification_active_date
                                             )}
                                             onChange={(e) =>
                                                handleSkillUpdate(
                                                   stafferSkill.staffer_skill_id,
                                                   "certification_active_date",
                                                   e.target.value
                                                )
                                             }
                                             className="mt-1"
                                          />
                                       </div>

                                       <div>
                                          <label className="text-sm font-medium text-slate-700">
                                             Certification Expiry Date
                                          </label>
                                          <Input
                                             type="date"
                                             value={getPendingUpdateValue(
                                                stafferSkill.staffer_skill_id,
                                                "certification_expiry_date",
                                                stafferSkill.certification_expiry_date
                                             )}
                                             onChange={(e) =>
                                                handleSkillUpdate(
                                                   stafferSkill.staffer_skill_id,
                                                   "certification_expiry_date",
                                                   e.target.value
                                                )
                                             }
                                             className="mt-1"
                                          />
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        )}
                     </div>
                  );
               })}

               {/* Pending additions */}
               {pendingAdditions.map((skillId) => {
                  const skill = skillsLookup[skillId];
                  return (
                     <div
                        key={`pending-${skillId}`}
                        className="border-2 border-dashed border-green-300 rounded-lg bg-green-50"
                     >
                        <div className="flex items-center justify-between p-4">
                           <div className="flex items-center gap-3 flex-1">
                              <ChevronRight className="w-5 h-5 text-slate-400" />

                              <div className="flex-1">
                                 <div className="flex items-center gap-2">
                                    <span className="font-medium text-green-900">
                                       {skill?.skill_name || "Unknown Skill"}
                                    </span>
                                    {skill?.is_certification && (
                                       <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                          Certification 🏆
                                       </span>
                                    )}
                                    <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">
                                       pending
                                    </span>
                                 </div>
                                 <div className="text-sm text-green-700">
                                    competent
                                 </div>
                              </div>
                           </div>

                           <button
                              type="button"
                              onClick={() => handleRemovePendingSkill(skillId)}
                              className="text-green-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                           >
                              <X className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  );
               })}

               {(pendingAdditions.length > 0 ||
                  pendingDeletions.length > 0 ||
                  pendingUpdates.length > 0) && (
                  <div className="text-xs text-slate-500 italic">
                     Changes will be applied when you save the staffer
                  </div>
               )}
            </div>
         ) : staffer?.id ? (
            <div className="text-sm text-slate-500">No skills assigned yet</div>
         ) : null}
      </div>
   );
}
