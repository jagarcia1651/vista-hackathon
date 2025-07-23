"use client";

import { Button } from "@/components/ui/button";
import { useEventStream } from "@/contexts/EventStreamContext";
import { ListTodo } from "lucide-react";
import { AgentCards } from "./AgentCards";

interface DashboardClientProps {
   userEmail?: string;
   userId?: string;
}

export function DashboardClient({ userEmail, userId }: DashboardClientProps) {
   const { toggleSidebar } = useEventStream();

   const handleAgentClick = (agentId: string) => {
      // TODO: Navigate to specific agent page or open agent dialog
      console.log("Agent clicked:", agentId);
   };

   return (
      <div className="space-y-8">
         {/* Agent Cards */}
         <AgentCards onAgentClick={handleAgentClick} />
      </div>
   );
}
