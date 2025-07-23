import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

export interface TimeOffFormData {
   time_off_start_date: string;
   time_off_end_date: string;
   time_off_cumulative_hours: number;
}

interface TimeOffFormProps {
   formData: TimeOffFormData;
   formError: string;
   isCreate?: boolean;
   onFormDataChange: (data: TimeOffFormData) => void;
   onCancel: () => void;
   onApply: () => void;
}

export function TimeOffForm({
   formData,
   formError,
   isCreate = false,
   onFormDataChange,
   onCancel,
   onApply,
}: TimeOffFormProps) {
   // Function to calculate weekdays between two dates (inclusive of both start and end dates)
   const calculateWeekdays = (startDate: string, endDate: string): number => {
      if (!startDate || !endDate) return 0;

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
      if (start > end) return 0;
      if (start == end && start.getDay() >= 1 && start.getDay() <= 5) return 8;

      let weekdays = 0;
      const current = new Date(start);

      // Loop through each day from start to end (inclusive)
      while (current <= end) {
         const dayOfWeek = current.getDay();
         // Count weekdays: Monday = 1, Tuesday = 2, ..., Friday = 5
         if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            weekdays++;
         }
         // Move to next day
         current.setDate(current.getDate() + 1);
      }

      return weekdays;
   };

   const updateFormData = (
      field: keyof TimeOffFormData,
      value: string | number
   ) => {
      const newFormData = {
         ...formData,
         [field]: value,
      };

      // Auto-calculate cumulative hours when start or end date changes
      if (field === "time_off_start_date" || field === "time_off_end_date") {
         const weekdays = calculateWeekdays(
            field === "time_off_start_date"
               ? (value as string)
               : formData.time_off_start_date,
            field === "time_off_end_date"
               ? (value as string)
               : formData.time_off_end_date
         );
         newFormData.time_off_cumulative_hours = weekdays * 8;
      }

      onFormDataChange(newFormData);
   };

   return (
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
                        updateFormData("time_off_start_date", e.target.value)
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
                        updateFormData("time_off_end_date", e.target.value)
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
                  value={formData.time_off_cumulative_hours || 0}
                  readOnly
                  className="bg-slate-100 text-slate-600"
               />
               <div className="text-xs text-slate-500">
                  Auto-calculated: Weekdays between start and end date × 8 hours
               </div>
            </div>

            <div className="flex justify-end space-x-2">
               <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
               >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
               </Button>
               <Button type="button" size="sm" onClick={onApply}>
                  <Check className="w-3 h-3 mr-1" />
                  Apply
               </Button>
            </div>
         </div>
      </div>
   );
}
