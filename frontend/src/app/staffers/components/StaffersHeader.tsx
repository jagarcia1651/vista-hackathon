import { Button } from "@/components/ui/button";

interface StaffersHeaderProps {
   onCreateNew: () => void;
}

export function StaffersHeader({ onCreateNew }: StaffersHeaderProps) {
   return (
      <div className="mb-8">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-semibold text-slate-900">
                  Staffers
               </h1>
               <p className="text-lg text-slate-600 mt-2">
                  Manage your team members and their information
               </p>
            </div>
            <Button onClick={onCreateNew}>Create New Staffer</Button>
         </div>
      </div>
   );
}
