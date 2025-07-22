from enum import Enum
from dataclasses import dataclass
from datetime import datetime
from typing import List, Callable, Awaitable

class BusinessEventType(Enum):
    STAFF_REASSIGNMENT = "staff_reassignment"
    PTO_CONFLICT = "pto_conflict"
    TASK_REASSIGNMENT = "task_reassignment"
    CHAT_MESSAGE = "chat_message"

@dataclass
class BusinessEvent:
    type: BusinessEventType
    data: dict
    agent_id: str
    timestamp: datetime = datetime.utcnow()

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