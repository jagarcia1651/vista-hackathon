from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field
from strands import Agent, tool

from ..utils.supabase_client import supabase_client


# Pydantic Models for Structured Input/Output
class TimeOffRequest(BaseModel):
    """Structured time-off request data"""

    staffer_name: str = Field(description="Full name of the staffer taking time off")
    staffer_id: Optional[str] = Field(
        None, description="UUID of the staffer (if known)"
    )
    time_off_hours: float = Field(description="Number of hours requested for time off")
    start_datetime: str = Field(
        description="Start date and time of time off (ISO format)"
    )
    end_datetime: str = Field(description="End date and time of time off (ISO format)")
    time_off_type: Optional[str] = Field(
        "PTO", description="Type of time off (PTO, Sick, etc.)"
    )


class StafferInfo(BaseModel):
    """Staffer information for assignment matching"""

    staffer_id: str
    first_name: str
    last_name: str
    title: str
    capacity: float
    time_zone: Optional[str] = None
    seniority_level: Optional[int] = None


class TaskAssignment(BaseModel):
    """Task assignment details"""

    task_id: str
    task_name: str
    project_id: str
    project_name: Optional[str] = None
    estimated_hours: Optional[int] = None
    task_start_date: Optional[str] = None
    task_due_date: Optional[str] = None
    current_staffer_id: str


class NewTaskAssignment(BaseModel):
    """New task assignment created by the agent"""

    original_staffer_id: str
    original_staffer_name: str
    new_staffer_id: str
    new_staffer_name: str
    task_id: str
    task_name: str
    project_name: Optional[str] = None
    assignment_reason: str
    confidence_score: float = Field(
        ge=0.0, le=1.0, description="Confidence in the assignment match (0-1)"
    )


class ResourceManagementResponse(BaseModel):
    """Structured response from resource management agent"""

    success: bool
    message: str
    affected_tasks_count: int
    new_assignments: List[NewTaskAssignment]
    warnings: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


# Database Tools
@tool
def find_staffer_by_name(staffer_name: str) -> Optional[StafferInfo]:
    """
    Find a staffer by their full name in the database.

    Args:
        staffer_name: Full name of the staffer to find

    Returns:
        StafferInfo object if found, None otherwise
    """
    try:
        if not supabase_client:
            print("Did not find supabase client")
            return None

        # Try to parse first and last name
        name_parts = staffer_name.strip().split()
        if len(name_parts) >= 2:
            first_name = name_parts[0]
            last_name = " ".join(name_parts[1:])

            result = (
                supabase_client.table("staffers")
                .select(
                    "id, first_name, last_name, title, capacity, time_zone, seniority_id"
                )
                .eq("first_name", first_name)
                .eq("last_name", last_name)
                .execute()
            )
        else:
            # Fallback: search in both first and last name fields
            result = (
                supabase_client.table("staffers")
                .select(
                    "id, first_name, last_name, title, capacity, time_zone, seniority_id"
                )
                .or_(
                    f"first_name.ilike.%{staffer_name}%,last_name.ilike.%{staffer_name}%"
                )
                .execute()
            )

        if result.data and len(result.data) > 0:
            staffer = result.data[0]

            # Get seniority level if available
            seniority_level = None
            if staffer.get("seniority_id"):
                seniority_result = (
                    supabase_client.table("seniorities")
                    .select("seniority_level")
                    .eq("seniority_id", staffer["seniority_id"])
                    .execute()
                )
                if seniority_result.data:
                    seniority_level = seniority_result.data[0]["seniority_level"]

            return StafferInfo(
                staffer_id=staffer["id"],
                first_name=staffer["first_name"],
                last_name=staffer["last_name"],
                title=staffer["title"],
                capacity=staffer["capacity"],
                time_zone=staffer.get("time_zone"),
                seniority_level=seniority_level,
            )

    except Exception as e:
        print(f"Error finding staffer by name: {e}")

    return None


