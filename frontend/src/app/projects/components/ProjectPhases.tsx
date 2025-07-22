"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import type { ProjectPhase } from "@/types/project";

interface ProjectPhasesProps {
   phases: ProjectPhase[];
   onAddPhase: () => void;
   onEditPhase: (phase: ProjectPhase) => void;
}

export function ProjectPhases({
   phases,
   onAddPhase,
   onEditPhase
}: ProjectPhasesProps) {
   const getStatusIcon = (status: string) => {
      switch (status.toLowerCase()) {
         case "completed":
            return <CheckCircle2 className="w-6 h-6 text-green-500" />;
         case "in_progress":
            return <Clock className="w-6 h-6 text-blue-500" />;
         case "blocked":
            return <AlertCircle className="w-6 h-6 text-red-500" />;
         default:
            return <Circle className="w-6 h-6 text-gray-300" />;
      }
   };

   const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
         case "completed":
            return "bg-green-100 text-green-800";
         case "in_progress":
            return "bg-blue-100 text-blue-800";
         case "blocked":
            return "bg-red-100 text-red-800";
         default:
            return "bg-gray-100 text-gray-800";
      }
   };

   if (phases.length === 0) {
      return (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle>Project Phases</CardTitle>
               <Button onClick={onAddPhase} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Phase
               </Button>
            </CardHeader>
            <CardContent>
               <div className="text-center text-slate-500 py-8">
                  <p className="text-lg font-medium">No phases defined</p>
                  <p className="mt-1">Add project phases to track progress</p>
               </div>
            </CardContent>
         </Card>
      );
   }

   return (
      <Card>
         <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Project Phases</CardTitle>
            <Button onClick={onAddPhase} size="sm">
               <Plus className="w-4 h-4 mr-2" />
               Add Phase
            </Button>
         </CardHeader>
         <CardContent>
            <div className="relative">
               {/* Timeline line */}
               <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-200" />

               {/* Phases */}
               <div className="space-y-8">
                  {phases.map((phase, index) => (
                     <div
                        key={phase.project_phase_id}
                        className="relative flex items-start gap-4 group"
                     >
                        {/* Timeline dot */}
                        <div className="relative z-10 flex items-center justify-center">
                           {getStatusIcon(phase.project_phase_status)}
                        </div>

                        {/* Phase content */}
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                 {phase.project_phase_name}
                              </h3>
                              <span
                                 className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    phase.project_phase_status
                                 )}`}
                              >
                                 {phase.project_phase_status}
                              </span>
                           </div>

                           <p className="mt-1 text-sm text-gray-500">
                              {phase.project_phase_description}
                           </p>

                           <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                              <div>
                                 Start:{" "}
                                 {new Date(
                                    phase.project_phase_start_date
                                 ).toLocaleDateString()}
                              </div>
                              <div>
                                 Due:{" "}
                                 {new Date(
                                    phase.project_phase_due_date
                                 ).toLocaleDateString()}
                              </div>
                           </div>

                           {/* Edit button - only shows on hover */}
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEditPhase(phase)}
                              className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              Edit Phase
                           </Button>
                        </div>

                        {/* Phase number */}
                        <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                           {phase.project_phase_number}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </CardContent>
      </Card>
   );
}
