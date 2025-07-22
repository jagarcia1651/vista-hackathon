import { ChevronDown, ChevronRight } from "lucide-react";

interface TimeOffSectionHeaderProps {
   title: string;
   count: number;
   isCollapsed: boolean;
   onToggle: () => void;
   badgeColor?: string;
}

export function TimeOffSectionHeader({
   title,
   count,
   isCollapsed,
   onToggle,
   badgeColor = "bg-slate-100 text-slate-600",
}: TimeOffSectionHeaderProps) {
   return (
      <button
         type="button"
         onClick={onToggle}
         className="flex items-center gap-2 text-md font-medium text-slate-900 hover:text-slate-700 transition-colors"
      >
         {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
         ) : (
            <ChevronDown className="w-4 h-4" />
         )}
         {title}
         <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}
         >
            {count}
         </span>
      </button>
   );
}
