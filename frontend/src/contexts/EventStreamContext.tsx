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
import { UIEvent } from "@/types/events";

interface EventStreamContextType {
   events: UIEvent[];
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
   }, [user]);

   // Update unread count when sidebar state changes
   useEffect(() => {
      if (isOpen) {
         setUnreadCount(0);
      }
   }, [isOpen]);

   const toggleSidebar = () => {
      setIsOpen(prev => !prev);
   };

   return (
      <EventStreamContext.Provider
         value={{
            events,
            backendStatus,
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
   if (context === undefined) {
      throw new Error(
         "useEventStream must be used within an EventStreamProvider"
      );
   }
   return context;
};
