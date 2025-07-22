import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Plus, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useEditStaffers } from "../contexts/EditStaffersContext";

export function EditStafferSkills() {
   const {
      allSkills,
      skillsLookup,
      skillSearchQuery,
      filteredSkills,
      showSkillDropdown,
      skillsLoading,
      expandedSkills,
      pendingSkillAdditions,
      pendingSkillDeletions,
      pendingSkillUpdates,
      handleAddSkill,
      handleRemoveSkill,
      handleRemovePendingSkill,
      handleSkillUpdate,
      handlePendingSkillUpdate,
      setSkillSearchQuery,
      setShowSkillDropdown,
      toggleSkillExpansion,
      getPendingUpdateValue,
      getPendingSkillValue,
      getVisibleStafferSkills,
   } = useEditStaffers();

   const skillSearchRef = useRef<HTMLDivElement>(null);

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
   }, [setShowSkillDropdown]);

   const handleSearchFocus = () => {
      setShowSkillDropdown(true);
   };

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSkillSearchQuery(value);
      setShowSkillDropdown(true);
   };

   const visibleStafferSkills = getVisibleStafferSkills();

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

         {/* Current Skills as Accordion Tiles */}
         {skillsLoading ? (
            <div className="text-sm text-slate-500">Loading skills...</div>
         ) : visibleStafferSkills.length > 0 ||
           pendingSkillAdditions.length > 0 ? (
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
               {pendingSkillAdditions.map((skillId) => {
                  const skill = skillsLookup[skillId];
                  const pendingId = `pending-${skillId}`;
                  const isExpanded = expandedSkills.has(pendingId);

                  return (
                     <div
                        key={pendingId}
                        className="border-2 border-dashed border-green-300 rounded-lg bg-green-50"
                     >
                        {/* Accordion Header */}
                        <div className="flex items-center justify-between p-4">
                           <div className="flex items-center gap-3 flex-1">
                              <button
                                 type="button"
                                 onClick={() => toggleSkillExpansion(pendingId)}
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
                                 <div className="text-sm text-green-700 capitalize">
                                    {getPendingSkillValue(
                                       skillId,
                                       "skill_status"
                                    ) || "competent"}
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

                        {/* Accordion Content for Pending Skills */}
                        {isExpanded && (
                           <div className="px-4 pb-4 border-t border-green-200">
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
                                       value={
                                          getPendingSkillValue(
                                             skillId,
                                             "skill_status"
                                          ) || "competent"
                                       }
                                       onChange={(e) =>
                                          handlePendingSkillUpdate(
                                             skillId,
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
                                             value={getPendingSkillValue(
                                                skillId,
                                                "certification_active_date"
                                             )}
                                             onChange={(e) =>
                                                handlePendingSkillUpdate(
                                                   skillId,
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
                                             value={getPendingSkillValue(
                                                skillId,
                                                "certification_expiry_date"
                                             )}
                                             onChange={(e) =>
                                                handlePendingSkillUpdate(
                                                   skillId,
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

               {(pendingSkillAdditions.length > 0 ||
                  pendingSkillDeletions.length > 0 ||
                  pendingSkillUpdates.length > 0) && (
                  <div className="text-xs text-slate-500 italic">
                     Changes will be applied when you save the staffer
                  </div>
               )}
            </div>
         ) : (
            <div className="text-sm text-slate-500">No skills assigned yet</div>
         )}
      </div>
   );
}
