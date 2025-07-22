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
import { Calendar, Clock, Edit, Plus, Save, Trash2, X } from "lucide-react";
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
   time_off_start_datetime: string;
   time_off_end_datetime: string;
   time_off_cumulative_hours: number;
}

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

   const [showCreateModal, setShowCreateModal] = useState(false);
   const [editingEntry, setEditingEntry] = useState<StafferTimeOff | null>(
      null
   );
   const [editingPendingId, setEditingPendingId] = useState<string | null>(
      null
   );
   const [formData, setFormData] = useState<TimeOffFormData>({
      time_off_start_datetime: "",
      time_off_end_datetime: "",
      time_off_cumulative_hours: 0,
   });
   const [formError, setFormError] = useState("");

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

   const resetForm = () => {
      setFormData({
         time_off_start_datetime: "",
         time_off_end_datetime: "",
         time_off_cumulative_hours: 0,
      });
      setFormError("");
   };

   const openCreateModal = () => {
      resetForm();
      setEditingEntry(null);
      setEditingPendingId(null);
      setShowCreateModal(true);
   };

   const openEditModal = (entry: StafferTimeOff) => {
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
         time_off_start_datetime: startValue,
         time_off_end_datetime: endValue,
         time_off_cumulative_hours: hoursValue,
      });
      setEditingEntry(entry);
      setEditingPendingId(null);
      setFormError("");
      setShowCreateModal(true);
   };

   const openEditPendingModal = (tempId: string) => {
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
         time_off_start_datetime: startValue,
         time_off_end_datetime: endValue,
         time_off_cumulative_hours: hoursValue,
      });
      setEditingEntry(null);
      setEditingPendingId(tempId);
      setFormError("");
      setShowCreateModal(true);
   };

   const handleCloseModal = () => {
      setShowCreateModal(false);
      resetForm();
      setEditingEntry(null);
      setEditingPendingId(null);
   };

   const validateForm = (): boolean => {
      if (!formData.time_off_start_datetime) {
         setFormError("Start date is required");
         return false;
      }
      if (!formData.time_off_end_datetime) {
         setFormError("End date is required");
         return false;
      }
      if (
         new Date(formData.time_off_start_datetime) >=
         new Date(formData.time_off_end_datetime)
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

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
         return;
      }

      if (editingEntry) {
         // Update existing entry
         handleUpdateTimeOff(
            editingEntry.time_off_id,
            "time_off_start_datetime",
            formData.time_off_start_datetime
         );
         handleUpdateTimeOff(
            editingEntry.time_off_id,
            "time_off_end_datetime",
            formData.time_off_end_datetime
         );
         handleUpdateTimeOff(
            editingEntry.time_off_id,
            "time_off_cumulative_hours",
            formData.time_off_cumulative_hours
         );
      } else if (editingPendingId) {
         // Update pending entry
         handleUpdatePendingTimeOff(
            editingPendingId,
            "time_off_start_datetime",
            formData.time_off_start_datetime
         );
         handleUpdatePendingTimeOff(
            editingPendingId,
            "time_off_end_datetime",
            formData.time_off_end_datetime
         );
         handleUpdatePendingTimeOff(
            editingPendingId,
            "time_off_cumulative_hours",
            formData.time_off_cumulative_hours
         );
      } else {
         // Create new entry
         handleAddTimeOff({
            time_off_start_datetime: formData.time_off_start_datetime,
            time_off_end_datetime: formData.time_off_end_datetime,
            time_off_cumulative_hours: formData.time_off_cumulative_hours,
         });
      }

      handleCloseModal();
   };

   const formatDateTimeLocal = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
   };

   const visibleTimeOffEntries = getVisibleTimeOffEntries();
   const allEntries = [
      ...visibleTimeOffEntries,
      ...pendingTimeOffAdditions.map((pending) => ({
         ...pending,
         time_off_id: pending.tempId,
         isPending: true,
      })),
   ];

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
      <>
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-medium text-slate-900">Time Off</h3>
               <Button
                  type="button"
                  onClick={openCreateModal}
                  size="sm"
                  className="flex items-center gap-2"
               >
                  <Plus className="w-4 h-4" />
                  Add Time Off
               </Button>
            </div>

            {timeOffLoading ? (
               <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-slate-500">
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></div>
                     Loading time off entries...
                  </div>
               </div>
            ) : allEntries.length === 0 ? (
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
               <div className="space-y-3">
                  {allEntries.map((entry) => {
                     const status = getEntryStatus(entry);
                     const isMultiDay =
                        entry.time_off_start_datetime.split("T")[0] !==
                        entry.time_off_end_datetime.split("T")[0];
                     const isPendingEntry =
                        "isPending" in entry && entry.isPending;
                     const canEditEntry = canEdit(entry);

                     return (
                        <div
                           key={entry.time_off_id}
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
                                       {getDurationText(
                                          entry.time_off_cumulative_hours
                                       )}
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
                                                {formatDate(
                                                   entry.time_off_start_datetime
                                                )}{" "}
                                                at{" "}
                                                {formatTime(
                                                   entry.time_off_start_datetime
                                                )}
                                             </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm">
                                             <span className="font-medium text-slate-700">
                                                End:
                                             </span>
                                             <span className="text-slate-600">
                                                {formatDate(
                                                   entry.time_off_end_datetime
                                                )}{" "}
                                                at{" "}
                                                {formatTime(
                                                   entry.time_off_end_datetime
                                                )}
                                             </span>
                                          </div>
                                       </>
                                    ) : (
                                       <div className="flex items-center gap-2 text-sm">
                                          <span className="font-medium text-slate-700">
                                             Date:
                                          </span>
                                          <span className="text-slate-600">
                                             {formatDate(
                                                entry.time_off_start_datetime
                                             )}
                                          </span>
                                          <span className="text-slate-400">
                                             •
                                          </span>
                                          <span className="text-slate-600">
                                             {formatTime(
                                                entry.time_off_start_datetime
                                             )}{" "}
                                             -{" "}
                                             {formatTime(
                                                entry.time_off_end_datetime
                                             )}
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
                                       onClick={() =>
                                          isPendingEntry
                                             ? openEditPendingModal(
                                                  entry.time_off_id
                                               )
                                             : openEditModal(
                                                  entry as StafferTimeOff
                                               )
                                       }
                                       className="p-2"
                                    >
                                       <Edit className="w-3 h-3" />
                                    </Button>
                                 )}

                                 <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                       isPendingEntry
                                          ? handleDeletePendingTimeOff(
                                               entry.time_off_id
                                            )
                                          : handleDeleteTimeOff(
                                               entry.time_off_id
                                            )
                                    }
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                 >
                                    <Trash2 className="w-3 h-3" />
                                 </Button>
                              </div>
                           </div>
                        </div>
                     );
                  })}

                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                     <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">
                           Total Time Off Entries:
                        </span>
                        <span className="text-slate-900">
                           {allEntries.length}
                        </span>
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

         {/* Time Off Form Modal */}
         <Modal isOpen={showCreateModal} onClose={handleCloseModal}>
            <Card className="max-w-2xl w-full">
               <CardHeader>
                  <CardTitle>
                     {editingEntry
                        ? "Edit Time Off Entry"
                        : editingPendingId
                        ? "Edit Pending Time Off"
                        : "Add New Time Off Entry"}
                  </CardTitle>
                  <CardDescription>
                     {editingEntry || editingPendingId
                        ? "Update the time off entry details below"
                        : "Enter the details for the new time off entry"}
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                     {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                           {formError}
                        </div>
                     )}

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label
                              htmlFor="start_datetime"
                              className="text-sm font-medium text-slate-900"
                           >
                              Start Date & Time
                           </label>
                           <Input
                              id="start_datetime"
                              type="datetime-local"
                              value={formatDateTimeLocal(
                                 formData.time_off_start_datetime
                              )}
                              onChange={(e) =>
                                 setFormData((prev) => ({
                                    ...prev,
                                    time_off_start_datetime: new Date(
                                       e.target.value
                                    ).toISOString(),
                                 }))
                              }
                              required
                           />
                        </div>

                        <div className="space-y-2">
                           <label
                              htmlFor="end_datetime"
                              className="text-sm font-medium text-slate-900"
                           >
                              End Date & Time
                           </label>
                           <Input
                              id="end_datetime"
                              type="datetime-local"
                              value={formatDateTimeLocal(
                                 formData.time_off_end_datetime
                              )}
                              onChange={(e) =>
                                 setFormData((prev) => ({
                                    ...prev,
                                    time_off_end_datetime: new Date(
                                       e.target.value
                                    ).toISOString(),
                                 }))
                              }
                              required
                           />
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
                           Enter the total number of hours for this time off
                           period
                        </div>
                     </div>

                     <div className="flex justify-end space-x-4 pt-4">
                        <Button
                           type="button"
                           variant="outline"
                           onClick={handleCloseModal}
                        >
                           <X className="w-4 h-4 mr-2" />
                           Cancel
                        </Button>
                        <Button type="submit">
                           <Save className="w-4 h-4 mr-2" />
                           {editingEntry || editingPendingId
                              ? "Update Entry"
                              : "Add Entry"}
                        </Button>
                     </div>
                  </form>
               </CardContent>
            </Card>
         </Modal>
      </>
   );
}
