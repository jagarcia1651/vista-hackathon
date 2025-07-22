import { AlertCircle, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import {
   Staffer,
   StafferTimeOff,
} from "../../../../../shared/schemas/typescript/staffer";
import { stafferTimeOffService } from "../services/stafferTimeOffService";

interface EditStafferTimeOffProps {
   staffer: Staffer | null;
}

export function EditStafferTimeOff({ staffer }: EditStafferTimeOffProps) {
   const [timeOffEntries, setTimeOffEntries] = useState<StafferTimeOff[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const loadTimeOff = async () => {
         if (!staffer?.id) {
            setTimeOffEntries([]);
            return;
         }

         setLoading(true);
         setError(null);

         try {
            const { data, error } =
               await stafferTimeOffService.getStafferTimeOff(staffer.id);

            if (error) {
               setError(error);
            } else if (data) {
               setTimeOffEntries(data);
            }
         } catch (err) {
            setError(
               err instanceof Error
                  ? err.message
                  : "Failed to load time off entries"
            );
         } finally {
            setLoading(false);
         }
      };

      loadTimeOff();
   }, [staffer?.id]);

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

   const getEntryStatus = (entry: StafferTimeOff) => {
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
         </div>

         {loading ? (
            <div className="flex items-center justify-center py-8">
               <div className="flex items-center gap-2 text-slate-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></div>
                  Loading time off entries...
               </div>
            </div>
         ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
               <AlertCircle className="w-4 h-4 text-red-500" />
               <span className="text-sm text-red-700">{error}</span>
            </div>
         ) : timeOffEntries.length === 0 ? (
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
               {timeOffEntries.map((entry) => {
                  const status = getEntryStatus(entry);
                  const isMultiDay =
                     entry.time_off_start_datetime.split("T")[0] !==
                     entry.time_off_end_datetime.split("T")[0];

                  return (
                     <div
                        key={entry.time_off_id}
                        className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                     >
                        <div className="flex items-start justify-between">
                           <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                 <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                                 >
                                    {status.text}
                                 </span>
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
                                       <span className="text-slate-400">•</span>
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

                           <div className="text-right">
                              <div className="text-lg font-semibold text-slate-900">
                                 {entry.time_off_cumulative_hours}h
                              </div>
                              <div className="text-xs text-slate-500">
                                 Total Hours
                              </div>
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
                        {timeOffEntries.length}
                     </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                     <span className="font-medium text-slate-700">
                        Total Hours This Year:
                     </span>
                     <span className="text-slate-900 font-semibold">
                        {timeOffEntries.reduce(
                           (sum, entry) =>
                              sum + entry.time_off_cumulative_hours,
                           0
                        )}
                        h
                     </span>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
