import { Button } from "@/components/ui/button";
import { ProjectStatus } from "@/types/base";

interface ProjectStats {
   [ProjectStatus.RFP]: number;
   [ProjectStatus.QUOTED]: number;
   [ProjectStatus.LOST]: number;
   [ProjectStatus.PENDING]: number;
   [ProjectStatus.IN_PROGRESS_ON_TRACK]: number;
   [ProjectStatus.IN_PROGRESS_OFF_TRACK]: number;
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
         label: "RFP",
         value: ProjectStatus.RFP,
         count: stats[ProjectStatus.RFP],
         color: "bg-purple-100 text-purple-800",
         activeColor: "bg-purple-800 text-white"
      },
      {
         label: "Quoted",
         value: ProjectStatus.QUOTED,
         count: stats[ProjectStatus.QUOTED],
         color: "bg-blue-100 text-blue-800",
         activeColor: "bg-blue-800 text-white"
      },
      {
         label: "Lost",
         value: ProjectStatus.LOST,
         count: stats[ProjectStatus.LOST],
         color: "bg-red-100 text-red-800",
         activeColor: "bg-red-800 text-white"
      },
      {
         label: "Pending",
         value: ProjectStatus.PENDING,
         count: stats[ProjectStatus.PENDING],
         color: "bg-yellow-100 text-yellow-800",
         activeColor: "bg-yellow-800 text-white"
      },
      {
         label: "In Progress - On Track",
         value: ProjectStatus.IN_PROGRESS_ON_TRACK,
         count: stats[ProjectStatus.IN_PROGRESS_ON_TRACK],
         color: "bg-green-100 text-green-800",
         activeColor: "bg-green-800 text-white"
      },
      {
         label: "In Progress - Off Track",
         value: ProjectStatus.IN_PROGRESS_OFF_TRACK,
         count: stats[ProjectStatus.IN_PROGRESS_OFF_TRACK],
         color: "bg-orange-100 text-orange-800",
         activeColor: "bg-orange-800 text-white"
      },
      {
         label: "Completed",
         value: ProjectStatus.COMPLETED,
         count: stats[ProjectStatus.COMPLETED],
         color: "bg-teal-100 text-teal-800",
         activeColor: "bg-teal-800 text-white"
      },
      {
         label: "Cancelled",
         value: ProjectStatus.CANCELLED,
         count: stats[ProjectStatus.CANCELLED],
         color: "bg-gray-100 text-gray-800",
         activeColor: "bg-gray-800 text-white"
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
