from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID

from agents import Agent, function_tool
from pydantic import BaseModel, Field

from ...events.bus import AgentType, BusinessEvent, BusinessEventType, event_bus
from ...utils.supabase_client import supabase_client


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
    project_id: str
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
@function_tool
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


@function_tool
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
                    try:
                        # Parse dates - database should now return proper date objects or ISO strings
                        from datetime import date

                        # Handle both date objects and string formats
                        if isinstance(task_start, str):
                            task_start_dt = datetime.fromisoformat(
                                task_start.replace("Z", "+00:00")
                            ).date()
                        elif isinstance(task_start, date):
                            task_start_dt = task_start
                        else:
                            task_start_dt = None

                        if isinstance(task_due, str):
                            task_due_dt = datetime.fromisoformat(
                                task_due.replace("Z", "+00:00")
                            ).date()
                        elif isinstance(task_due, date):
                            task_due_dt = task_due
                        else:
                            task_due_dt = None

                        if isinstance(start_date, str):
                            timeoff_start_dt = datetime.fromisoformat(
                                start_date.replace("Z", "+00:00")
                            ).date()
                        elif isinstance(start_date, date):
                            timeoff_start_dt = start_date
                        else:
                            timeoff_start_dt = None

                        if isinstance(end_date, str):
                            timeoff_end_dt = datetime.fromisoformat(
                                end_date.replace("Z", "+00:00")
                            ).date()
                        elif isinstance(end_date, date):
                            timeoff_end_dt = end_date
                        else:
                            timeoff_end_dt = None

                        # Only check overlap if all dates were parsed successfully
                        if all(
                            [
                                task_start_dt,
                                task_due_dt,
                                timeoff_start_dt,
                                timeoff_end_dt,
                            ]
                        ):
                            overlaps = not (
                                task_due_dt < timeoff_start_dt
                                or task_start_dt > timeoff_end_dt
                            )
                        # If any date parsing failed, assume overlap to be safe
                    except Exception as e:
                        print(
                            f"Warning: Date parsing failed for task {task.get('project_task_id', 'unknown')}: {e}"
                        )
                        # Assume overlap when dates can't be parsed

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


