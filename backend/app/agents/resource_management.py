"""
Resource Management Agent - Specialized for staffer assignments and resource allocation
"""

import os
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

from ..models.project import DatabaseResponse, StafferAssignment
from ..utils.supabase_client import supabase_client

# Enhanced Resource Management System Prompt
RESOURCE_MANAGEMENT_PROMPT = """
You are a specialized Resource Management Agent for Professional Service Automation.

Your expertise includes:
- Staffer task assignment management
- Resource allocation optimization
- Workload balancing and capacity planning
- Time-off impact analysis and reassignment
- Skills-based resource matching
- Assignment conflict resolution

IMPORTANT TOOL USAGE GUIDELINES:
- To find a specific staffer's assignments: Use get_staffer_task_assignments() with the staffer's UUID
- To find assignments for all staffers or search by task/project: Use list_task_assignments() and analyze the results
- When you need to find a staffer by name or other attributes, first list all assignments and identify the correct staffer UUID
- CRITICAL: get_staffer_task_assignments() ONLY accepts UUID format - never pass names, emails, or other identifiers

Real-time thinking examples you should demonstrate:
- "Analyzing current staffer assignments..."
- "Checking for capacity conflicts..."
- "Evaluating skill alignment for task requirements..."
- "Identifying reassignment opportunities..."
- "Assessing workload distribution across team..."
- "Finding suitable replacement staffers..."
- "Listing all assignments to identify the correct staffer..."

Focus on maintaining project continuity while optimizing resource utilization.
Always consider skill requirements, availability, and workload balance when making assignment decisions.
Use the structured database tools to ensure data consistency and provide actionable recommendations.
"""


def _create_bedrock_model():
    """Create BedrockModel with API key or AWS credentials"""
    api_key = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
    model_id = os.getenv(
        "BEDROCK_MODEL_ID", "us.anthropic.claude-3-haiku-20240307-v1:0"
    )
    region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

    if api_key:
        # Use API key authentication
        os.environ["AWS_BEARER_TOKEN_BEDROCK"] = api_key

    return BedrockModel(model_id=model_id, region_name=region)


# Response Models for Resource Management
class AssignmentResponse(DatabaseResponse):
    assignment: Optional[StafferAssignment] = None


class AssignmentWithStafferName(BaseModel):
    """Assignment with staffer name included"""

    assignment: StafferAssignment
    staffer_name: Optional[str] = None


class AssignmentsListResponse(DatabaseResponse):
    assignments: List[AssignmentWithStafferName] = Field(default_factory=list)
    total_count: int = 0


class StafferAssignmentDetails(BaseModel):
    """Extended assignment details with task and staffer information"""

    assignment: StafferAssignment
    task_name: Optional[str] = None
    project_name: Optional[str] = None
    staffer_name: Optional[str] = None
    task_status: Optional[str] = None
    task_due_date: Optional[str] = None
    estimated_hours: Optional[int] = None


class StafferAssignmentsResponse(DatabaseResponse):
    staffer_id: str
    assignments: List[StafferAssignmentDetails] = Field(default_factory=list)
    total_assignments: int = 0
    total_estimated_hours: int = 0


