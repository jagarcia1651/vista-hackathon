interface TimeOffSummaryProps {
   totalEntries: number;
   totalHours: number;
   hasPendingChanges: boolean;
}

export function TimeOffSummary({
   totalEntries,
   totalHours,
   hasPendingChanges,
}: TimeOffSummaryProps) {
   return (
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
         <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">
               Total Time Off Entries:
            </span>
            <span className="text-slate-900">{totalEntries}</span>
         </div>
         <div className="flex items-center justify-between text-sm mt-1">
            <span className="font-medium text-slate-700">
               Total Hours This Year:
            </span>
            <span className="text-slate-900 font-semibold">{totalHours}h</span>
         </div>
         {hasPendingChanges && (
            <div className="text-xs text-amber-600 mt-2">
               Changes will be applied when you save the staffer
            </div>
         )}
      </div>
   );
}
