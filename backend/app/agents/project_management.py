"""
Project Management Agent - Specialized for project planning, tracking, and optimization
"""

import json
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

from strands import Agent, tool
from strands.models.bedrock import BedrockModel

from ..models.project import (
    ClientsResponse,
    DatabaseResponse,
    PhaseCreateRequest,
    PhaseResponse,
    Project,
    ProjectCreateRequest,
    ProjectDetailsResponse,
    ProjectPhase,
    ProjectResponse,
    ProjectTask,
    ProjectTeam,
    ProjectUpdateRequest,
    ProjectWithDetails,
    StafferAssignment,
    TaskCreateRequest,
    TaskResponse,
)
from ..utils.supabase_client import supabase_client

# Enhanced Project Management System Prompt
PROJECT_MANAGEMENT_PROMPT = """
You are a specialized Project Management Agent for Professional Service Automation.

Your expertise includes:
- Project planning and breakdown structure creation
- Timeline estimation and milestone planning
- Resource requirement analysis
- Risk assessment and mitigation strategies
- Project status monitoring and reporting
- Project optimization and corrective actions
- Integration with PSA database systems

Real-time thinking examples you should demonstrate:
- "Analyzing project requirements..."
- "Breaking down scope into work packages..."
- "Checking resource availability for timeline estimation..."
- "Identifying potential scheduling conflicts..."
- "Calculating critical path dependencies..."
- "Generating risk assessment based on project complexity..."
- "Optimizing task sequence for fastest delivery..."

Focus on providing actionable project management insights based on PSA best practices.
Always structure your responses with clear phases, tasks, and timelines.
When working with database operations, confirm success and provide structured feedback.
Use the structured models to ensure data consistency and type safety.
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


# Database Tools for Project Management with Structured Types
@tool
def create_project_record(
    project_name: str,
    client_id: str,
    project_status: str = "RFP",
    project_start_date: Optional[str] = None,
    project_due_date: Optional[str] = None,
) -> ProjectResponse:
    """
    Create a new project record in the database using structured Project model.

    Args:
        project_name: Name of the project
        client_id: UUID of the client
        project_status: Status of the project (RFP, Pending, Active, etc.)
        project_start_date: Project start date (YYYY-MM-DD format)
        project_due_date: Project due date (YYYY-MM-DD format)

    Returns:
        ProjectResponse with structured project data
    """
    try:
        if not supabase_client:
            return ProjectResponse(
                success=False, error="Database connection not available"
            )

        # Prepare project data
        project_data = {
            "project_name": project_name,
            "client_id": client_id,
            "project_status": project_status,
            "project_start_date": project_start_date,
            "project_due_date": project_due_date,
            "created_at": datetime.utcnow().isoformat(),
            "last_updated_at": datetime.utcnow().isoformat(),
        }

        # Insert project
        result = supabase_client.table("projects").insert(project_data).execute()

        if result.data:
            # Create structured Project model
            project = Project(**result.data[0])
            return ProjectResponse(
                success=True,
                project=project,
                message=f"Project '{project_name}' created successfully",
            )
        else:
            return ProjectResponse(success=False, error="Failed to create project")

    except Exception as e:
        return ProjectResponse(success=False, error=f"Database error: {str(e)}")


@tool
def update_project_record(
    project_id: str, updates: ProjectUpdateRequest
) -> ProjectResponse:
    """
    Update an existing project record using structured update model.

    Args:
        project_id: UUID of the project to update
        updates: ProjectUpdateRequest with fields to update

    Returns:
        ProjectResponse with updated project data
    """
    try:
        if not supabase_client:
            return ProjectResponse(
                success=False, error="Database connection not available"
            )

        # Convert updates to dict, excluding None values
        update_data = updates.model_dump(exclude_none=True)
        update_data["last_updated_at"] = datetime.utcnow().isoformat()

        # Update project
        result = (
            supabase_client.table("projects")
            .update(update_data)
            .eq("project_id", project_id)
            .execute()
        )

        if result.data:
            project = Project(**result.data[0])
            return ProjectResponse(
                success=True,
                project=project,
                message=f"Project {project_id} updated successfully",
            )
        else:
            return ProjectResponse(
                success=False, error="Project not found or update failed"
            )

    except Exception as e:
        return ProjectResponse(success=False, error=f"Database error: {str(e)}")


@tool
def get_project_details(project_id: str) -> ProjectDetailsResponse:
    """
    Retrieve detailed project information with structured models.

    Args:
        project_id: UUID of the project

    Returns:
        ProjectDetailsResponse with complete structured project details
    """
    try:
        if not supabase_client:
            return ProjectDetailsResponse(
                success=False, error="Database connection not available"
            )

        # Get project with related data
        project_result = (
            supabase_client.table("projects")
            .select("*")
            .eq("project_id", project_id)
            .execute()
        )

        if not project_result.data:
            return ProjectDetailsResponse(success=False, error="Project not found")

        # Create structured models
        project = Project(**project_result.data[0])

        # Get project phases
        phases_result = (
            supabase_client.table("project_phases")
            .select("*")
            .eq("project_id", project_id)
            .order("project_phase_number")
            .execute()
        )
        phases = [ProjectPhase(**phase) for phase in (phases_result.data or [])]

        # Get project tasks
        tasks_result = (
            supabase_client.table("project_tasks")
            .select("*")
            .eq("project_id", project_id)
            .execute()
        )
        tasks = [ProjectTask(**task) for task in (tasks_result.data or [])]

        # Get project teams
        teams_result = (
            supabase_client.table("project_teams")
            .select("*")
            .eq("project_id", project_id)
            .execute()
        )
        teams = [ProjectTeam(**team) for team in (teams_result.data or [])]

        return ProjectDetailsResponse(
            success=True, project=project, phases=phases, tasks=tasks, teams=teams
        )

    except Exception as e:
        return ProjectDetailsResponse(success=False, error=f"Database error: {str(e)}")


@tool
def create_project_phase(phase_request: PhaseCreateRequest) -> PhaseResponse:
    """
    Create a new project phase using structured request model.

    Args:
        phase_request: PhaseCreateRequest with phase details

    Returns:
        PhaseResponse with created phase data
    """
    try:
        if not supabase_client:
            return PhaseResponse(
                success=False, error="Database connection not available"
            )

        phase_data = {
            "project_id": phase_request.project_id,
            "project_phase_name": phase_request.phase_name,
            "project_phase_description": phase_request.phase_description,
            "project_phase_number": phase_request.phase_number,
            "project_phase_status": phase_request.phase_status,
            "project_phase_start_date": phase_request.phase_start_date,
            "project_phase_due_date": phase_request.phase_due_date,
            "created_at": datetime.utcnow().isoformat(),
            "last_updated_at": datetime.utcnow().isoformat(),
        }

        result = supabase_client.table("project_phases").insert(phase_data).execute()

        if result.data:
            phase = ProjectPhase(**result.data[0])
            return PhaseResponse(
                success=True,
                phase=phase,
                message=f"Phase '{phase_request.phase_name}' created successfully",
            )
        else:
            return PhaseResponse(success=False, error="Failed to create phase")

    except Exception as e:
        return PhaseResponse(success=False, error=f"Database error: {str(e)}")


@tool
def create_project_task(task_request: TaskCreateRequest) -> TaskResponse:
    """
    Create a new project task using structured request model.

    Args:
        task_request: TaskCreateRequest with task details

    Returns:
        TaskResponse with created task data
    """
    try:
        if not supabase_client:
            return TaskResponse(
                success=False, error="Database connection not available"
            )

        task_data = {
            "project_id": task_request.project_id,
            "project_phase_id": task_request.project_phase_id,
            "project_task_name": task_request.task_name,
            "project_task_description": task_request.task_description,
            "project_task_status": task_request.task_status,
            "project_task_start_date": task_request.task_start_date,
            "project_task_due_date": task_request.task_due_date,
            "estimated_hours": task_request.estimated_hours,
            "created_at": datetime.utcnow().isoformat(),
            "last_updated_at": datetime.utcnow().isoformat(),
        }

        result = supabase_client.table("project_tasks").insert(task_data).execute()

        if result.data:
            task = ProjectTask(**result.data[0])
            return TaskResponse(
                success=True,
                task=task,
                message=f"Task '{task_request.task_name}' created successfully",
            )
        else:
            return TaskResponse(success=False, error="Failed to create task")

    except Exception as e:
        return TaskResponse(success=False, error=f"Database error: {str(e)}")


@tool
def get_available_clients() -> ClientsResponse:
    """
    Retrieve list of available clients for project creation.

    Returns:
        ClientsResponse with structured client data
    """
    try:
        if not supabase_client:
            return ClientsResponse(
                success=False, error="Database connection not available"
            )

        result = (
            supabase_client.table("clients").select("client_id, client_name").execute()
        )

        return ClientsResponse(success=True, clients=result.data or [])

    except Exception as e:
        return ClientsResponse(success=False, error=f"Database error: {str(e)}")


@tool
def analyze_project_status(project_id: str) -> Dict[str, Any]:
    """
    Analyze current project status using structured models and provide recommendations.

    Args:
        project_id: UUID of the project to analyze

    Returns:
        Dictionary with structured project analysis and recommendations
    """
    try:
        # Get structured project details
        project_details = get_project_details(project_id)

        if not project_details.success:
            return {"success": False, "error": project_details.error}

        project = project_details.project
        phases = project_details.phases
        tasks = project_details.tasks

        # Analyze status using structured data
        analysis = {
            "project_name": project.project_name,
            "current_status": project.project_status,
            "total_phases": len(phases),
            "total_tasks": len(tasks),
            "completed_tasks": len(
                [t for t in tasks if t.project_task_status == "Completed"]
            ),
            "active_tasks": len(
                [t for t in tasks if t.project_task_status in ["In Progress", "Active"]]
            ),
            "overdue_tasks": [],
            "upcoming_milestones": [],
            "recommendations": [],
        }

        # Check for overdue tasks using structured models
        current_date = datetime.now().date()
        for task in tasks:
            if task.project_task_due_date and task.project_task_status not in [
                "Completed",
                "Cancelled",
            ]:
                try:
                    due_date = datetime.strptime(
                        task.project_task_due_date, "%Y-%m-%d"
                    ).date()
                    if due_date < current_date:
                        analysis["overdue_tasks"].append(
                            {
                                "task_name": task.project_task_name,
                                "due_date": task.project_task_due_date,
                                "days_overdue": (current_date - due_date).days,
                            }
                        )
                except ValueError:
                    pass

        # Generate recommendations
        if analysis["overdue_tasks"]:
            analysis["recommendations"].append(
                "Address overdue tasks immediately to prevent project delays"
            )

        if analysis["total_tasks"] > 0:
            completion_rate = (
                analysis["completed_tasks"] / analysis["total_tasks"]
            ) * 100
            analysis["completion_rate"] = round(completion_rate, 1)

            if completion_rate < 25:
                analysis["recommendations"].append(
                    "Consider reviewing project scope and timeline"
                )
            elif completion_rate > 75:
                analysis["recommendations"].append(
                    "Project is progressing well, focus on final delivery"
                )

        return {"success": True, "analysis": analysis}

    except Exception as e:
        return {"success": False, "error": f"Analysis error: {str(e)}"}


@tool
def project_management_agent(query: str, project_context: Optional[str] = None) -> str:
    """
    Handle project management queries with structured models and database integration.

    Args:
        query: Project management question or request
        project_context: Optional context about existing project details

    Returns:
        Structured project management response with actionable recommendations
    """
    try:
        # Create specialized project management agent with structured tools
        bedrock_model = _create_bedrock_model()

        pm_agent = Agent(
            model=bedrock_model,
            system_prompt=PROJECT_MANAGEMENT_PROMPT,
            tools=[
                create_project_record,
                update_project_record,
                get_project_details,
                create_project_phase,
                create_project_task,
                get_available_clients,
                analyze_project_status,
            ],
        )

        # Enhance query with context if provided
        enhanced_query = query
        if project_context:
            enhanced_query = f"Project Context: {project_context}\n\nQuery: {query}"

        # Get agent response
        response = pm_agent(enhanced_query)

        # Structure the response for consistency
        return f"Project Management Analysis:\n{str(response)}"

    except Exception as e:
        return f"Error in project management agent: {str(e)}"


def create_comprehensive_project_plan(project_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a comprehensive project plan using structured models and the enhanced agent
    """
    # Create structured project request
    project_request = ProjectCreateRequest(
        project_name=project_data.get("name", "Unnamed Project"),
        client_id=project_data.get("client_id", ""),
        project_status=project_data.get("project_status", "RFP"),
        project_start_date=project_data.get("project_start_date"),
        project_due_date=project_data.get("project_due_date"),
        description=project_data.get("description"),
    )

    query = f"""
    Create a comprehensive project plan for the following project:

    Project Details:
    - Name: {project_request.project_name}
    - Description: {project_request.description or 'No description provided'}
    - Duration: {project_data.get('duration', 'Not specified')}
    - Budget: {project_data.get('budget', 'Not specified')}
    - Team Size: {project_data.get('team_size', 'Not specified')}
    - Client ID: {project_request.client_id}
    - Status: {project_request.project_status}

    Please provide:
    1. Create the project record in the database using the structured models
    2. Project phases breakdown with timeline
    3. Key milestones and deliverables
    4. Resource requirements analysis
    5. Risk assessment and mitigation strategies
    6. Success criteria and KPIs

    Think through each step and use the available database tools with structured types to create the actual project structure.
    """

    response = project_management_agent(query)

    return {
        "project_plan": response,
        "project_request": project_request.model_dump(),
        "status": "generated",
        "agent": "project_management",
        "timestamp": datetime.utcnow().isoformat(),
    }


def analyze_project_health(project_id: str) -> Dict[str, Any]:
    """
    Comprehensive project health analysis using structured models and the enhanced agent
    """
    query = f"""
    Perform a comprehensive health check on project ID: {project_id}

    Please:
    1. Retrieve current project details and status using structured models
    2. Analyze project progress against timeline
    3. Identify any bottlenecks or risks
    4. Review task completion rates using structured task data
    5. Check for overdue items
    6. Provide actionable recommendations for improvement

    Use the database tools with structured types to get current project information and provide a detailed analysis.
    """

    response = project_management_agent(
        query, project_context=f"Project ID: {project_id}"
    )

    return {
        "health_analysis": response,
        "project_id": project_id,
        "agent": "project_management",
        "timestamp": datetime.utcnow().isoformat(),
    }
