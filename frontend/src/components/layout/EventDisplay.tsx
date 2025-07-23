import { UIEvent, BusinessEvent } from "@/types/events";

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

const isBusinessEvent = (event: UIEvent): event is BusinessEvent => {
   return event.type !== "chat";
};

export const EventDisplay = ({ event }: { event: UIEvent }) => {
   if (!isBusinessEvent(event)) return null; // Only display business events

   return (
      <div className="flex flex-col space-y-1 bg-slate-50 rounded-lg p-3">
         <div className="text-sm text-slate-900">{event.message}</div>
         <div className="text-xs text-slate-500 flex items-center space-x-2">
            <span>{event.agent_id}</span>
            <span>•</span>
            <span>{formatTimestamp(event.timestamp)}</span>
         </div>
      </div>
   );
};
