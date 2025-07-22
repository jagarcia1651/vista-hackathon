import { Card } from "@/components/ui/card";
import ProjectOverview from "@/components/projects/ProjectOverview";
import TeamInsights from "@/components/projects/TeamInsights";
import ProjectTasks from "@/components/projects/ProjectTasks";

export default async function ProjectsPage() {
   return (
      <div className="container mx-auto p-6 space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
               </svg>
               <h1 className="text-2xl font-semibold">
                  Project Manager Dashboard
               </h1>
            </div>
         </div>
         <p className="text-muted-foreground">
            Comprehensive project oversight and team coordination
         </p>

         <ProjectOverview />
         <TeamInsights />
         <ProjectTasks />
      </div>
   );
}
