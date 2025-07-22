import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface PageHeaderProps {
   entityName: string; // e.g., "Staffers", "Projects", "Quotes"
   description: string; // e.g., "Manage your team members and their information"
   onCreateNew: () => void;
   createButtonText?: string; // Optional custom button text
   className?: string; // Optional additional styling
   children?: ReactNode; // Optional content to render below the header
}

export function PageHeader({
   entityName,
   description,
   onCreateNew,
   createButtonText,
   className = "mb-8",
   children
}: PageHeaderProps) {
   const defaultButtonText =
      createButtonText || `Create New ${entityName.slice(0, -1)}`; // Remove 's' from plural

   return (
      <div className={className}>
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-semibold text-slate-900">
                  {entityName}
               </h1>
               <p className="text-lg text-slate-600 mt-2">{description}</p>
            </div>
            <Button onClick={onCreateNew}>{defaultButtonText}</Button>
         </div>
         {children && <div className="mt-6">{children}</div>}
      </div>
   );
}
