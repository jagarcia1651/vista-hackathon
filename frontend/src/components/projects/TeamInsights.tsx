import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import type { Staffer } from "../../../../shared/schemas/typescript/staffer";

interface StafferWithAssignments extends Staffer {
   staffer_assignments: Array<{
      staffer_assignment_id: string;
      staffer_id: string;
      project_task_id: string;
      created_at: string;
      last_updated_at: string;
   }>;
}

export default async function TeamInsights() {
   const supabase = await createClient();

   // Fetch team data
   const { data: staffers } = (await supabase.from("staffers").select(`
      id,
      title,
      seniority_id,
      capacity,
      time_zone,
      created_at,
      last_updated_at,
      staffer_assignments (
        staffer_assignment_id,
        staffer_id,
        project_task_id,
        created_at,
        last_updated_at
      )
    `)) as { data: StafferWithAssignments[] | null };

   // Calculate team metrics
   const totalCapacity =
      staffers?.reduce((sum: number, s) => sum + (s.capacity || 0), 0) || 0;
   const assignedCapacity =
      staffers?.reduce(
         (sum: number, s) => sum + (s.staffer_assignments?.length || 0),
         0
      ) || 0;
   const utilizationRate = Math.round((assignedCapacity / totalCapacity) * 100);
   const availableCapacity = Math.round(
      (1 - assignedCapacity / totalCapacity) * 100
   );

   const insights = [
      {
         title: "Team Utilization",
         value: `${utilizationRate}%`,
         description: "Current team capacity usage",
         color: "bg-blue-100",
         textColor: "text-blue-500",
         action: "Optimize Allocation"
      },
      {
         title: "Available Capacity",
         value: `${availableCapacity}%`,
         description: "Ready for new assignments",
         color: "bg-green-100",
         textColor: "text-green-500",
         action: "Assign Resources"
      },
      {
         title: "Deadline Alerts",
         value: "4",
         description: "Projects due this week",
         color: "bg-orange-100",
         textColor: "text-orange-500",
         action: "Review Deadlines"
      }
   ];

   return (
      <div>
         <h2 className="text-xl font-semibold mb-4">Team Insights & Actions</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
               <Card key={index} className={`p-6 ${insight.color}`}>
                  <div className="flex flex-col h-full">
                     <div className="flex-grow">
                        <h3 className="text-lg font-medium">{insight.title}</h3>
                        <span
                           className={`text-3xl font-bold ${insight.textColor} block my-2`}
                        >
                           {insight.value}
                        </span>
                        <p className="text-sm text-muted-foreground mb-4">
                           {insight.description}
                        </p>
                     </div>
                     <Button variant="outline" className="w-full">
                        {insight.action}
                     </Button>
                  </div>
               </Card>
            ))}
         </div>
      </div>
   );
}
