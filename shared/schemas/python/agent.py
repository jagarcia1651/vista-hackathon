"""
Agent Entity and Session Models
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from .base import BaseEntity


class AgentSessionStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentLogLevel(str, Enum):
    INFO = "info"
    THINKING = "thinking"
    ACTION = "action"
    ERROR = "error"


class WorkflowStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Agent(BaseEntity):
    """Agent entity model"""

    agent_id: str
    agent_domain: str
    agent_name: str
    agent_description: str
    is_enabled: bool


class AgentSession(BaseModel):
    """Agent session model"""

    session_id: str
    user_id: str
    agent_name: str
    status: AgentSessionStatus
    created_at: datetime
    updated_at: datetime
    metadata: Optional[Dict[str, Any]] = None


class AgentRequest(BaseModel):
    """Agent request model"""

    session_id: str
    request: str
    context: Optional[Dict[str, Any]] = None
    user_id: str


class ThinkingLogEntry(BaseModel):
    """Thinking log entry model"""

    id: str
    session_id: str
    agent_name: str
    message: str
    timestamp: datetime
    log_level: AgentLogLevel


class AgentResponse(BaseModel):
    """Agent response model"""

    session_id: str
    response: str
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    thinking_logs: Optional[List[ThinkingLogEntry]] = None


class AgentProgressUpdate(BaseModel):
    """Agent progress update model"""

    session_id: str
    agent_name: str
    progress_percentage: float
    current_step: str
    estimated_completion: datetime


class MultiAgentWorkflow(BaseModel):
    """Multi-agent workflow model"""

    workflow_id: str
    agents_involved: List[str]
    current_agent: str
    workflow_status: WorkflowStatus
    data_flow: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
