import { PageHeader } from "@/components/shared/PageHeader";

interface StaffersHeaderProps {
   onCreateNew: () => void;
}

export function StaffersHeader({ onCreateNew }: StaffersHeaderProps) {
   return (
      <PageHeader
         entityName="Staffers"
         description="Manage your team members and their information"
         onCreateNew={onCreateNew}
         createButtonText="Create New Staffer"
      />
   );
}
