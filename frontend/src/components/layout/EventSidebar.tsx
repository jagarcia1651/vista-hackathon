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

interface Message {
   id: string;
   content: string;
   role: "user" | "assistant";
   timestamp: Date;
   status?: "sending" | "success" | "error";
}

interface ChatResponse {
   response: string;
   status: string;
   orchestrator?: string;
   error?: string;
}

export const EventSidebar = () => {
   const { events, backendStatus, isOpen, toggleSidebar, unreadCount } =
      useEventStream();
   const [inputValue, setInputValue] = useState("");
   const [messages, setMessages] = useState<Message[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const messagesEndRef = useRef<HTMLDivElement>(null);

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   };

   useEffect(() => {
      scrollToBottom();
   }, [messages, events]);

   // Initialize welcome message
   useEffect(() => {
      if (messages.length === 0) {
         setMessages([
            {
               id: "1",
               content:
                  "Hello! I'm your PSA Agent assistant. I can help you with project management, resource allocation, and quote generation. What can I help you with today?",
               role: "assistant",
               timestamp: new Date()
            }
         ]);
      }
   }, []);

   const sendMessage = async () => {
      if (!inputValue.trim() || isLoading) return;

      const userMessage: Message = {
         id: Date.now().toString(),
         content: inputValue.trim(),
         role: "user",
         timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);

      // Add loading message
      const loadingMessage: Message = {
         id: (Date.now() + 1).toString(),
         content: "Analyzing your request with our specialist agents...",
         role: "assistant",
         timestamp: new Date(),
         status: "sending"
      };
      setMessages(prev => [...prev, loadingMessage]);

      try {
         const response = await fetch("/api/v1/agent/query", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({
               query: userMessage.content,
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

         // Remove loading message and add actual response
         setMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
            return [
               ...filtered,
               {
                  id: (Date.now() + 2).toString(),
                  content:
                     data.response ||
                     data.error ||
                     "Sorry, I encountered an error processing your request.",
                  role: "assistant",
                  timestamp: new Date(),
                  status: data.status === "success" ? "success" : "error"
               }
            ];
         });
      } catch (error) {
         console.error("Chat error:", error);

         // Remove loading message and add error response
         setMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
            return [
               ...filtered,
               {
                  id: (Date.now() + 3).toString(),
                  content: getErrorMessage(error),
                  role: "assistant",
                  timestamp: new Date(),
                  status: "error"
               }
            ];
         });
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
                  {/* Events */}
                  {events.map((event, i) => (
                     <EventDisplay key={`event-${i}`} event={event} />
                  ))}

                  {/* Chat Messages */}
                  {messages.map(message => (
                     <div
                        key={message.id}
                        className={`flex ${
                           message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                        }`}
                     >
                        <div
                           className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.role === "user"
                                 ? "bg-blue-600 text-white"
                                 : message.status === "error"
                                 ? "bg-red-50 text-red-900 border border-red-200"
                                 : message.status === "sending"
                                 ? "bg-slate-100 text-slate-600 animate-pulse"
                                 : "bg-slate-100 text-slate-900"
                           }`}
                        >
                           <div className="text-sm whitespace-pre-wrap">
                              {message.content}
                           </div>
                           <div
                              className={`text-xs mt-1 ${
                                 message.role === "user"
                                    ? "text-blue-100"
                                    : "text-slate-500"
                              }`}
                           >
                              {message.timestamp.toLocaleTimeString()}
                           </div>
                        </div>
                     </div>
                  ))}
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
