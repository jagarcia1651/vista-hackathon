export type BusinessEventType =
   | "STAFF_REASSIGNMENT"
   | "PTO_CONFLICT"
   | "TASK_REASSIGNMENT"
   | "CHAT_MESSAGE";

export type BusinessEvent = {
   type: BusinessEventType;
   data: any;
   agent_id: string;
   timestamp: string;
};

export type ChatMessage = {
   type: "chat";
   role: "user" | "assistant";
   content: string;
   timestamp: string;
};

export type UIEvent = BusinessEvent | ChatMessage;
