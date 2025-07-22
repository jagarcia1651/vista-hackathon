import { Button } from "@/components/ui/button";
import { Staffer } from "../services/stafferService";

interface StafferRowProps {
   staffer: Staffer;
   deleteLoading: string | null;
   onEdit: (staffer: Staffer) => void;
   onDelete: (staffer: Staffer) => void;
}

export function StafferRow({
   staffer,
   deleteLoading,
   onEdit,
   onDelete,
}: StafferRowProps) {
   const getCapacityColor = (capacity: number) => {
      if (capacity >= 45) return "text-red-600 bg-red-50"; // Over 45 hours - high workload
      if (capacity >= 35) return "text-green-600 bg-green-50"; // 35-45 hours - good utilization
      if (capacity >= 20) return "text-orange-600 bg-orange-50"; // 20-35 hours - part-time
      return "text-slate-600 bg-slate-50"; // Under 20 hours - low capacity
   };

   const formatCapacity = (capacity: number) => {
      return `${capacity}h/week`;
   };

   return (
      <tr
         className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
         onClick={() => onEdit(staffer)}
      >
         <td className="py-3 px-4">
            <div className="font-medium text-slate-900">
               {staffer.first_name} {staffer.last_name}
            </div>
         </td>
         <td className="py-3 px-4">
            <div className="text-slate-600">{staffer.email}</div>
         </td>
         <td className="py-3 px-4">
            <div className="text-slate-600">{staffer.title}</div>
         </td>
         <td className="py-3 px-4">
            <div className="text-slate-600 text-sm">
               {staffer.time_zone || "—"}
            </div>
         </td>
         <td className="py-3 px-4">
            <span
               className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${getCapacityColor(
                  staffer.capacity
               )}`}
            >
               {formatCapacity(staffer.capacity)}
            </span>
         </td>
         <td className="py-3 px-4">
            <div className="flex justify-end space-x-2">
               <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                     e.stopPropagation();
                     onEdit(staffer);
                  }}
               >
                  Edit
               </Button>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                     e.stopPropagation();
                     onDelete(staffer);
                  }}
                  disabled={deleteLoading === staffer.id}
                  className="text-red-600 border-red-300 hover:bg-red-50"
               >
                  {deleteLoading === staffer.id ? "Deleting..." : "Delete"}
               </Button>
            </div>
         </td>
      </tr>
   );
}