@tool
def get_staffer_task_assignments(
    staffer_id: str, start_date: str, end_date: str
) -> List[TaskAssignment]:
    """
    Get all task assignments for a staffer that overlap with the given time period.

    Args:
        staffer_id: UUID of the staffer
        start_date: Start date to check (ISO format)
        end_date: End date to check (ISO format)

    Returns:
        List of TaskAssignment objects that may be affected
    """
    try:
        if not supabase_client:
            print("Did not find supabase client")
            return []

        # Get staffer assignments with task and project details
        result = (
            supabase_client.table("staffer_assignments")
            .select(
                """
                project_task_id,
                project_tasks!inner(
                    project_task_id,
                    project_task_name,
                    project_id,
                    estimated_hours,
                    project_task_start_date,
                    project_task_due_date,
                    projects!inner(
                        project_name
                    )
                )
            """
            )
            .eq("staffer_id", staffer_id)
            .execute()
        )

        assignments = []
        if result.data:
            for assignment in result.data:
                task = assignment["project_tasks"]
                project = task["projects"]

                # Check if task overlaps with time-off period
                task_start = task.get("project_task_start_date")
                task_due = task.get("project_task_due_date")

                # If task has no dates, assume it might be affected
                overlaps = True
                if task_start and task_due:
                    # Simple overlap check - could be made more sophisticated
                    task_start_dt = datetime.fromisoformat(
                        task_start.replace("Z", "+00:00")
                    )
                    task_due_dt = datetime.fromisoformat(
                        task_due.replace("Z", "+00:00")
                    )
                    timeoff_start_dt = datetime.fromisoformat(
                        start_date.replace("Z", "+00:00")
                    )
                    timeoff_end_dt = datetime.fromisoformat(
                        end_date.replace("Z", "+00:00")
                    )

                    overlaps = not (
                        task_due_dt < timeoff_start_dt or task_start_dt > timeoff_end_dt
                    )

                if overlaps:
                    assignments.append(
                        TaskAssignment(
                            task_id=task["project_task_id"],
                            task_name=task["project_task_name"],
                            project_id=task["project_id"],
                            project_name=project["project_name"],
                            estimated_hours=task.get("estimated_hours"),
                            task_start_date=task.get("project_task_start_date"),
                            task_due_date=task.get("project_task_due_date"),
                            current_staffer_id=staffer_id,
                        )
                    )

        return assignments

    except Exception as e:
        print(f"Error getting staffer task assignments: {e}")
        return []


@tool
def find_available_staffers(
    exclude_staffer_id: str, required_skills: Optional[List[str]] = None
) -> List[StafferInfo]:
    """
    Find staffers who could potentially take on reassigned tasks.

    Args:
        exclude_staffer_id: ID of staffer taking time off (to exclude)
        required_skills: Optional list of skill names to match

    Returns:
        List of available StafferInfo objects
    """
    try:
        if not supabase_client:
            print("Did not find supabase client")
            return []

        # Base query for available staffers
        query = (
            supabase_client.table("staffers")
            .select(
                """
                id,
                first_name,
                last_name,
                title,
                capacity,
                time_zone,
                seniority_id,
                seniorities!inner(seniority_level)
            """
            )
            .neq("id", exclude_staffer_id)
        )

        result = query.execute()

        available_staffers = []
        if result.data:
            for staffer in result.data:
                # If skills are required, check if staffer has them
                if required_skills:
                    skills_result = (
                        supabase_client.table("staffer_skills")
                        .select("skills!inner(skill_name)")
                        .eq("staffer_id", staffer["id"])
                        .execute()
                    )

                    staffer_skills = [
                        s["skills"]["skill_name"] for s in skills_result.data or []
                    ]
                    has_required_skills = any(
                        skill in staffer_skills for skill in required_skills
                    )

                    if not has_required_skills:
                        continue

                available_staffers.append(
                    StafferInfo(
                        staffer_id=staffer["id"],
                        first_name=staffer["first_name"],
                        last_name=staffer["last_name"],
                        title=staffer["title"],
                        capacity=staffer["capacity"],
                        time_zone=staffer.get("time_zone"),
                        seniority_level=(
                            staffer["seniorities"]["seniority_level"]
                            if staffer.get("seniorities")
                            else None
                        ),
                    )
                )

        # Sort by seniority and capacity for better matching
        available_staffers.sort(
            key=lambda x: (x.seniority_level or 0, x.capacity), reverse=True
        )

        return available_staffers

    except Exception as e:
        print(f"Error finding available staffers: {e}")
        return []


@tool
def create_new_task_assignment(new_staffer_id: str, task_id: str) -> bool:
    """
    Create a new task assignment in the database.

    Args:
        new_staffer_id: ID of the staffer to assign
        task_id: ID of the task to assign

    Returns:
        True if successful, False otherwise
    """
    try:
        if not supabase_client:
            print("Did not find supabase client")
            return False

        assignment_data = {
            "staffer_id": new_staffer_id,
            "project_task_id": task_id,
            "created_at": datetime.utcnow().isoformat(),
            "last_updated_at": datetime.utcnow().isoformat(),
        }

        result = (
            supabase_client.table("staffer_assignments")
            .insert(assignment_data)
            .execute()
        )

        return bool(result.data)

    except Exception as e:
        print(f"Error creating new task assignment: {e}")
        return False


