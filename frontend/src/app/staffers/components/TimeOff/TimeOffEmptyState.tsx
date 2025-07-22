import { Calendar } from "lucide-react";

interface TimeOffEmptyStateProps {
   message?: string;
   description?: string;
}

export function TimeOffEmptyState({
   message = "No time off entries found",
   description = "This staffer has no scheduled time off",
}: TimeOffEmptyStateProps) {
   return (
      <div className="text-center py-8 bg-slate-50 rounded-lg">
         <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
         <div className="text-slate-600 font-medium mb-1">{message}</div>
         <div className="text-sm text-slate-500">{description}</div>
      </div>
   );
}
