import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
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
      pendingDeletions: string[]
   ) => void;
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
   const skillSearchRef = useRef<HTMLDivElement>(null);

   // Track pending changes (only applied on form submission)
   const [pendingAdditions, setPendingAdditions] = useState<string[]>([]);
   const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);

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
      onSkillsChange?.(pendingAdditions, pendingDeletions);
   }, [pendingAdditions, pendingDeletions, onSkillsChange]);

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

         {/* Current Skills as Chips */}
         {skillsLoading ? (
            <div className="text-sm text-slate-500">Loading skills...</div>
         ) : visibleStafferSkills.length > 0 || pendingAdditions.length > 0 ? (
            <div className="space-y-2">
               <label className="text-sm font-medium text-slate-900">
                  Current Skills
               </label>
               <div className="flex flex-wrap gap-2">
                  {/* Existing skills (not marked for deletion) */}
                  {visibleStafferSkills.map((stafferSkill) => {
                     const skill = skillsLookup[stafferSkill.skill_id];
                     return (
                        <div
                           key={stafferSkill.staffer_skill_id}
                           className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm"
                        >
                           <span>{skill?.skill_name || "Unknown Skill"}</span>
                           <span className="text-xs text-blue-700 capitalize">
                              ({stafferSkill.skill_status.toLowerCase()})
                           </span>
                           {skill?.is_certification && (
                              <span className="text-xs">🏆</span>
                           )}
                           <button
                              type="button"
                              onClick={() => handleRemoveSkill(stafferSkill)}
                              className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                           >
                              <X className="w-3 h-3" />
                           </button>
                        </div>
                     );
                  })}

                  {/* Pending additions */}
                  {pendingAdditions.map((skillId) => {
                     const skill = skillsLookup[skillId];
                     return (
                        <div
                           key={`pending-${skillId}`}
                           className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm border-2 border-dashed border-green-300"
                        >
                           <span>{skill?.skill_name || "Unknown Skill"}</span>
                           <span className="text-xs text-green-700 capitalize">
                              (competent)
                           </span>
                           {skill?.is_certification && (
                              <span className="text-xs">🏆</span>
                           )}
                           <span className="text-xs text-green-600 ml-1">
                              pending
                           </span>
                           <button
                              type="button"
                              onClick={() => handleRemovePendingSkill(skillId)}
                              className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                           >
                              <X className="w-3 h-3" />
                           </button>
                        </div>
                     );
                  })}
               </div>

               {(pendingAdditions.length > 0 ||
                  pendingDeletions.length > 0) && (
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
