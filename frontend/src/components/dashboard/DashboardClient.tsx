"use client";

import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle
} from "@/components/ui/card";
import { AgentCards } from './AgentCards'
import dynamic from "next/dynamic";

// Load PSAChatbot dynamically to avoid SSR hydration issues
const PSAChatbot = dynamic(
   () => import("./PSAChatbot").then(mod => ({ default: mod.PSAChatbot })),
   {
      ssr: false,
      loading: () => null
   }
);

interface DashboardClientProps {
   userEmail?: string;
   userId?: string;
}

export function DashboardClient({ userEmail, userId }: DashboardClientProps) {
  const handleAgentClick = (agentId: string) => {
    // TODO: Navigate to specific agent page or open agent dialog
    console.log('Agent clicked:', agentId)
  }

  return (
    <div className="space-y-8">
      {/* Agent Cards */}
      <AgentCards onAgentClick={handleAgentClick} />
      
      {/* PSA Chatbot - Wide bar at bottom */}
      <PSAChatbot />
    </div>
  )
} 

