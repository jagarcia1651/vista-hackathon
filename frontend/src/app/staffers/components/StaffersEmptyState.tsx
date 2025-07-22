import { Button } from "@/components/ui/button";

interface StaffersEmptyStateProps {
   searchQuery: string;
   onCreateNew: () => void;
}

export function StaffersEmptyState({
   searchQuery,
   onCreateNew,
}: StaffersEmptyStateProps) {
   return (
      <div className="text-center py-8">
         <div className="text-slate-500 text-lg mb-4">
            {searchQuery
               ? "No staffers found matching your search"
               : "No staffers found"}
         </div>
         <Button onClick={onCreateNew}>Create Your First Staffer</Button>
      </div>
   );
}
