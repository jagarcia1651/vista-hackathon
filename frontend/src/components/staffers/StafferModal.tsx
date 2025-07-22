"use client";

import { useStaffers } from "@/app/staffers/contexts/StaffersContext";
import { skillsService } from "@/app/staffers/services/skillsService";
import { CreateStafferData } from "@/app/staffers/services/stafferService";
import {
   StafferSkillWithDetails,
   staffersSkillsService,
} from "@/app/staffers/services/staffersSkillsService";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Skill, Staffer } from "../../../../shared/schemas/typescript/staffer";

interface StafferModalProps {
   isOpen: boolean;
   onClose: () => void;
   staffer?: Staffer | null;
   onSuccess: () => void;
}

export function StafferModal({
   isOpen,
   onClose,
   staffer = null,
   onSuccess,
}: StafferModalProps) {
   const { seniorities, createStaffer, updateStaffer } = useStaffers();

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   // Skills state
   const [allSkills, setAllSkills] = useState<Skill[]>([]);
   const [stafferSkills, setStafferSkills] = useState<
      StafferSkillWithDetails[]
   >([]);
   const [skillSearchQuery, setSkillSearchQuery] = useState("");
   const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
   const [showSkillDropdown, setShowSkillDropdown] = useState(false);
   const [skillsLoading, setSkillsLoading] = useState(false);
   const skillSearchRef = useRef<HTMLDivElement>(null);

   const [formData, setFormData] = useState<CreateStafferData>({
      first_name: "",
      last_name: "",
      email: "",
      time_zone: "",
      title: "",
      seniority_id: "",
      capacity: 40,
   });

   // Load all skills on mount
   useEffect(() => {
      const loadSkills = async () => {
         const { data, error } = await skillsService.getAllSkills();
         if (data && !error) {
            setAllSkills(data);
         }
      };
      loadSkills();
   }, []);

   // Load staffer skills when staffer changes
   useEffect(() => {
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

   // Filter skills based on search query and exclude already assigned skills
   useEffect(() => {
      if (!skillSearchQuery.trim()) {
         setFilteredSkills([]);
         setShowSkillDropdown(false);
         return;
      }

      const assignedSkillIds = stafferSkills.map((ss) => ss.skill_id);
      const filtered = allSkills.filter(
         (skill) =>
            !assignedSkillIds.includes(skill.skill_id) &&
            (skill.skill_name
               .toLowerCase()
               .includes(skillSearchQuery.toLowerCase()) ||
               skill.skill_description
                  .toLowerCase()
                  .includes(skillSearchQuery.toLowerCase()))
      );

      setFilteredSkills(filtered.slice(0, 10)); // Limit to 10 results
      setShowSkillDropdown(filtered.length > 0);
   }, [skillSearchQuery, allSkills, stafferSkills]);

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

   // Reset form when modal opens/closes or staffer changes
   useEffect(() => {
      if (isOpen) {
         if (staffer) {
            // Populate form with existing staffer data
            setFormData({
               first_name: staffer.first_name || "",
               last_name: staffer.last_name || "",
               email: staffer.email || "",
               time_zone: staffer.time_zone || "",
               title: staffer.title || "",
               seniority_id: staffer.seniority_id || "",
               capacity: staffer.capacity || 40,
            });
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
         }
         setError("");
         setSkillSearchQuery("");
         setShowSkillDropdown(false);
      }
   }, [staffer, isOpen]);

   const handleInputChange = (
      field: keyof CreateStafferData,
      value: string | number
   ) => {
      setFormData((prev) => ({
         ...prev,
         [field]: value,
      }));
   };

   const handleAddSkill = async (skill: Skill) => {
      if (!staffer?.id) {
         // For new staffers, we'll add this after creation
         // For now, just close the dropdown and clear search
         setSkillSearchQuery("");
         setShowSkillDropdown(false);
         return;
      }

      try {
         const { data, error } = await staffersSkillsService.createStafferSkill(
            {
               staffer_id: staffer.id,
               skill_id: skill.skill_id,
               skill_status: "competent", // Default status
            }
         );

         if (data && !error) {
            // Reload staffer skills to get the updated list with details
            const { data: updatedSkills } =
               await staffersSkillsService.getSkillsForStaffer(staffer.id);
            if (updatedSkills) {
               setStafferSkills(updatedSkills);
            }
         }
      } catch (err) {
         console.error("Error adding skill:", err);
      }

      setSkillSearchQuery("");
      setShowSkillDropdown(false);
   };

   const handleRemoveSkill = async (stafferSkill: StafferSkillWithDetails) => {
      if (!staffer?.id) return;

      try {
         const { success } = await staffersSkillsService.deleteStafferSkill(
            stafferSkill.staffer_skill_id
         );

         if (success) {
            setStafferSkills((prev) =>
               prev.filter(
                  (ss) => ss.staffer_skill_id !== stafferSkill.staffer_skill_id
               )
            );
         }
      } catch (err) {
         console.error("Error removing skill:", err);
      }
   };

   const validateForm = (): boolean => {
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
         // Clean up the form data - remove empty fields if not provided
         const cleanedData = {
            ...formData,
            time_zone: formData.time_zone?.trim() || undefined,
            seniority_id: formData.seniority_id?.trim() || undefined,
         };

         let success = false;

         if (staffer?.id) {
            // Update existing staffer
            success = await updateStaffer({
               id: staffer.id,
               ...cleanedData,
            });
         } else {
            // Create new staffer
            success = await createStaffer(cleanedData);
         }

         if (success) {
            onSuccess();
            onClose();
         }
         // If not successful, error will be displayed from context
      } catch (err) {
         setError("An unexpected error occurred");
      } finally {
         setLoading(false);
      }
   };

   return (
      <Modal isOpen={isOpen} onClose={onClose}>
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
                  <div className="space-y-4">
                     <h3 className="text-lg font-medium text-slate-900">
                        Basic Information
                     </h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                           Email Address
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
                           htmlFor="title"
                           className="text-sm font-medium text-slate-900"
                        >
                           Job Title
                        </label>
                        <Input
                           id="title"
                           type="text"
                           value={formData.title}
                           onChange={(e) =>
                              handleInputChange("title", e.target.value)
                           }
                           placeholder="Software Engineer"
                           required
                        />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label
                              htmlFor="time_zone"
                              className="text-sm font-medium text-slate-900"
                           >
                              Time Zone{" "}
                              <span className="text-slate-500 font-normal">
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
                              htmlFor="seniority_id"
                              className="text-sm font-medium text-slate-900"
                           >
                              Seniority Level{" "}
                              <span className="text-slate-500 font-normal">
                                 (optional)
                              </span>
                           </label>
                           {seniorities.length === 0 ? (
                              <div className="text-sm text-slate-500">
                                 Loading seniorities...
                              </div>
                           ) : (
                              <select
                                 id="seniority_id"
                                 value={formData.seniority_id || ""}
                                 onChange={(e) =>
                                    handleInputChange(
                                       "seniority_id",
                                       e.target.value
                                    )
                                 }
                                 className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                 <option value="">
                                    Select seniority level
                                 </option>
                                 {seniorities.map((seniority) => (
                                    <option
                                       key={seniority.seniority_id}
                                       value={seniority.seniority_id}
                                    >
                                       {seniority.seniority_name}
                                    </option>
                                 ))}
                              </select>
                           )}
                        </div>
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
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-4">
                     <h3 className="text-lg font-medium text-slate-900">
                        Skills
                     </h3>

                     {/* Skills Search Bar */}
                     <div className="relative" ref={skillSearchRef}>
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                           <Input
                              type="text"
                              placeholder="Search and add skills..."
                              value={skillSearchQuery}
                              onChange={(e) =>
                                 setSkillSearchQuery(e.target.value)
                              }
                              className="pl-10"
                              disabled={!staffer?.id && !!staffer}
                           />
                        </div>

                        {/* Skills Dropdown */}
                        {showSkillDropdown && (
                           <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {filteredSkills.length > 0 ? (
                                 filteredSkills.map((skill) => (
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
                                             <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                Certification
                                             </span>
                                          )}
                                       </div>
                                    </button>
                                 ))
                              ) : (
                                 <div className="px-4 py-2 text-slate-500">
                                    No skills found
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
                        <div className="text-sm text-slate-500">
                           Loading skills...
                        </div>
                     ) : stafferSkills.length > 0 ? (
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-900">
                              Current Skills
                           </label>
                           <div className="flex flex-wrap gap-2">
                              {stafferSkills.map((stafferSkill) => (
                                 <div
                                    key={stafferSkill.staffer_skill_id}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm"
                                 >
                                    <span>
                                       {stafferSkill.skill?.skill_name}
                                    </span>
                                    <span className="text-xs text-blue-700 capitalize">
                                       (
                                       {stafferSkill.skill_status.toLowerCase()}
                                       )
                                    </span>
                                    {stafferSkill.skill?.is_certification && (
                                       <span className="text-xs">🏆</span>
                                    )}
                                    <button
                                       type="button"
                                       onClick={() =>
                                          handleRemoveSkill(stafferSkill)
                                       }
                                       className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                                    >
                                       <X className="w-3 h-3" />
                                    </button>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ) : staffer?.id ? (
                        <div className="text-sm text-slate-500">
                           No skills assigned yet
                        </div>
                     ) : null}
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
      </Modal>
   );
}
