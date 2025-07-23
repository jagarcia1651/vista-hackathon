from enum import Enum
from dataclasses import dataclass
from datetime import datetime
from typing import List, Callable, Awaitable, Dict, Any

class BusinessEventType(Enum):
    TEST = "TEST"
    ERROR = "ERROR"
    UPDATE = "UPDATE"

class AgentType(Enum):
    ORCHESTRATOR = "ORCHESTRATOR"
    PROJECT = "PROJECT"
    RESOURCE_MANAGEMENT = "RESOURCE_MANAGEMENT"
    PROFITABILITY = "PROFITABILITY"

@dataclass
class BusinessEvent:
    type: BusinessEventType
    message: str
    agent_id: AgentType
    timestamp: datetime = datetime.now()

class EventBus:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.subscribers: List[Callable[[BusinessEvent], Awaitable[None]]] = []
        return cls._instance
    
    async def emit(self, event: BusinessEvent):
        for subscriber in self.subscribers:
            await subscriber(event)
    
    def subscribe(self, callback: Callable[[BusinessEvent], Awaitable[None]]):
        self.subscribers.append(callback)
        
    def unsubscribe(self, callback: Callable[[BusinessEvent], Awaitable[None]]):
        if callback in self.subscribers:
            self.subscribers.remove(callback)

# Create a singleton instance
event_bus = EventBus() 