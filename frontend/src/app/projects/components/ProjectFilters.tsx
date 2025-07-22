import { Button } from "@/components/ui/button";
import { ProjectStatus } from "@/types/base";

interface ProjectStats {
   [ProjectStatus.ACTIVE]: number;
   [ProjectStatus.ON_HOLD]: number;
   [ProjectStatus.COMPLETED]: number;
   [ProjectStatus.CANCELLED]: number;
}

interface ProjectFiltersProps {
   stats: ProjectStats;
   selectedStatus: ProjectStatus | null;
   onStatusChange: (status: ProjectStatus | null) => void;
}

export function ProjectFilters({
   stats,
   selectedStatus,
   onStatusChange
}: ProjectFiltersProps) {
   const filters = [
      {
         label: "All",
         value: null,
         count: Object.values(stats).reduce((a, b) => a + b, 0),
         color: "bg-slate-100 text-slate-800",
         activeColor: "bg-slate-800 text-white"
      },
      {
         label: "Active",
         value: ProjectStatus.ACTIVE,
         count: stats[ProjectStatus.ACTIVE],
         color: "bg-green-100 text-green-800",
         activeColor: "bg-green-800 text-white"
      },
      {
         label: "On Hold",
         value: ProjectStatus.ON_HOLD,
         count: stats[ProjectStatus.ON_HOLD],
         color: "bg-orange-100 text-orange-800",
         activeColor: "bg-orange-800 text-white"
      },
      {
         label: "Completed",
         value: ProjectStatus.COMPLETED,
         count: stats[ProjectStatus.COMPLETED],
         color: "bg-blue-100 text-blue-800",
         activeColor: "bg-blue-800 text-white"
      },
      {
         label: "Cancelled",
         value: ProjectStatus.CANCELLED,
         count: stats[ProjectStatus.CANCELLED],
         color: "bg-red-100 text-red-800",
         activeColor: "bg-red-800 text-white"
      }
   ];

   return (
      <div className="flex flex-wrap gap-3">
         {filters.map(filter => {
            const isSelected = selectedStatus === filter.value;
            const baseClasses =
               "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors";
            const colorClasses = isSelected ? filter.activeColor : filter.color;

            return (
               <Button
                  key={filter.label}
                  variant="outline"
                  className={`${baseClasses} ${colorClasses} border-transparent hover:border-transparent`}
                  onClick={() => onStatusChange(filter.value)}
               >
                  {filter.label}
                  <span className="inline-flex items-center justify-center rounded-full bg-white bg-opacity-25 px-2 py-0.5">
                     {filter.count}
                  </span>
               </Button>
            );
         })}
      </div>
   );
}
