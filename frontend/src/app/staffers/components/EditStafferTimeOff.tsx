import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
   Staffer,
   StafferTimeOff,
} from "../../../../../shared/schemas/typescript/staffer";
import { useEditStaffers } from "../contexts/EditStaffersContext";
import {
   PendingTimeOffEntry,
   TimeOffEmptyState,
   TimeOffEntry,
   TimeOffForm,
   TimeOffFormData,
   TimeOffLoadingState,
   TimeOffSectionHeader,
   TimeOffSummary,
} from "./TimeOff";

interface EditStafferTimeOffProps {
   staffer: Staffer | null;
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
   const [isPastSectionCollapsed, setIsPastSectionCollapsed] = useState(true);

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

   const isPast = (endDate: string) => {
      return new Date(endDate) < new Date();
   };

   const canEdit = (
      entry: StafferTimeOff | { time_off_end_datetime: string }
   ) => {
      return !isPast(entry.time_off_end_datetime);
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

   const handleEntryEdit = (entry: TimeOffEntryData) => {
      const isEditing =
         editingEntryId === entry.time_off_id ||
         editingPendingId === entry.time_off_id;

      if (isEditing) {
         closeEditForm();
      } else {
         const isPendingEntry = "isPending" in entry && entry.isPending;
         if (isPendingEntry) {
            openEditPendingForm(entry.time_off_id);
         } else {
            openEditForm(entry as StafferTimeOff);
         }
      }
   };

   const handleEntryDelete = (entry: TimeOffEntryData) => {
      const isPendingEntry = "isPending" in entry && entry.isPending;
      if (isPendingEntry) {
         handleDeletePendingTimeOff(entry.time_off_id);
      } else {
         handleDeleteTimeOff(entry.time_off_id);
      }
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

   // Calculate totals
   const totalHours = allEntries.reduce(
      (sum, entry) => sum + entry.time_off_cumulative_hours,
      0
   );
   const hasPendingChanges =
      pendingTimeOffAdditions.length > 0 ||
      pendingTimeOffDeletions.length > 0 ||
      pendingTimeOffUpdates.length > 0;

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

         {/* Create Form */}
         {showCreateForm && (
            <TimeOffForm
               formData={formData}
               formError={formError}
               isCreate={true}
               onFormDataChange={setFormData}
               onCancel={closeCreateForm}
               onApply={handleApply}
            />
         )}

         {timeOffLoading ? (
            <TimeOffLoadingState />
         ) : allEntries.length === 0 && !showCreateForm ? (
            <TimeOffEmptyState />
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
                              isEditing={
                                 editingEntryId === entry.time_off_id ||
                                 editingPendingId === entry.time_off_id
                              }
                              canEdit={canEdit(entry)}
                              onEdit={() => handleEntryEdit(entry)}
                              onDelete={() => handleEntryDelete(entry)}
                           >
                              {(editingEntryId === entry.time_off_id ||
                                 editingPendingId === entry.time_off_id) && (
                                 <TimeOffForm
                                    formData={formData}
                                    formError={formError}
                                    onFormDataChange={setFormData}
                                    onCancel={closeEditForm}
                                    onApply={handleApply}
                                 />
                              )}
                           </TimeOffEntry>
                        ))}
                     </div>
                  </div>
               )}

               {/* Past Section - Collapsible */}
               {pastEntries.length > 0 && (
                  <div className="space-y-3">
                     <TimeOffSectionHeader
                        title="Past"
                        count={pastEntries.length}
                        isCollapsed={isPastSectionCollapsed}
                        onToggle={() =>
                           setIsPastSectionCollapsed(!isPastSectionCollapsed)
                        }
                        badgeColor="bg-slate-100 text-slate-600"
                     />

                     {!isPastSectionCollapsed && (
                        <div className="space-y-3">
                           {pastEntries.map((entry) => (
                              <TimeOffEntry
                                 key={entry.time_off_id}
                                 entry={entry}
                                 isEditing={
                                    editingEntryId === entry.time_off_id ||
                                    editingPendingId === entry.time_off_id
                                 }
                                 canEdit={canEdit(entry)}
                                 onEdit={() => handleEntryEdit(entry)}
                                 onDelete={() => handleEntryDelete(entry)}
                              >
                                 {(editingEntryId === entry.time_off_id ||
                                    editingPendingId === entry.time_off_id) && (
                                    <TimeOffForm
                                       formData={formData}
                                       formError={formError}
                                       onFormDataChange={setFormData}
                                       onCancel={closeEditForm}
                                       onApply={handleApply}
                                    />
                                 )}
                              </TimeOffEntry>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {/* Summary Section */}
               <TimeOffSummary
                  totalEntries={allEntries.length}
                  totalHours={totalHours}
                  hasPendingChanges={hasPendingChanges}
               />
            </div>
         )}
      </div>
   );
}
