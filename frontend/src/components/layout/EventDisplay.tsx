import { UIEvent, BusinessEvent, AgentType } from "@/types/events";
import {
   ClipboardList,
   Users,
   DollarSign,
   Brain,
   AlertCircle
} from "lucide-react";
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
      case "ORCHESTRATOR":
         return {
            icon: Brain,
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200",
            textColor: "text-purple-700",
            iconColor: "text-purple-500",
            displayName: "Orchestrator"
         };
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
   if (!isBusinessEvent(event)) return null;

   const config = getAgentConfig(event.agent_id);
   const Icon = config.icon;

   // Add error styling if it's an error event
   const isError = event.type === "ERROR";
   const styles = isError
      ? {
           bgColor: "bg-red-50",
           borderColor: "border-red-200",
           textColor: "text-red-700",
           iconColor: "text-red-500"
        }
      : config;

   return (
      <div
         className={cn(
            "flex items-start space-x-3 rounded-lg p-3",
            styles.bgColor,
            styles.borderColor,
            "border",
            isError && "animate-pulse"
         )}
      >
         <div
            className={cn(
               "p-2 rounded-full",
               styles.bgColor,
               styles.borderColor,
               "border"
            )}
         >
            {isError ? (
               <AlertCircle className={cn("h-4 w-4", styles.iconColor)} />
            ) : (
               <Icon className={cn("h-4 w-4", styles.iconColor)} />
            )}
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
               <div className={cn("text-sm font-bold", styles.textColor)}>
                  {isError ? "Error" : config.displayName}
               </div>
               <div className="text-xs text-slate-500 ml-4">
                  {formatTimestamp(event.timestamp)}
               </div>
            </div>
            <div className={cn("text-sm break-words", styles.textColor)}>
               {event.message}
            </div>
         </div>
      </div>
   );
};
