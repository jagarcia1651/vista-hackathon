"use client";

import {
   createContext,
   useContext,
   useState,
   useEffect,
   ReactNode
} from "react";
import { useAuth } from "./AuthContext";
import { UIEvent, ChatMessage } from "@/types/events";

interface EventStreamContextType {
   events: UIEvent[];
   handleChatMessage: (
      message: string,
      role: "user" | "assistant"
   ) => Promise<void>;
   isOpen: boolean;
   toggleSidebar: () => void;
   unreadCount: number;
}

const EventStreamContext = createContext<EventStreamContextType | undefined>(
   undefined
);

export const EventStreamProvider = ({ children }: { children: ReactNode }) => {
   const [events, setEvents] = useState<UIEvent[]>([]);
   const [isOpen, setIsOpen] = useState(true);
   const [unreadCount, setUnreadCount] = useState(0);
   const { user } = useAuth();

   useEffect(() => {
      if (!user) return;

      const eventSource = new EventSource("/api/v1/agent/events");
      eventSource.onmessage = event => {
         const businessEvent = JSON.parse(event.data);
         setEvents(prev => [...prev, businessEvent]);
         if (!isOpen) {
            setUnreadCount(prev => prev + 1);
         }
      };

      return () => eventSource.close();
   }, [user, isOpen]);

   const handleChatMessage = async (
      message: string,
      role: "user" | "assistant"
   ) => {
      const chatMessage: ChatMessage = {
         type: "chat",
         role,
         content: message,
         timestamp: new Date().toISOString()
      };
      setEvents(prev => [...prev, chatMessage]);
   };

   const toggleSidebar = () => {
      setIsOpen(prev => !prev);
      if (!isOpen) {
         setUnreadCount(0);
      }
   };

   return (
      <EventStreamContext.Provider
         value={{
            events,
            handleChatMessage,
            isOpen,
            toggleSidebar,
            unreadCount
         }}
      >
         {children}
      </EventStreamContext.Provider>
   );
};

export const useEventStream = () => {
   const context = useContext(EventStreamContext);
   if (!context) {
      throw new Error("useEventStream must be used within EventStreamProvider");
   }
   return context;
};
