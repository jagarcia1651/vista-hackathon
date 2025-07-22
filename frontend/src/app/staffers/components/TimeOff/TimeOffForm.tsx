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
   const updateFormData = (
      field: keyof TimeOffFormData,
      value: string | number
   ) => {
      onFormDataChange({
         ...formData,
         [field]: value,
      });
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
                  step="0.5"
                  min="0"
                  value={formData.time_off_cumulative_hours}
                  onChange={(e) =>
                     updateFormData(
                        "time_off_cumulative_hours",
                        parseFloat(e.target.value) || 0
                     )
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
