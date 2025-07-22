import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import type { Project } from "../../../../shared/schemas/typescript/project";

export default async function ProjectOverview() {
   const supabase = await createClient();

   // Fetch projects and their statuses
   const { data: projects } = (await supabase.from("projects").select(`
      project_id,
      client_id,
      project_name,
      project_status,
      project_start_date,
      project_due_date,
      created_at,
      last_updated_at
    `)) as { data: Project[] | null };

   // Calculate project statistics
   const activeProjects = projects?.length || 0;
   // TODO: Implement project status calculations
   const onTrackProjects = 0;
   const atRiskProjects = 0;
   const delayedProjects = 0;

   const stats = [
      {
         title: "Active Projects",
         value: activeProjects,
         subtext: "+2 this month",
         icon: (
            <svg
               className="w-6 h-6 text-blue-500"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
               />
            </svg>
         )
      },
      {
         title: "On Track",
         value: onTrackProjects,
         subtext: "67% success rate",
         icon: (
            <svg
               className="w-6 h-6 text-green-500"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
               />
            </svg>
         )
      },
      {
         title: "At Risk",
         value: atRiskProjects,
         subtext: "Need attention",
         icon: (
            <svg
               className="w-6 h-6 text-orange-500"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
               />
            </svg>
         )
      },
      {
         title: "Delayed",
         value: delayedProjects,
         subtext: "Requires action",
         icon: (
            <svg
               className="w-6 h-6 text-purple-500"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
               />
            </svg>
         )
      }
   ];

   return (
      <div>
         <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
               <Card key={index} className="p-6">
                  <div className="flex flex-col">
                     <div className="flex items-center justify-between mb-4">
                        {stat.icon}
                        <span className="text-4xl font-bold">{stat.value}</span>
                     </div>
                     <h3 className="text-lg font-medium">{stat.title}</h3>
                     <p className="text-sm text-muted-foreground">
                        {stat.subtext}
                     </p>
                  </div>
               </Card>
            ))}
         </div>
      </div>
   );
}
