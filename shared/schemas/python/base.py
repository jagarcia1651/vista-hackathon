"""
Base Types and Common Models for PSA Domain
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class BaseEntity(BaseModel):
    """Base entity with common timestamp fields"""

    created_at: datetime
    last_updated_at: datetime

    class Config:
        # Allow datetime parsing from ISO strings
        json_encoders = {datetime: lambda v: v.isoformat()}


# Status Enums
class ProjectStatus(str, Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"
    BLOCKED = "blocked"


class QuoteStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    SENT = "sent"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


class SkillStatus(str, Enum):
    LEARNING = "learning"
    COMPETENT = "competent"
    EXPERT = "expert"
    CERTIFIED = "certified"


class ClientContactStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PRIMARY = "primary"
    BILLING = "billing"


class HolidayType(str, Enum):
    FIXED = "fixed"
    FLOATING = "floating"
    CALCULATED = "calculated"
