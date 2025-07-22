"use client";

import { useState } from "react";
import { useEventStream } from "@/contexts/EventStreamContext";
import { UIEvent } from "@/types/events";
import { cn } from "@/lib/utils";
import {
   Sheet,
   SheetContent,
   SheetHeader,
   SheetTitle,
   SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

const EventDisplay = ({ event }: { event: UIEvent }) => {
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

export const EventSidebar = () => {
   const { events, handleChatMessage, isOpen, toggleSidebar, unreadCount } =
      useEventStream();
   const [inputValue, setInputValue] = useState("");

   return (
      <Sheet open={isOpen} onOpenChange={toggleSidebar}>
         <SheetTrigger asChild>
            <Button
               variant="outline"
               size="icon"
               className="fixed right-0 top-1/2 transform -translate-y-1/2 rounded-l-md rounded-r-none"
            >
               {isOpen ? (
                  <ChevronRight className="h-4 w-4" />
               ) : (
                  <div className="relative">
                     <ChevronLeft className="h-4 w-4" />
                     {unreadCount > 0 && (
                        <Badge
                           variant="destructive"
                           className="absolute -top-2 -right-2"
                        >
                           {unreadCount}
                        </Badge>
                     )}
                  </div>
               )}
            </Button>
         </SheetTrigger>

         <SheetContent side="right" className="w-80 p-0 flex flex-col">
            <SheetHeader className="p-4 border-b">
               <SheetTitle>AI Assistant</SheetTitle>
            </SheetHeader>

            <ScrollArea className="flex-1">
               <div className="p-4 space-y-4">
                  {events.map((event, i) => (
                     <EventDisplay key={i} event={event} />
                  ))}
               </div>
            </ScrollArea>

            <div className="p-4 border-t mt-auto">
               <form
                  onSubmit={async e => {
                     e.preventDefault();
                     if (!inputValue.trim()) return;

                     await handleChatMessage(inputValue, "user");
                     setInputValue("");
                  }}
               >
                  <Input
                     value={inputValue}
                     onChange={e => setInputValue(e.target.value)}
                     placeholder="Ask a question..."
                     className="w-full"
                  />
               </form>
            </div>
         </SheetContent>
      </Sheet>
   );
};
