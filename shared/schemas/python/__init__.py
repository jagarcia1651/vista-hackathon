"""
PSA Domain Models - Python Package

Centralized export of all PSA domain models for Python/FastAPI application
"""

# Core entities
from .address import Address
from .agent import (
    Agent,
    AgentLogLevel,
    AgentProgressUpdate,
    AgentRequest,
    AgentResponse,
    AgentSession,
    AgentSessionStatus,
    MultiAgentWorkflow,
    ThinkingLogEntry,
    WorkflowStatus,
)

# Base types and enums
from .base import (
    BaseEntity,
    ClientContactStatus,
    HolidayType,
    ProjectStatus,
    QuoteStatus,
    SkillStatus,
    TaskStatus,
)
from .client import Client, ClientArtifact, ClientContact, ClientWithContacts

# Export all for convenience
__all__ = [
    # Base
    "BaseEntity",
    "ProjectStatus",
    "TaskStatus",
    "QuoteStatus",
    "SkillStatus",
    "ClientContactStatus",
    "HolidayType",
    # Address
    "Address",
    # Agent
    "Agent",
    "AgentSession",
    "AgentRequest",
    "AgentResponse",
    "ThinkingLogEntry",
    "AgentProgressUpdate",
    "MultiAgentWorkflow",
    "AgentSessionStatus",
    "AgentLogLevel",
    "WorkflowStatus",
    # Client
    "Client",
    "ClientContact",
    "ClientArtifact",
    "ClientWithContacts",
]