@function_tool
def find_available_staffers(
    exclude_staffer_id: str,
    start_date: str,
    end_date: str,
    project_ids: Optional[List[str]] = None,
) -> List[StafferInfo]:
    """
    Find staffers who are available (no PTO conflicts) and on relevant project teams during the specified time period.

    Args:
        exclude_staffer_id: ID of staffer taking time off (to exclude)
        start_date: Start date to check availability (ISO format)
        end_date: End date to check availability (ISO format)
        project_ids: Optional list of project IDs to filter team members (if provided, only return staffers on these project teams)

    Returns:
        List of available StafferInfo objects (no PTO conflicts and on project teams)
    """
    try:
        if not supabase_client:
            print("Did not find supabase client")
            return []

        # Get all staffers (excluding the one taking time off)
        staffers_result = (
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
                seniorities(seniority_level)
            """
            )
            .neq("id", exclude_staffer_id)
            .execute()
        )

        if not staffers_result.data:
            return []

        # Parse the time period for comparison
        try:
            from datetime import date

            if isinstance(start_date, str):
                check_start_dt = datetime.fromisoformat(
                    start_date.replace("Z", "+00:00")
                ).date()
            elif isinstance(start_date, date):
                check_start_dt = start_date
            else:
                print(f"Warning: Invalid start_date format: {start_date}")
                return []

            if isinstance(end_date, str):
                check_end_dt = datetime.fromisoformat(
                    end_date.replace("Z", "+00:00")
                ).date()
            elif isinstance(end_date, date):
                check_end_dt = end_date
            else:
                print(f"Warning: Invalid end_date format: {end_date}")
                return []
        except Exception as date_error:
            print(f"Error parsing availability check dates: {date_error}")
            return []

        available_staffers = []

        for staffer in staffers_result.data:
            staffer_id = staffer["id"]

            # Check if this staffer has any conflicting time off
            time_off_result = (
                supabase_client.table("staffer_time_off")
                .select("time_off_start_datetime, time_off_end_datetime")
                .eq("staffer_id", staffer_id)
                .execute()
            )

            has_conflict = False
            if time_off_result.data:
                for time_off in time_off_result.data:
                    try:
                        pto_start = time_off.get("time_off_start_datetime")
                        pto_end = time_off.get("time_off_end_datetime")

                        if pto_start and pto_end:
                            # Parse PTO dates
                            if isinstance(pto_start, str):
                                pto_start_dt = datetime.fromisoformat(
                                    pto_start.replace("Z", "+00:00")
                                ).date()
                            elif isinstance(pto_start, date):
                                pto_start_dt = pto_start
                            else:
                                continue

                            if isinstance(pto_end, str):
                                pto_end_dt = datetime.fromisoformat(
                                    pto_end.replace("Z", "+00:00")
                                ).date()
                            elif isinstance(pto_end, date):
                                pto_end_dt = pto_end
                            else:
                                continue

                            # Check for overlap
                            if not (
                                pto_end_dt < check_start_dt
                                or pto_start_dt > check_end_dt
                            ):
                                has_conflict = True
                                break

                    except Exception as pto_date_error:
                        print(
                            f"Warning: Error parsing PTO dates for staffer {staffer_id}: {pto_date_error}"
                        )
                        continue

            # If no PTO conflict, check team membership
            if not has_conflict:
                # If project IDs are specified, check if staffer is on any of those project teams
                is_on_project_team = True  # Default to True if no project filtering
                if project_ids:
                    team_membership_result = (
                        supabase_client.table("project_team_memberships")
                        .select("project_team_id, project_teams!inner(project_id)")
                        .eq("staffer_id", staffer_id)
                        .in_("project_teams.project_id", project_ids)
                        .execute()
                    )

                    is_on_project_team = bool(team_membership_result.data)

                # Only add if staffer is on the relevant project team(s)
                if is_on_project_team:
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
                                if staffer.get("seniorities") and staffer["seniorities"]
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


@function_tool
def get_project_ids_from_tasks(task_assignments: List[TaskAssignment]) -> List[str]:
    """
    Extract unique project IDs from a list of task assignments.

    Args:
        task_assignments: List of TaskAssignment objects

    Returns:
        List of unique project IDs
    """
    project_ids = list(
        set(task.project_id for task in task_assignments if task.project_id)
    )
    return project_ids


# System Prompt for Resource Management Agent
RESOURCE_MANAGEMENT_PROMPT = """
You are a resource management specialist focused on handling staffer time-off scenarios and task reassignments.

When a staffer takes time off, your job is to:
1. Identify affected task assignments that overlap with the time-off period
2. Find suitable replacement staffers who are available (no PTO conflicts) and on the same project teams
3. **CLEARLY INDICATE which staffers should be assigned to which specific tasks**
4. Provide structured responses with explicit assignment recommendations

CRITICAL WORKFLOW:
1. First, get the affected task assignments for the staffer
2. Extract the project IDs from those tasks using get_project_ids_from_tasks
3. Find available staffers using those project IDs to ensure team membership
4. Create specific NewTaskAssignment recommendations with UUIDs

CRITICAL: Your response must explicitly indicate assignment intentions using the structured models:
- Use NewTaskAssignment objects to specify exactly which staffer should take over which task
- Include clear reasoning in the assignment_reason field
- Provide confidence scores for each recommended assignment
- Include both original_staffer_id and new_staffer_id (UUIDs) in assignments
- If no suitable replacement is found, clearly state this in warnings

Key principles:
- **ONLY suggest staffers who are on the same project teams as the affected tasks**
- Prioritize task continuity and project deadlines
- Ensure no PTO conflicts for replacement staffers
- Consider seniority, capacity, and time zones
- **Always populate the new_assignments list with specific assignment recommendations**
- Provide confidence scores for assignment recommendations (0.0 to 1.0)
- Always use structured database tools to gather current information
- Return structured responses using the ResourceManagementResponse model

Assignment Decision Making:
- For each affected task, determine if a replacement staffer should be assigned
- If yes: Create a NewTaskAssignment with original staffer UUID, new staffer UUID, and clear reasoning
- If no suitable replacement: Document this in warnings with explanation
- Consider staffer availability, project team membership, and capacity

You have access to database tools to:
- Find staffers by name
- Get affected task assignments
- Extract project IDs from task assignments
- Find available replacement staffers (filtered by project team membership)

Always provide actionable assignment recommendations with clear reasoning, confidence scores, and proper UUIDs.
"""

# Create the resource management agent using OpenAI Agents SDK
resource_management_agent = Agent(
    name="resource_management_agent",
    instructions=RESOURCE_MANAGEMENT_PROMPT,
    tools=[
        find_staffer_by_name,
        get_staffer_task_assignments,
        get_project_ids_from_tasks,
        find_available_staffers,
    ],
)


async def handle_resource_management(
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

        # Emit event for starting time-off processing
        await event_bus.emit(
            BusinessEvent(
                type=BusinessEventType.UPDATE,
                message=f"Processing time-off request for {time_off_request.staffer_name} from {time_off_request.start_datetime} to {time_off_request.end_datetime}",
                agent_id=AgentType.RESOURCE_MANAGEMENT,
            )
        )

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
        
        Return a structured ResourceManagementResponse with:
        - success (bool)
        - message (str)
        - affected_tasks_count (int)
        - new_assignments (List[NewTaskAssignment])
        - warnings (List[str])
        - recommendations (List[str])
        """

        # Run the agent with the OpenAI Agents SDK
        from agents import Runner

        result = await Runner.run(
            agent=resource_management_agent, input=time_off_message
        )

        # Parse the result into the structured response format
        response = ResourceManagementResponse(
            success=True,
            message=str(result),
            affected_tasks_count=0,  # This would be parsed from the actual response
            new_assignments=[],
            warnings=[],
            recommendations=[],
        )

        # Emit events for suggested reassignments
        for assignment in response.new_assignments:
            await event_bus.emit(
                BusinessEvent(
                    type=BusinessEventType.UPDATE,
                    message=f"Suggested reassignment: Task '{assignment.task_name}' from {assignment.original_staffer_name} to {assignment.new_staffer_name} (Confidence: {assignment.confidence_score})",
                    agent_id=AgentType.RESOURCE_MANAGEMENT,
                )
            )

        # Emit event for completing time-off processing
        await event_bus.emit(
            BusinessEvent(
                type=BusinessEventType.UPDATE,
                message=f"Completed processing time-off request for {time_off_request.staffer_name}. Found {len(response.new_assignments)} task reassignments.",
                agent_id=AgentType.RESOURCE_MANAGEMENT,
            )
        )

        return response

    except Exception as e:
        error_response = ResourceManagementResponse(
            success=False,
            message=f"Error in resource management: {str(e)}",
            affected_tasks_count=0,
            new_assignments=[],
            warnings=[f"Processing error: {str(e)}"],
        )

        # Emit error event
        await event_bus.emit(
            BusinessEvent(
                type=BusinessEventType.ERROR,
                message=f"Error processing time-off request: {str(e)}",
                agent_id=AgentType.RESOURCE_MANAGEMENT,
            )
        )

        return error_response
