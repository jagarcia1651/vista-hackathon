import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Clock, Edit, Trash2 } from "lucide-react";
import { StafferTimeOff } from "../../../../../../shared/schemas/typescript/staffer";

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

interface TimeOffEntryProps {
   entry: TimeOffEntryData;
   isEditing: boolean;
   canEdit: boolean;
   onEdit: () => void;
   onDelete: () => void;
   children?: React.ReactNode; // For inline edit form
}

export function TimeOffEntry({
   entry,
   isEditing,
   canEdit,
   onEdit,
   onDelete,
   children,
}: TimeOffEntryProps) {
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

   const isCurrent = (startDate: string, endDate: string) => {
      const now = new Date();
      return new Date(startDate) <= now && new Date(endDate) >= now;
   };

   const isUpcoming = (startDate: string) => {
      return new Date(startDate) > new Date();
   };

   const getEntryStatus = (entry: {
      time_off_start_datetime: string;
      time_off_end_datetime: string;
   }) => {
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

   const status = getEntryStatus(entry);
   const isMultiDay =
      entry.time_off_start_datetime.split("T")[0] !==
      entry.time_off_end_datetime.split("T")[0];
   const isPendingEntry = "isPending" in entry && entry.isPending;

   return (
      <div>
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
                                 {formatDate(entry.time_off_start_datetime)} at{" "}
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
                     <div className="text-xs text-slate-500">Total Hours</div>
                  </div>

                  {canEdit && (
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onEdit}
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
                     onClick={onDelete}
                     className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                     <Trash2 className="w-3 h-3" />
                  </Button>
               </div>
            </div>
         </div>

         {/* Inline edit form when editing */}
         {isEditing && children && <div className="mt-2">{children}</div>}
      </div>
   );
}
