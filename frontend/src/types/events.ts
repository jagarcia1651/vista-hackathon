export type BusinessEventType = "TEST" | "ERROR" | "UPDATE";

export type AgentType =
   | "ORCHESTRATOR"
   | "PROJECT"
   | "RESOURCE_MANAGEMENT"
   | "PROFITABILITY";

export type BusinessEvent = {
   type: BusinessEventType;
   message: string;
   agent_id: AgentType;
   timestamp: string;
};

export type ChatMessage = {
   type: "chat";
   role: "user" | "assistant";
   content: string;
   timestamp: string;
};

export type UIEvent = BusinessEvent | ChatMessage;
