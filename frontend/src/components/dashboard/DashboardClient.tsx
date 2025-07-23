"use client";

import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle
} from "@/components/ui/card";
import { AgentCards } from "./AgentCards";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useEventStream } from "@/contexts/EventStreamContext";

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

         {/* Chat Button */}
         <Button
            onClick={toggleSidebar}
            className="fixed bottom-4 right-4 shadow-lg"
            size="lg"
         >
            <MessageCircle className="mr-2 h-5 w-5" />
            Chat with AI Assistant
         </Button>
      </div>
   );
}