@tool
def remove_task_assignment(staffer_id: str, task_id: str) -> bool:
    """
    Remove an existing task assignment.

    Args:
        staffer_id: ID of the current staffer
        task_id: ID of the task

    Returns:
        True if successful, False otherwise
    """
    try:
        if not supabase_client:
            print("Did not find supabase client")
            return False

        result = (
            supabase_client.table("staffer_assignments")
            .delete()
            .eq("staffer_id", staffer_id)
            .eq("project_task_id", task_id)
            .execute()
        )

        return True

    except Exception as e:
        print(f"Error removing task assignment: {e}")
        return False


# System Prompt for Resource Management Agent
RESOURCE_MANAGEMENT_PROMPT = """
You are a resource management specialist focused on handling staffer time-off scenarios and task reassignments.

When a staffer takes time off, your job is to:
1. Identify affected task assignments that overlap with the time-off period
2. Find suitable replacement staffers based on skills, capacity, and availability
3. Create new task assignments to ensure project continuity
4. Provide structured responses with clear recommendations

Key principles:
- Prioritize task continuity and project deadlines
- Match staffers based on skills, seniority, and capacity
- Consider time zones and existing workload
- Provide confidence scores for assignment recommendations
- Always use structured database tools to gather current information
- Return structured responses using the ResourceManagementResponse model

You have access to database tools to:
- Find staffers by name
- Get affected task assignments
- Find available replacement staffers  
- Create and remove task assignments

Always provide actionable recommendations with clear reasoning.
"""


@tool
def resource_management_agent(
    time_off_data: Dict[str, Any],
) -> ResourceManagementResponse:
    """
    Handle time-off reassignment scenarios with structured database integration.

    Args:
        time_off_data: Dictionary containing time-off request information with the following structure:
            - staffer_name (str): Full name of the staffer taking time off
            - staffer_id (str, optional): UUID of the staffer if known
            - time_off_hours (float): Number of hours requested for time off
            - start_datetime (str): Start date and time in ISO format (e.g., "2025-08-20T04:00:00")
            - end_datetime (str): End date and time in ISO format (e.g., "2025-08-20T08:00:00")
            - time_off_type (str, optional): Type of time off ("PTO", "Sick", etc.), defaults to "PTO"

    Example input:
        {
            "staffer_name": "Nate Hernandez",
            "time_off_hours": 4.0,
            "start_datetime": "2025-08-20T04:00:00",
            "end_datetime": "2025-08-20T08:00:00",
            "time_off_type": "PTO"
        }

    Returns:
        ResourceManagementResponse with structured assignment recommendations
    """
    try:
        # Parse input data into structured model
        time_off_request = TimeOffRequest(**time_off_data)

        # Create specialized resource management agent with database tools
        resource_agent = Agent(
            system_prompt=RESOURCE_MANAGEMENT_PROMPT
            + "\n\nIMPORTANT: Complete the task in a single pass. Do not retry tools unless there's an actual error.",
            tools=[
                find_staffer_by_name,
                get_staffer_task_assignments,
                find_available_staffers,
                create_new_task_assignment,
                remove_task_assignment,
            ],
        )

        print(resource_agent.tool_names)

        # Convert time_off_data to a formatted message string
        time_off_message = f"""
        Process this time-off request and handle task reassignments:
        
        Staffer: {time_off_request.staffer_name}
        Time Off Hours: {time_off_request.time_off_hours}
        Start: {time_off_request.start_datetime}
        End: {time_off_request.end_datetime}
        Type: {time_off_request.time_off_type}
        
        Please:
        1. Find the staffer in the database
        2. Identify affected task assignments during this time period
        3. Find suitable replacement staffers
        4. Create reassignment recommendations
        """

        # Use Strands' native structured output feature
        structured_response = resource_agent.structured_output(
            ResourceManagementResponse, time_off_message
        )

        return structured_response

    except Exception as e:
        return ResourceManagementResponse(
            success=False,
            message=f"Error in resource management: {str(e)}",
            affected_tasks_count=0,
            new_assignments=[],
            warnings=[f"Processing error: {str(e)}"],
        )
