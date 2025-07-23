"use client";

import {
   createContext,
   useContext,
   useState,
   useEffect,
   useRef,
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
   backendStatus: "connecting" | "connected" | "disconnected";
   isOpen: boolean;
   toggleSidebar: () => void;
   unreadCount: number;
}

const EventStreamContext = createContext<EventStreamContextType | undefined>(
   undefined
);

export const EventStreamProvider = ({ children }: { children: ReactNode }) => {
   const [events, setEvents] = useState<UIEvent[]>([]);
   const [isOpen, setIsOpen] = useState(false);
   const [backendStatus, setBackendStatus] = useState<
      "connecting" | "connected" | "disconnected"
   >("connecting");
   const [unreadCount, setUnreadCount] = useState(0);
   const { user } = useAuth();
   const eventSourceRef = useRef<EventSource | null>(null);

   useEffect(() => {
      if (!user) {
         // Clean up existing connection if user logs out
         if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setBackendStatus("disconnected");
         }
         return;
      }

      // Only create a new EventSource if one doesn't exist
      if (!eventSourceRef.current) {
         eventSourceRef.current = new EventSource(
            "http://localhost:8000/api/v1/agent/events"
         );

         eventSourceRef.current.onmessage = event => {
            const businessEvent = JSON.parse(event.data);
            setEvents(prev => [...prev, businessEvent]);
            if (!isOpen) {
               setUnreadCount(prev => prev + 1);
            }
         };

         eventSourceRef.current.onopen = () => {
            setBackendStatus("connected");
         };

         eventSourceRef.current.onerror = error => {
            console.error("EventSource error:", error);
            setBackendStatus("disconnected");
         };
      }

      // Clean up function
      return () => {
         if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
         }
      };
   }, [user]); // Only depend on user changes

   useEffect(() => {
      const eventSource = new EventSource("/api/v1/agent/events");

      eventSource.onmessage = event => {
         try {
            // The event.data is already a string, so we just need to parse it once
            const data = JSON.parse(event.data);

            // Handle the event based on its type
            if (data.type === "TEST" || data.type === "UPDATE") {
               // Add the event to our state
               setEvents(prev => [
                  ...prev,
                  {
                     type: "chat",
                     role: "assistant",
                     content: data.message,
                     timestamp: data.timestamp
                  }
               ]);
               // Increment unread count if sidebar is closed
               if (!isOpen) {
                  setUnreadCount(prev => prev + 1);
               }
            }
            setBackendStatus("connected");
         } catch (error) {
            console.error("Error parsing event data:", error, event.data);
         }
      };

      eventSource.onerror = error => {
         console.error("EventSource error:", error);
         setBackendStatus("disconnected");
         // Attempt to reconnect after a delay
         setTimeout(() => {
            eventSource.close();
            // The EventSource will automatically try to reconnect
         }, 1000);
      };

      return () => {
         eventSource.close();
      };
   }, [isOpen]); // Only re-run if isOpen changes

   // Update unread count when sidebar state changes
   useEffect(() => {
      if (isOpen) {
         setUnreadCount(0);
      }
   }, [isOpen]);

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
   };

   return (
      <EventStreamContext.Provider
         value={{
            events,
            backendStatus,
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
