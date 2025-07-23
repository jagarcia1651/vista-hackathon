import { UIEvent } from "@/types/events";
import { cn } from "@/lib/utils";

export const EventDisplay = ({ event }: { event: UIEvent }) => {
   if (event.type === "chat") {
      return (
         <div
            className={cn(
               "rounded-lg p-3",
               event.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"
            )}
         >
            {event.content}
         </div>
      );
   }

   return (
      <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
         <div className="flex-1">
            <p className="text-sm font-medium">
               {event.type === "STAFF_REASSIGNMENT" && "Staff Reassigned"}
               {event.type === "PTO_CONFLICT" && "PTO Conflict Detected"}
               {event.type === "TASK_REASSIGNMENT" && "Task Reassigned"}
            </p>
            <p className="text-xs text-muted-foreground">
               {new Date(event.timestamp).toLocaleString()}
            </p>
         </div>
      </div>
   );
};
