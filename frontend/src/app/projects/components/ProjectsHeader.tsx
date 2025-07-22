import { PageHeader } from "@/components/shared/PageHeader";
import { ReactNode } from "react";

interface ProjectsHeaderProps {
   onCreateNew: () => void;
   children?: ReactNode;
}

export function ProjectsHeader({ onCreateNew, children }: ProjectsHeaderProps) {
   return (
      <PageHeader
         entityName="Projects"
         description="Manage your projects and their progress"
         onCreateNew={onCreateNew}
         createButtonText="Create New Project"
      >
         {children}
      </PageHeader>
   );
}
