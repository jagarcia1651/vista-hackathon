"use client";

import { useState, useRef, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Send, MessageCircle } from "lucide-react";
import { EventDisplay } from "./EventDisplay";
import { cn } from "@/lib/utils";
import { UIEvent } from "@/types/events";

interface ChatResponse {
   response: string;
   status: string;
   orchestrator?: string;
   error?: string;
}

export const EventSidebar = () => {
   const {
      events,
      backendStatus,
      isOpen,
      toggleSidebar,
      unreadCount,
      handleChatMessage
   } = useEventStream();
   const [inputValue, setInputValue] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const messagesEndRef = useRef<HTMLDivElement>(null);

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   };

   useEffect(() => {
      scrollToBottom();
   }, [events]);

   // Initialize welcome message
   useEffect(() => {
      if (events.length === 0) {
         handleChatMessage(
            "Hello! I'm your PSA Agent assistant. I can help you with project management, resource allocation, and quote generation. What can I help you with today?",
            "assistant"
         );
      }
   }, []);

   const sendMessage = async () => {
      if (!inputValue.trim() || isLoading) return;

      // Send user message
      await handleChatMessage(inputValue.trim(), "user");
      setInputValue("");
      setIsLoading(true);

      // Add loading message
      await handleChatMessage(
         "Analyzing your request with our specialist agents...",
         "assistant"
      );

      try {
         const response = await fetch("/api/v1/agent/query", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({
               query: inputValue.trim(),
               context: {
                  session_id: "dashboard-chat",
                  user_interface: "web"
               }
            })
         });

         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         const data: ChatResponse = await response.json();

         // Remove loading message (this will be handled by the backend event stream)
         // Add actual response
         await handleChatMessage(
            data.response ||
               data.error ||
               "Sorry, I encountered an error processing your request.",
            "assistant"
         );
      } catch (error) {
         console.error("Chat error:", error);
         await handleChatMessage(getErrorMessage(error), "assistant");
      } finally {
         setIsLoading(false);
      }
   };

   const getErrorMessage = (error: any) => {
      if (error.message?.includes("404")) {
         return "Backend API not found. Please make sure the FastAPI backend is running on port 8000.\n\nTo start the backend:\n1. cd backend\n2. poetry run uvicorn app.main:app --reload";
      } else if (error.message?.includes("Failed to fetch")) {
         return "Cannot connect to the backend. Please check:\n\n1. Backend server is running (poetry run uvicorn app.main:app --reload)\n2. Backend is accessible at http://localhost:8000\n3. CORS is properly configured";
      } else {
         return "Sorry, I'm having trouble connecting to the PSA agents. Please check if the backend is running and try again.";
      }
   };

   const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         sendMessage();
      }
   };

   const getStatusColor = () => {
      switch (backendStatus) {
         case "connected":
            return "text-green-600";
         case "disconnected":
            return "text-red-600";
         default:
            return "text-slate-500";
      }
   };

   const getStatusText = () => {
      switch (backendStatus) {
         case "connected":
            return "Connected";
         case "disconnected":
            return "Disconnected";
         default:
            return "Checking...";
      }
   };

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

         <SheetContent side="right" className="w-[450px] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                     <MessageCircle className="text-blue-600" size={20} />
                     <SheetTitle>AI Assistant</SheetTitle>
                     <div className={`text-xs ${getStatusColor()}`}>
                        ● {getStatusText()}
                     </div>
                  </div>
               </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
               <div className="p-4 space-y-4">
                  {events.map((event, i) =>
                     event.type === "chat" ? (
                        <div
                           key={`chat-${i}`}
                           className={`flex ${
                              event.role === "user"
                                 ? "justify-end"
                                 : "justify-start"
                           }`}
                        >
                           <div
                              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                 event.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-900"
                              }`}
                           >
                              <div className="text-sm whitespace-pre-wrap">
                                 {event.content}
                              </div>
                              <div
                                 className={`text-xs mt-1 ${
                                    event.role === "user"
                                       ? "text-blue-100"
                                       : "text-slate-500"
                                 }`}
                              >
                                 {new Date(
                                    event.timestamp
                                 ).toLocaleTimeString()}
                              </div>
                           </div>
                        </div>
                     ) : (
                        <EventDisplay key={`event-${i}`} event={event} />
                     )
                  )}
                  <div ref={messagesEndRef} />
               </div>
            </ScrollArea>

            <div className="p-4 border-t mt-auto">
               <div className="flex space-x-2">
                  <Textarea
                     value={inputValue}
                     onChange={e => setInputValue(e.target.value)}
                     onKeyPress={handleKeyPress}
                     placeholder="Ask about project planning, resource allocation, quotes..."
                     className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                     disabled={isLoading}
                  />
                  <Button
                     onClick={sendMessage}
                     disabled={!inputValue.trim() || isLoading}
                     className="self-end"
                  >
                     {isLoading ? "Sending..." : <Send className="h-4 w-4" />}
                  </Button>
               </div>
               <div className="mt-2 text-xs text-slate-500">
                  Press Enter to send, Shift+Enter for new line
               </div>
            </div>
         </SheetContent>
      </Sheet>
   );
};