# Database Tools for Resource Management
@tool
def get_staffer_task_assignments(staffer_id: str) -> StafferAssignmentsResponse:
    """
    Retrieve all task assignments for a specific staffer with detailed information.

    CRITICAL: This function ONLY accepts UUID format for staffer_id.
    Do NOT pass names, emails, or other identifiers - only valid UUIDs.
    If you need to find a staffer by name or other attributes, use list_task_assignments()
    first to identify the correct staffer UUID.

    Args:
        staffer_id: UUID of the staffer (MUST be in UUID format, e.g., '123e4567-e89b-12d3-a456-426614174000')

    Returns:
        StafferAssignmentsResponse with detailed assignment information
    """
    try:
        if not supabase_client:
            return StafferAssignmentsResponse(
                success=False,
                error="Database connection not available",
                staffer_id=staffer_id,
            )

        # Get assignments with joined task and project information
        assignments_result = (
            supabase_client.table("staffer_assignments")
            .select(
                """
                *,
                project_tasks!inner(
                    project_task_name,
                    project_task_status,
                    project_task_due_date,
                    estimated_hours,
                    projects!inner(project_name)
                ),
                staffers!inner(first_name, last_name)
            """
            )
            .eq("staffer_id", staffer_id)
            .execute()
        )

        if not assignments_result.data:
            return StafferAssignmentsResponse(
                success=True,
                staffer_id=staffer_id,
                assignments=[],
                total_assignments=0,
                total_estimated_hours=0,
                message=f"No assignments found for staffer {staffer_id}",
            )

        # Process assignments with detailed information
        detailed_assignments = []
        total_hours = 0

        for item in assignments_result.data:
            assignment = StafferAssignment(
                **{
                    k: v
                    for k, v in item.items()
                    if k
                    in [
                        "staffer_assignment_id",
                        "staffer_id",
                        "project_task_id",
                        "created_at",
                        "last_updated_at",
                    ]
                }
            )

            task_data = item.get("project_tasks", {})
            project_data = task_data.get("projects", {}) if task_data else {}
            staffer_data = item.get("staffers", {})

            # Build staffer name
            staffer_name = None
            if staffer_data:
                first_name = staffer_data.get("first_name", "")
                last_name = staffer_data.get("last_name", "")
                staffer_name = f"{first_name} {last_name}".strip() or None

            estimated_hours = task_data.get("estimated_hours", 0) if task_data else 0
            if estimated_hours:
                total_hours += estimated_hours

            detailed_assignment = StafferAssignmentDetails(
                assignment=assignment,
                task_name=task_data.get("project_task_name") if task_data else None,
                project_name=project_data.get("project_name") if project_data else None,
                staffer_name=staffer_name,
                task_status=task_data.get("project_task_status") if task_data else None,
                task_due_date=(
                    task_data.get("project_task_due_date") if task_data else None
                ),
                estimated_hours=estimated_hours,
            )
            detailed_assignments.append(detailed_assignment)

        return StafferAssignmentsResponse(
            success=True,
            staffer_id=staffer_id,
            assignments=detailed_assignments,
            total_assignments=len(detailed_assignments),
            total_estimated_hours=total_hours,
            message=f"Found {len(detailed_assignments)} assignments for staffer {staffer_id}",
        )

    except Exception as e:
        return StafferAssignmentsResponse(
            success=False, error=f"Database error: {str(e)}", staffer_id=staffer_id
        )


@tool
def list_task_assignments() -> AssignmentsListResponse:
    """
    Retrieve all task assignments across all staffers with staffer names included.

    Use this function when you need to:
    - Get an overview of all assignments in the system
    - Find a staffer's UUID when you only know their name or other attributes
    - Search for assignments by task or project information
    - Analyze overall resource allocation patterns

    Returns:
        AssignmentsListResponse with all assignments including staffer names
    """
    try:
        if not supabase_client:
            return AssignmentsListResponse(
                success=False, error="Database connection not available"
            )

        # Get all assignments with staffer names
        result = (
            supabase_client.table("staffer_assignments")
            .select(
                """
                *,
                staffers!inner(first_name, last_name)
            """
            )
            .execute()
        )

        if not result.data:
            return AssignmentsListResponse(
                success=True,
                assignments=[],
                total_count=0,
                message="No task assignments found",
            )

        # Create structured assignment models with staffer names
        assignments_with_names = []
        for item in result.data:
            # Extract assignment data
            assignment = StafferAssignment(
                **{
                    k: v
                    for k, v in item.items()
                    if k
                    in [
                        "staffer_assignment_id",
                        "staffer_id",
                        "project_task_id",
                        "created_at",
                        "last_updated_at",
                    ]
                }
            )

            # Extract staffer name
            staffer_data = item.get("staffers", {})
            staffer_name = None
            if staffer_data:
                first_name = staffer_data.get("first_name", "")
                last_name = staffer_data.get("last_name", "")
                staffer_name = f"{first_name} {last_name}".strip() or None

            assignment_with_name = AssignmentWithStafferName(
                assignment=assignment, staffer_name=staffer_name
            )
            assignments_with_names.append(assignment_with_name)

        return AssignmentsListResponse(
            success=True,
            assignments=assignments_with_names,
            total_count=len(assignments_with_names),
            message=f"Found {len(assignments_with_names)} total task assignments with staffer names",
        )

    except Exception as e:
        return AssignmentsListResponse(success=False, error=f"Database error: {str(e)}")


