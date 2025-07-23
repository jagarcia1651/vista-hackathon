"use client";

import { useRef, useEffect } from "react";
import { useEventStream } from "@/contexts/EventStreamContext";
import {
   Sheet,
   SheetContent,
   SheetHeader,
   SheetTitle,
   SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ListTodo } from "lucide-react";
import { EventDisplay } from "./EventDisplay";
import { cn } from "@/lib/utils";
import { UIEvent } from "@/types/events";

export const EventSidebar = () => {
   const { events, backendStatus, isOpen, toggleSidebar, unreadCount } =
      useEventStream();
   const messagesEndRef = useRef<HTMLDivElement>(null);

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   };

   useEffect(() => {
      scrollToBottom();
   }, [events]);

   return (
      <Sheet open={isOpen} onOpenChange={toggleSidebar} modal={false}>
         <SheetTrigger asChild>
            <Button
               variant={isOpen ? "outline" : "default"}
               size="icon"
               className={cn(
                  "fixed right-0 top-[20%] rounded-l-md rounded-r-none transform-gpu cursor-pointer",
                  !isOpen &&
                     "bg-primary text-primary-foreground hover:bg-primary sidebar-attention"
               )}
               style={{ transformOrigin: "center right" }}
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

         <SheetContent
            side="right"
            className="w-[450px] p-0 flex flex-col h-full overflow-hidden"
         >
            <SheetHeader className="p-4 border-b flex-none">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                     <ListTodo className="text-blue-600" size={20} />
                     <SheetTitle>Action Queue</SheetTitle>
                     <div
                        className={cn(
                           "text-xs",
                           backendStatus === "connected"
                              ? "text-green-600"
                              : "text-red-600"
                        )}
                     >
                        ● {backendStatus}
                     </div>
                  </div>
               </div>
            </SheetHeader>

            <ScrollArea className="flex-1 min-h-0">
               <div className="p-4 space-y-4">
                  {events.map((event, i) => (
                     <EventDisplay key={`event-${i}`} event={event} />
                  ))}
                  <div ref={messagesEndRef} />
               </div>
            </ScrollArea>
         </SheetContent>
      </Sheet>
   );
};
