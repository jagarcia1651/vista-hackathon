"""
Project Entity Models - Python equivalents of shared TypeScript schemas
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Tuple, Union
from uuid import UUID

from pydantic import BaseModel, Field


# Base Entity Model
class BaseEntity(BaseModel):
    created_at: datetime
    last_updated_at: datetime


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


class PhaseStatus(str, Enum):
    PLANNED = "Planned"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    ON_HOLD = "On Hold"
    CANCELLED = "Cancelled"


# Core Project Models
class Project(BaseEntity):
    project_id: str
    client_id: str
    project_name: str
    project_status: str
    project_start_date: Optional[str] = None
    project_due_date: Optional[str] = None


class ProjectPhase(BaseEntity):
    project_phase_id: str
    project_id: str
    project_phase_number: int
    project_phase_name: str
    project_phase_description: Optional[str] = None
    project_phase_status: str
    project_phase_start_date: Optional[str] = None
    project_phase_due_date: Optional[str] = None


class ProjectTask(BaseEntity):
    project_task_id: str
    project_id: str
    project_phase_id: Optional[str] = None
    project_task_name: str
    project_task_description: Optional[str] = None
    project_task_status: str
    project_task_start_date: Optional[str] = None
    project_task_due_date: Optional[str] = None
    estimated_hours: Optional[int] = None
    actual_hours: Optional[int] = None


class ProjectTeam(BaseEntity):
    project_team_id: str
    project_team_name: str
    project_id: str
    project_phase_id: Optional[str] = None


class StafferAssignment(BaseEntity):
    staffer_assignment_id: str
    staffer_id: str
    project_task_id: str


# Extended Business Logic Models
class ProjectWithDetails(Project):
    client: Optional[dict] = None  # Will be Client type when client models exist
    phases: List[ProjectPhase] = Field(default_factory=list)
    total_tasks: int = 0
    completed_tasks: int = 0
    total_estimated_hours: int = 0
    total_actual_hours: int = 0
    progress: float = 0.0


class ProjectPhaseWithTasks(ProjectPhase):
    tasks: List[ProjectTask] = Field(default_factory=list)
    assigned_staffers: List[dict] = Field(
        default_factory=list
    )  # Will be Staffer type when staffer models exist
    progress: float = 0.0


class ProjectTaskWithAssignments(ProjectTask):
    assigned_staffers: List[dict] = Field(default_factory=list)  # Will be Staffer type
    is_overdue: bool = False
    days_remaining: Optional[int] = None


# Template Models for Project Planning
class SkillRequirement(BaseModel):
    skill_id: str
    required_level: str
    hours_needed: int
    is_mandatory: bool = True


class TaskTemplate(BaseModel):
    task_name: str
    estimated_hours: int
    required_skills: List[SkillRequirement] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)


class PhaseTemplate(BaseModel):
    phase_name: str
    phase_order: int
    tasks: List[TaskTemplate] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)


class ProjectTemplate(BaseModel):
    template_id: str
    template_name: str
    phases: List[PhaseTemplate] = Field(default_factory=list)
    estimated_duration_days: int
    required_skills: List[SkillRequirement] = Field(default_factory=list)


# Analytics Models
class ProjectMetrics(BaseModel):
    project_id: str
    on_time_delivery: bool
    budget_adherence: float
    client_satisfaction: float
    team_utilization: float
    scope_changes: int


class ProjectFinancials(BaseModel):
    project_id: str
    total_estimated_cost: float
    total_actual_cost: float
    total_billable_amount: float
    profit_margin: float
    budget_variance: float


# Filter Models
class ProjectFilters(BaseModel):
    status: Optional[List[ProjectStatus]] = None
    client_ids: Optional[List[str]] = None
    start_date_range: Optional[Tuple[str, str]] = None
    due_date_range: Optional[Tuple[str, str]] = None
    assigned_staffer_ids: Optional[List[str]] = None


# Progress Helper Model
class ProjectProgress(BaseModel):
    percentage: float
    tasks_completed: int
    tasks_total: int
    on_schedule: bool


# Request/Response Models for API
class ProjectManagementRequest(BaseModel):
    query: str
    project_context: Optional[str] = None


class ProjectCreateRequest(BaseModel):
    project_name: str
    client_id: str
    project_status: str = "RFP"
    project_start_date: Optional[str] = None
    project_due_date: Optional[str] = None
    description: Optional[str] = None


class ProjectUpdateRequest(BaseModel):
    project_name: Optional[str] = None
    project_status: Optional[str] = None
    project_start_date: Optional[str] = None
    project_due_date: Optional[str] = None


class PhaseCreateRequest(BaseModel):
    project_id: str
    phase_name: str
    phase_description: Optional[str] = None
    phase_number: int
    phase_status: str = "Planned"
    phase_start_date: Optional[str] = None
    phase_due_date: Optional[str] = None


class TaskCreateRequest(BaseModel):
    project_id: str
    task_name: str
    task_description: Optional[str] = None
    project_phase_id: Optional[str] = None
    task_status: str = "To Do"
    task_start_date: Optional[str] = None
    task_due_date: Optional[str] = None
    estimated_hours: Optional[int] = None


# Database Response Models
class DatabaseResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None


class ProjectResponse(DatabaseResponse):
    project: Optional[Project] = None


class PhaseResponse(DatabaseResponse):
    phase: Optional[ProjectPhase] = None


class TaskResponse(DatabaseResponse):
    task: Optional[ProjectTask] = None


class ProjectDetailsResponse(DatabaseResponse):
    project: Optional[Project] = None
    phases: List[ProjectPhase] = Field(default_factory=list)
    tasks: List[ProjectTask] = Field(default_factory=list)
    teams: List[ProjectTeam] = Field(default_factory=list)


class ClientsResponse(DatabaseResponse):
    clients: List[dict] = Field(
        default_factory=list
    )  # Will be Client type when client models exist


# Type Unions
ProjectEntity = Union[Project, ProjectPhase, ProjectTask]
