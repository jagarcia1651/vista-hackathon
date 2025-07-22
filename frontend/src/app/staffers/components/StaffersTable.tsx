import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import {
   Seniority,
   Staffer,
} from "../../../../../shared/schemas/typescript/staffer";
import { StafferRow } from "./StafferRow";
import { StaffersEmptyState } from "./StaffersEmptyState";

interface StaffersTableProps {
   staffers: Staffer[];
   searchQuery: string;
   deleteLoading: string | null;
   seniorities: Seniority[];
   onEdit: (staffer: Staffer) => void;
   onDelete: (staffer: Staffer) => void;
   onCreateNew: () => void;
}

export function StaffersTable({
   staffers,
   searchQuery,
   deleteLoading,
   seniorities,
   onEdit,
   onDelete,
   onCreateNew,
}: StaffersTableProps) {
   return (
      <Card>
         <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
               {staffers.length} staffer{staffers.length !== 1 ? "s" : ""} found
            </CardDescription>
         </CardHeader>
         <CardContent>
            {staffers.length === 0 ? (
               <StaffersEmptyState
                  searchQuery={searchQuery}
                  onCreateNew={onCreateNew}
               />
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="border-b border-slate-200">
                           <th className="text-left py-3 px-4 font-medium text-slate-900">
                              Name
                           </th>
                           <th className="text-left py-3 px-4 font-medium text-slate-900">
                              Email
                           </th>
                           <th className="text-left py-3 px-4 font-medium text-slate-900">
                              Title
                           </th>
                           <th className="text-left py-3 px-4 font-medium text-slate-900">
                              Seniority
                           </th>
                           <th className="text-left py-3 px-4 font-medium text-slate-900">
                              Time Zone
                           </th>
                           <th className="text-left py-3 px-4 font-medium text-slate-900">
                              Weekly Capacity
                           </th>
                           <th className="text-right py-3 px-4 font-medium text-slate-900">
                              Actions
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        {staffers.map((staffer) => (
                           <StafferRow
                              key={staffer.id}
                              staffer={staffer}
                              seniorities={seniorities}
                              deleteLoading={deleteLoading}
                              onEdit={onEdit}
                              onDelete={onDelete}
                           />
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </CardContent>
      </Card>
   );
}
