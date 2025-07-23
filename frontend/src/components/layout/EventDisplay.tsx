import { UIEvent, BusinessEvent, AgentType } from "@/types/events";
import { ClipboardList, Users, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const formatTimestamp = (isoTimestamp: string) => {
   try {
      // If timestamp already ends with Z, use it as is, otherwise append Z
      const timestamp = isoTimestamp.endsWith("Z")
         ? isoTimestamp
         : isoTimestamp + "Z";
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
         console.error("Invalid timestamp:", isoTimestamp);
         return "Invalid time";
      }

      return new Intl.DateTimeFormat(undefined, {
         hour: "2-digit",
         minute: "2-digit",
         hour12: true,
         timeZoneName: "short"
      }).format(date);
   } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid time";
   }
};

const getAgentConfig = (agentId: AgentType) => {
   switch (agentId) {
      case "PROJECT":
         return {
            icon: ClipboardList,
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-700",
            iconColor: "text-blue-500",
            displayName: "Project"
         };
      case "RESOURCE_MANAGEMENT":
         return {
            icon: Users,
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
            textColor: "text-orange-700",
            iconColor: "text-orange-500",
            displayName: "Resource Management"
         };
      case "PROFITABILITY":
         return {
            icon: DollarSign,
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200",
            textColor: "text-emerald-700",
            iconColor: "text-emerald-500",
            displayName: "Profitability"
         };
      default:
         return {
            icon: ClipboardList,
            bgColor: "bg-slate-50",
            borderColor: "border-slate-200",
            textColor: "text-slate-700",
            iconColor: "text-slate-500",
            displayName: "System"
         };
   }
};

const isBusinessEvent = (event: UIEvent): event is BusinessEvent => {
   return event.type !== "chat";
};

export const EventDisplay = ({ event }: { event: UIEvent }) => {
   if (!isBusinessEvent(event)) return null; // Only display business events

   const config = getAgentConfig(event.agent_id);
   const Icon = config.icon;

   return (
      <div
         className={cn(
            "flex items-start space-x-3 rounded-lg p-3",
            config.bgColor,
            config.borderColor,
            "border"
         )}
      >
         <div
            className={cn(
               "p-2 rounded-full",
               config.bgColor,
               config.borderColor,
               "border"
            )}
         >
            <Icon className={cn("h-4 w-4", config.iconColor)} />
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
               <div className={cn("text-sm font-bold", config.textColor)}>
                  {config.displayName}
               </div>
               <div className="text-xs text-slate-500 ml-4">
                  {formatTimestamp(event.timestamp)}
               </div>
            </div>
            <div className={cn("text-sm break-words", config.textColor)}>
               {event.message}
            </div>
         </div>
      </div>
   );
};
