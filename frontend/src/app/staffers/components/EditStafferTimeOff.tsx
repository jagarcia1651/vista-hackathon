import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Calendar,
   Check,
   ChevronDown,
   ChevronRight,
   ChevronUp,
   Clock,
   Edit,
   Plus,
   Trash2,
   X,
} from "lucide-react";
import { useState } from "react";
import {
   Staffer,
   StafferTimeOff,
} from "../../../../../shared/schemas/typescript/staffer";
import { useEditStaffers } from "../contexts/EditStaffersContext";

interface EditStafferTimeOffProps {
   staffer: Staffer | null;
}

interface TimeOffFormData {
   time_off_start_date: string;
   time_off_end_date: string;
   time_off_cumulative_hours: number;
}

interface PendingTimeOffEntry {
   time_off_id: string;
   staffer_id: string;
   time_off_start_datetime: string;
   time_off_end_datetime: string;
   time_off_cumulative_hours: number;
   isPending: true;
   tempId: string;
}

type TimeOffEntryData = StafferTimeOff | PendingTimeOffEntry;

export function EditStafferTimeOff({ staffer }: EditStafferTimeOffProps) {
   const {
      timeOffEntries,
      pendingTimeOffAdditions,
      pendingTimeOffDeletions,
      pendingTimeOffUpdates,
      timeOffLoading,
      handleAddTimeOff,
      handleUpdateTimeOff,
      handleDeleteTimeOff,
      handleDeletePendingTimeOff,
      handleUpdatePendingTimeOff,
      getVisibleTimeOffEntries,
      getPendingTimeOffUpdateValue,
      getPendingTimeOffValue,
   } = useEditStaffers();

   const [showCreateForm, setShowCreateForm] = useState(false);
   const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
   const [editingPendingId, setEditingPendingId] = useState<string | null>(
      null
   );
   const [formData, setFormData] = useState<TimeOffFormData>({
      time_off_start_date: "",
      time_off_end_date: "",
      time_off_cumulative_hours: 0,
   });
   const [formError, setFormError] = useState("");
   const [isPastSectionCollapsed, setIsPastSectionCollapsed] = useState(true); // Past section collapsed by default

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
         year: "numeric",
      });
   };

   const formatTime = (dateString: string) => {
      return new Date(dateString).toLocaleTimeString("en-US", {
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   const getDurationText = (hours: number) => {
      if (hours < 8) {
         return `${hours}h`;
      } else {
         const days = Math.floor(hours / 8);
         const remainingHours = hours % 8;
         if (remainingHours === 0) {
            return `${days} day${days !== 1 ? "s" : ""}`;
         } else {
            return `${days} day${days !== 1 ? "s" : ""}, ${remainingHours}h`;
         }
      }
   };

   const isUpcoming = (startDate: string) => {
      return new Date(startDate) > new Date();
   };

   const isPast = (endDate: string) => {
      return new Date(endDate) < new Date();
   };

   const isCurrent = (startDate: string, endDate: string) => {
      const now = new Date();
      return new Date(startDate) <= now && new Date(endDate) >= now;
   };

   const getEntryStatus = (
      entry:
         | StafferTimeOff
         | { time_off_start_datetime: string; time_off_end_datetime: string }
   ) => {
      if (
         isCurrent(entry.time_off_start_datetime, entry.time_off_end_datetime)
      ) {
         return { text: "Active", color: "text-green-700 bg-green-100" };
      } else if (isUpcoming(entry.time_off_start_datetime)) {
         return { text: "Upcoming", color: "text-blue-700 bg-blue-100" };
      } else {
         return { text: "Past", color: "text-slate-600 bg-slate-100" };
      }
   };

   const canEdit = (
      entry: StafferTimeOff | { time_off_end_datetime: string }
   ) => {
      return !isPast(entry.time_off_end_datetime);
   };

   // Helper functions to convert between date strings and datetime strings
   const dateToStartDateTime = (dateString: string) => {
      if (!dateString) return "";
      return `${dateString}T00:00:00.000Z`;
   };

   const dateToEndDateTime = (dateString: string) => {
      if (!dateString) return "";
      return `${dateString}T23:59:59.999Z`;
   };

   const dateTimeToDate = (dateTimeString: string) => {
      if (!dateTimeString) return "";
      return dateTimeString.split("T")[0];
   };

   const resetForm = () => {
      setFormData({
         time_off_start_date: "",
         time_off_end_date: "",
         time_off_cumulative_hours: 0,
      });
      setFormError("");
   };

   const openCreateForm = () => {
      resetForm();
      setEditingEntryId(null);
      setEditingPendingId(null);
      setShowCreateForm(true);
   };

   const closeCreateForm = () => {
      setShowCreateForm(false);
      resetForm();
   };

   const openEditForm = (entry: StafferTimeOff) => {
      const startValue = getPendingTimeOffUpdateValue(
         entry.time_off_id,
         "time_off_start_datetime",
         entry.time_off_start_datetime
      ) as string;
      const endValue = getPendingTimeOffUpdateValue(
         entry.time_off_id,
         "time_off_end_datetime",
         entry.time_off_end_datetime
      ) as string;
      const hoursValue = getPendingTimeOffUpdateValue(
         entry.time_off_id,
         "time_off_cumulative_hours",
         entry.time_off_cumulative_hours
      ) as number;

      setFormData({
         time_off_start_date: dateTimeToDate(startValue),
         time_off_end_date: dateTimeToDate(endValue),
         time_off_cumulative_hours: hoursValue,
      });
      setEditingEntryId(entry.time_off_id);
      setEditingPendingId(null);
      setFormError("");
   };

   const openEditPendingForm = (tempId: string) => {
      const startValue = getPendingTimeOffValue(
         tempId,
         "time_off_start_datetime"
      ) as string;
      const endValue = getPendingTimeOffValue(
         tempId,
         "time_off_end_datetime"
      ) as string;
      const hoursValue = getPendingTimeOffValue(
         tempId,
         "time_off_cumulative_hours"
      ) as number;

      setFormData({
         time_off_start_date: dateTimeToDate(startValue),
         time_off_end_date: dateTimeToDate(endValue),
         time_off_cumulative_hours: hoursValue,
      });
      setEditingEntryId(null);
      setEditingPendingId(tempId);
      setFormError("");
   };

   const closeEditForm = () => {
      setEditingEntryId(null);
      setEditingPendingId(null);
      resetForm();
   };

   const validateForm = (): boolean => {
      if (!formData.time_off_start_date) {
         setFormError("Start date is required");
         return false;
      }
      if (!formData.time_off_end_date) {
         setFormError("End date is required");
         return false;
      }
      if (
         new Date(formData.time_off_start_date) >=
         new Date(formData.time_off_end_date)
      ) {
         setFormError("End date must be after start date");
         return false;
      }
      if (formData.time_off_cumulative_hours <= 0) {
         setFormError("Hours must be greater than 0");
         return false;
      }
      return true;
   };

   const handleApply = () => {
      if (!validateForm()) {
         return;
      }

      const startDateTime = dateToStartDateTime(formData.time_off_start_date);
      const endDateTime = dateToEndDateTime(formData.time_off_end_date);

      if (editingEntryId) {
         // Update existing entry
         handleUpdateTimeOff(
            editingEntryId,
            "time_off_start_datetime",
            startDateTime
         );
         handleUpdateTimeOff(
            editingEntryId,
            "time_off_end_datetime",
            endDateTime
         );
         handleUpdateTimeOff(
            editingEntryId,
            "time_off_cumulative_hours",
            formData.time_off_cumulative_hours
         );
         closeEditForm();
      } else if (editingPendingId) {
         // Update pending entry
         handleUpdatePendingTimeOff(
            editingPendingId,
            "time_off_start_datetime",
            startDateTime
         );
         handleUpdatePendingTimeOff(
            editingPendingId,
            "time_off_end_datetime",
            endDateTime
         );
         handleUpdatePendingTimeOff(
            editingPendingId,
            "time_off_cumulative_hours",
            formData.time_off_cumulative_hours
         );
         closeEditForm();
      } else {
         // Create new entry
         handleAddTimeOff({
            time_off_start_datetime: startDateTime,
            time_off_end_datetime: endDateTime,
            time_off_cumulative_hours: formData.time_off_cumulative_hours,
         });
         closeCreateForm();
      }
   };

   const TimeOffForm = ({ isCreate = false }: { isCreate?: boolean }) => (
      <div
         className={`border rounded-lg p-4 space-y-4 ${
            isCreate
               ? "border-blue-300 bg-blue-50"
               : "border-slate-200 bg-slate-50"
         }`}
      >
         <div className="space-y-4">
            {formError && (
               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {formError}
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label
                     htmlFor="start_date"
                     className="text-sm font-medium text-slate-900"
                  >
                     Start Date
                  </label>
                  <Input
                     id="start_date"
                     type="date"
                     value={formData.time_off_start_date}
                     onChange={(e) =>
                        setFormData((prev) => ({
                           ...prev,
                           time_off_start_date: e.target.value,
                        }))
                     }
                     required
                  />
                  <div className="text-xs text-slate-500">
                     Time will be set to midnight (start of day)
                  </div>
               </div>

               <div className="space-y-2">
                  <label
                     htmlFor="end_date"
                     className="text-sm font-medium text-slate-900"
                  >
                     End Date
                  </label>
                  <Input
                     id="end_date"
                     type="date"
                     value={formData.time_off_end_date}
                     onChange={(e) =>
                        setFormData((prev) => ({
                           ...prev,
                           time_off_end_date: e.target.value,
                        }))
                     }
                     required
                  />
                  <div className="text-xs text-slate-500">
                     Time will be set to 11:59 PM (end of day)
                  </div>
               </div>
            </div>

            <div className="space-y-2">
               <label
                  htmlFor="cumulative_hours"
                  className="text-sm font-medium text-slate-900"
               >
                  Total Hours
               </label>
               <Input
                  id="cumulative_hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.time_off_cumulative_hours}
                  onChange={(e) =>
                     setFormData((prev) => ({
                        ...prev,
                        time_off_cumulative_hours:
                           parseFloat(e.target.value) || 0,
                     }))
                  }
                  placeholder="8"
                  required
               />
               <div className="text-xs text-slate-500">
                  Enter the total number of hours for this time off period
               </div>
            </div>

            <div className="flex justify-end space-x-2">
               <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isCreate ? closeCreateForm : closeEditForm}
               >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
               </Button>
               <Button type="button" size="sm" onClick={handleApply}>
                  <Check className="w-3 h-3 mr-1" />
                  Apply
               </Button>
            </div>
         </div>
      </div>
   );

   const TimeOffEntry = ({ entry }: { entry: TimeOffEntryData }) => {
      const status = getEntryStatus(entry);
      const isMultiDay =
         entry.time_off_start_datetime.split("T")[0] !==
         entry.time_off_end_datetime.split("T")[0];
      const isPendingEntry = "isPending" in entry && entry.isPending;
      const canEditEntry = canEdit(entry);
      const isEditing =
         editingEntryId === entry.time_off_id ||
         editingPendingId === entry.time_off_id;

      return (
         <div key={entry.time_off_id}>
            <div
               className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                  isPendingEntry
                     ? "border-2 border-dashed border-green-300 bg-green-50"
                     : "border-slate-200 bg-white"
               }`}
            >
               <div className="flex items-start justify-between">
                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                        <span
                           className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                        >
                           {status.text}
                        </span>
                        {isPendingEntry && (
                           <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-200">
                              pending
                           </span>
                        )}
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                           <Clock className="w-3 h-3" />
                           {getDurationText(entry.time_off_cumulative_hours)}
                        </div>
                     </div>

                     <div className="space-y-1">
                        {isMultiDay ? (
                           <>
                              <div className="flex items-center gap-2 text-sm">
                                 <span className="font-medium text-slate-700">
                                    Start:
                                 </span>
                                 <span className="text-slate-600">
                                    {formatDate(entry.time_off_start_datetime)}{" "}
                                    at{" "}
                                    {formatTime(entry.time_off_start_datetime)}
                                 </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                 <span className="font-medium text-slate-700">
                                    End:
                                 </span>
                                 <span className="text-slate-600">
                                    {formatDate(entry.time_off_end_datetime)} at{" "}
                                    {formatTime(entry.time_off_end_datetime)}
                                 </span>
                              </div>
                           </>
                        ) : (
                           <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-slate-700">
                                 Date:
                              </span>
                              <span className="text-slate-600">
                                 {formatDate(entry.time_off_start_datetime)}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">
                                 {formatTime(entry.time_off_start_datetime)} -{" "}
                                 {formatTime(entry.time_off_end_datetime)}
                              </span>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <div className="text-right mr-2">
                        <div className="text-lg font-semibold text-slate-900">
                           {entry.time_off_cumulative_hours}h
                        </div>
                        <div className="text-xs text-slate-500">
                           Total Hours
                        </div>
                     </div>

                     {canEditEntry && (
                        <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() => {
                              if (isEditing) {
                                 closeEditForm();
                              } else {
                                 isPendingEntry
                                    ? openEditPendingForm(entry.time_off_id)
                                    : openEditForm(entry as StafferTimeOff);
                              }
                           }}
                           className="p-2"
                        >
                           {isEditing ? (
                              <ChevronUp className="w-3 h-3" />
                           ) : (
                              <>
                                 <Edit className="w-3 h-3 mr-1" />
                                 <ChevronDown className="w-3 h-3" />
                              </>
                           )}
                        </Button>
                     )}

                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                           isPendingEntry
                              ? handleDeletePendingTimeOff(entry.time_off_id)
                              : handleDeleteTimeOff(entry.time_off_id)
                        }
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                     >
                        <Trash2 className="w-3 h-3" />
                     </Button>
                  </div>
               </div>
            </div>

            {/* Edit Form - Show inline below entry when editing */}
            {isEditing && (
               <div className="mt-2">
                  <TimeOffForm />
               </div>
            )}
         </div>
      );
   };

   const visibleTimeOffEntries = getVisibleTimeOffEntries();
   const allEntries: TimeOffEntryData[] = [
      ...visibleTimeOffEntries,
      ...pendingTimeOffAdditions.map((pending) => ({
         ...pending,
         time_off_id: pending.tempId,
         isPending: true as const,
      })),
   ];

   // Separate entries into past and upcoming/active
   const pastEntries = allEntries.filter((entry) =>
      isPast(entry.time_off_end_datetime)
   );
   const upcomingEntries = allEntries.filter(
      (entry) => !isPast(entry.time_off_end_datetime)
   );

   if (!staffer) {
      return (
         <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Time Off</h3>
            <div className="text-sm text-slate-500 italic">
               Select a staffer to view their time off entries
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900">Time Off</h3>
            <Button
               type="button"
               onClick={openCreateForm}
               size="sm"
               className="flex items-center gap-2"
            >
               <Plus className="w-4 h-4" />
               Add Time Off
            </Button>
         </div>

         {/* Create Form - Show inline below header when creating */}
         {showCreateForm && <TimeOffForm isCreate />}

         {timeOffLoading ? (
            <div className="flex items-center justify-center py-8">
               <div className="flex items-center gap-2 text-slate-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></div>
                  Loading time off entries...
               </div>
            </div>
         ) : allEntries.length === 0 && !showCreateForm ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg">
               <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
               <div className="text-slate-600 font-medium mb-1">
                  No time off entries found
               </div>
               <div className="text-sm text-slate-500">
                  This staffer has no scheduled time off
               </div>
            </div>
         ) : (
            <div className="space-y-6">
               {/* Upcoming/Active Section */}
               {upcomingEntries.length > 0 && (
                  <div className="space-y-3">
                     <div className="flex items-center gap-2">
                        <h4 className="text-md font-medium text-slate-900">
                           Upcoming & Active
                        </h4>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                           {upcomingEntries.length}
                        </span>
                     </div>
                     <div className="space-y-3">
                        {upcomingEntries.map((entry) => (
                           <TimeOffEntry
                              key={entry.time_off_id}
                              entry={entry}
                           />
                        ))}
                     </div>
                  </div>
               )}

               {/* Past Section - Collapsible */}
               {pastEntries.length > 0 && (
                  <div className="space-y-3">
                     <button
                        type="button"
                        onClick={() =>
                           setIsPastSectionCollapsed(!isPastSectionCollapsed)
                        }
                        className="flex items-center gap-2 text-md font-medium text-slate-900 hover:text-slate-700 transition-colors"
                     >
                        {isPastSectionCollapsed ? (
                           <ChevronRight className="w-4 h-4" />
                        ) : (
                           <ChevronDown className="w-4 h-4" />
                        )}
                        Past
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                           {pastEntries.length}
                        </span>
                     </button>

                     {!isPastSectionCollapsed && (
                        <div className="space-y-3">
                           {pastEntries.map((entry) => (
                              <TimeOffEntry
                                 key={entry.time_off_id}
                                 entry={entry}
                              />
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {/* Summary Section */}
               <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                     <span className="font-medium text-slate-700">
                        Total Time Off Entries:
                     </span>
                     <span className="text-slate-900">{allEntries.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                     <span className="font-medium text-slate-700">
                        Total Hours This Year:
                     </span>
                     <span className="text-slate-900 font-semibold">
                        {allEntries.reduce(
                           (sum, entry) =>
                              sum + entry.time_off_cumulative_hours,
                           0
                        )}
                        h
                     </span>
                  </div>
                  {(pendingTimeOffAdditions.length > 0 ||
                     pendingTimeOffDeletions.length > 0 ||
                     pendingTimeOffUpdates.length > 0) && (
                     <div className="text-xs text-amber-600 mt-2">
                        Changes will be applied when you save the staffer
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
}