@tool
def assign_staffer_task_assignment(
    staffer_id: str, project_task_id: str
) -> AssignmentResponse:
    """
    Create a new staffer task assignment.

    Args:
        staffer_id: UUID of the staffer
        project_task_id: UUID of the project task

    Returns:
        AssignmentResponse with created assignment data
    """
    try:
        if not supabase_client:
            return AssignmentResponse(
                success=False, error="Database connection not available"
            )

        # Check if assignment already exists
        existing_result = (
            supabase_client.table("staffer_assignments")
            .select("*")
            .eq("staffer_id", staffer_id)
            .eq("project_task_id", project_task_id)
            .execute()
        )

        if existing_result.data:
            return AssignmentResponse(
                success=False,
                error=f"Assignment already exists between staffer {staffer_id} and task {project_task_id}",
            )

        # Verify staffer exists
        staffer_result = (
            supabase_client.table("staffers")
            .select("id, first_name, last_name")
            .eq("id", staffer_id)
            .execute()
        )

        if not staffer_result.data:
            return AssignmentResponse(
                success=False, error=f"Staffer with ID {staffer_id} not found"
            )

        # Verify task exists
        task_result = (
            supabase_client.table("project_tasks")
            .select("project_task_id, project_task_name")
            .eq("project_task_id", project_task_id)
            .execute()
        )

        if not task_result.data:
            return AssignmentResponse(
                success=False, error=f"Project task with ID {project_task_id} not found"
            )

        # Create assignment data
        assignment_data = {
            "staffer_id": staffer_id,
            "project_task_id": project_task_id,
            "created_at": datetime.utcnow().isoformat(),
            "last_updated_at": datetime.utcnow().isoformat(),
        }

        # Insert assignment
        result = (
            supabase_client.table("staffer_assignments")
            .insert(assignment_data)
            .execute()
        )

        if result.data:
            assignment = StafferAssignment(**result.data[0])

            # Get additional context for response message
            staffer_name = f"{staffer_result.data[0].get('first_name', '')} {staffer_result.data[0].get('last_name', '')}".strip()
            task_name = task_result.data[0].get("project_task_name", "Unknown Task")

            return AssignmentResponse(
                success=True,
                assignment=assignment,
                message=f"Successfully assigned {staffer_name or staffer_id} to task '{task_name}'",
            )
        else:
            return AssignmentResponse(
                success=False, error="Failed to create assignment"
            )

    except Exception as e:
        return AssignmentResponse(success=False, error=f"Database error: {str(e)}")


@tool
def resource_management_agent(
    query: str, resource_context: Optional[str] = None
) -> str:
    """
    Handle resource management queries with structured models and database integration.

    Args:
        query: Resource management question or request
        resource_context: Optional context about existing assignments or staffers

    Returns:
        Structured resource management response with actionable recommendations
    """
    try:
        # Create specialized resource management agent with structured tools
        bedrock_model = _create_bedrock_model()

        rm_agent = Agent(
            model=bedrock_model,
            system_prompt=RESOURCE_MANAGEMENT_PROMPT,
            tools=[
                get_staffer_task_assignments,
                list_task_assignments,
                assign_staffer_task_assignment,
            ],
        )

        # Enhance query with context if provided
        enhanced_query = query
        if resource_context:
            enhanced_query = f"Resource Context: {resource_context}\n\nQuery: {query}"

        # Get agent response
        response = rm_agent(enhanced_query)

        # Structure the response for consistency
        return f"Resource Management Analysis:\n{str(response)}"

    except Exception as e:
        return f"Error in resource management agent: {str(e)}"
