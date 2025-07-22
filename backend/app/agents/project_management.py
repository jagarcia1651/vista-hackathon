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
    ProjectStatus,
    ProjectTask,
    ProjectTaskCreateRequest,
    ProjectTeam,
    ProjectUpdateRequest,
    ProjectWithDetails,
    StafferAssignment,
    TaskResponse,
    TaskStatus,
)
from ..services.projectService import ProjectService
from ..services.projectTaskService import ProjectTaskService
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
- Task management and tracking
- Integration with PSA database systems

Project Management Capabilities:
- Create, read, update, and delete projects using ProjectService
- Filter projects by status, client, or date ranges
- Search projects by name or criteria
- Track project progress and identify overdue projects
- Update project status and details
- Get comprehensive project details with phases, tasks, and teams
- Monitor all projects, active projects, or client-specific projects

Task Management Capabilities:
- Create, read, update, and delete project tasks using ProjectTaskService
- Track task status and progress (not_started, in_progress, review, completed, blocked)
- Monitor estimated vs actual hours
- Identify overdue tasks and bottlenecks
- Filter tasks by status, project, or phase
- Update task details, dates, and assignments

Real-time thinking examples you should demonstrate:
- "Analyzing project requirements..."
- "Breaking down scope into work packages..."
- "Checking resource availability for timeline estimation..."
- "Identifying potential scheduling conflicts..."
- "Calculating critical path dependencies..."
- "Generating risk assessment based on project complexity..."
- "Optimizing task sequence for fastest delivery..."
- "Reviewing task completion status..."
- "Identifying overdue tasks requiring attention..."
- "Searching for similar projects in the database..."
- "Filtering projects by status to identify priorities..."

Focus on providing actionable project management insights based on PSA best practices.
Always structure your responses with clear phases, tasks, and timelines.
When working with database operations, confirm success and provide structured feedback.
Use the structured models to ensure data consistency and type safety.
For project management, leverage the ProjectService tools for all project-related operations.
For task management, leverage the ProjectTaskService tools to provide real-time task data and updates.
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
    Create a new project record in the database using structured Project model and ProjectService.

    Args:
        project_name: Name of the project
        client_id: UUID of the client
        project_status: Status of the project (RFP, Pending, Active, etc.)
        project_start_date: Project start date (YYYY-MM-DD format)
        project_due_date: Project due date (YYYY-MM-DD format)

    Returns:
        ProjectResponse with structured project data
    """
    # Create project request using structured model
    project_request = ProjectCreateRequest(
        project_name=project_name,
        client_id=client_id,
        project_status=project_status,
        project_start_date=project_start_date,
        project_due_date=project_due_date,
    )

    # Use ProjectService to create the project
    return ProjectService.create_project(project_request)


@tool
def update_project_record(
    project_id: str, updates: ProjectUpdateRequest
) -> ProjectResponse:
    """
    Update an existing project record using structured update model and ProjectService.

    Args:
        project_id: UUID of the project to update
        updates: ProjectUpdateRequest with fields to update

    Returns:
        ProjectResponse with updated project data
    """
    # Use ProjectService to update the project
    return ProjectService.update_project_from_request(project_id, updates)


@tool
def get_project_details(project_id: str) -> ProjectDetailsResponse:
    """
    Retrieve detailed project information with structured models using ProjectService.

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

        # Get project using ProjectService
        project_response = ProjectService.get_project_by_id(project_id)

        if not project_response.success:
            return ProjectDetailsResponse(success=False, error=project_response.error)

        project = project_response.project

        # Get project phases
        phases_result = (
            supabase_client.table("project_phases")
            .select("*")
            .eq("project_id", project_id)
            .order("project_phase_number")
            .execute()
        )
        phases = [ProjectPhase(**phase) for phase in (phases_result.data or [])]

        # Get project tasks using ProjectTaskService
        tasks = ProjectTaskService.get_tasks_by_project(project_id)

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
def create_project_task(task_request: ProjectTaskCreateRequest) -> TaskResponse:
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


# Additional Project Management Tools using ProjectService


@tool
def get_all_projects(limit: Optional[int] = None) -> Dict[str, Any]:
    """
    Retrieve all projects using the ProjectService.

    Args:
        limit: Optional limit on number of projects to retrieve

    Returns:
        Dictionary with projects data and status
    """
    try:
        projects = ProjectService.get_all_projects(limit)
        return {
            "success": True,
            "projects": [project.model_dump() for project in projects],
            "project_count": len(projects),
            "limit_applied": limit,
        }
    except Exception as e:
        return {"success": False, "error": f"Error retrieving all projects: {str(e)}"}


@tool
def get_projects_by_client(client_id: str) -> Dict[str, Any]:
    """
    Retrieve all projects for a specific client using the ProjectService.

    Args:
        client_id: UUID of the client

    Returns:
        Dictionary with client projects data and status
    """
    try:
        projects = ProjectService.get_projects_by_client(client_id)
        return {
            "success": True,
            "projects": [project.model_dump() for project in projects],
            "project_count": len(projects),
            "client_id": client_id,
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error retrieving projects for client: {str(e)}",
        }


@tool
def get_projects_by_status(
    status: str, client_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Retrieve projects filtered by status using the ProjectService.

    Args:
        status: Status to filter by (planning, active, on_hold, completed, cancelled)
        client_id: Optional client ID to further filter results

    Returns:
        Dictionary with filtered projects data and status
    """
    try:
        # Convert string to ProjectStatus enum
        status_enum = ProjectStatus(status.lower())
        projects = ProjectService.get_projects_by_status(status_enum, client_id)
        return {
            "success": True,
            "projects": [project.model_dump() for project in projects],
            "project_count": len(projects),
            "status_filter": status,
            "client_filter": client_id,
        }
    except ValueError:
        return {
            "success": False,
            "error": f"Invalid status: {status}. Valid options are: {[s.value for s in ProjectStatus]}",
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error retrieving projects by status: {str(e)}",
        }


@tool
def get_active_projects() -> Dict[str, Any]:
    """
    Retrieve all active projects using the ProjectService.

    Returns:
        Dictionary with active projects data and status
    """
    try:
        projects = ProjectService.get_active_projects()
        return {
            "success": True,
            "active_projects": [project.model_dump() for project in projects],
            "active_count": len(projects),
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error retrieving active projects: {str(e)}",
        }


@tool
def get_overdue_projects() -> Dict[str, Any]:
    """
    Retrieve projects that are overdue using the ProjectService.

    Returns:
        Dictionary with overdue projects data and status
    """
    try:
        projects = ProjectService.get_overdue_projects()
        return {
            "success": True,
            "overdue_projects": [project.model_dump() for project in projects],
            "overdue_count": len(projects),
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error retrieving overdue projects: {str(e)}",
        }


@tool
def search_projects(search_term: str) -> Dict[str, Any]:
    """
    Search projects by name using the ProjectService.

    Args:
        search_term: Term to search for in project names

    Returns:
        Dictionary with matching projects data and status
    """
    try:
        projects = ProjectService.search_projects(search_term)
        return {
            "success": True,
            "projects": [project.model_dump() for project in projects],
            "project_count": len(projects),
            "search_term": search_term,
        }
    except Exception as e:
        return {"success": False, "error": f"Error searching projects: {str(e)}"}


@tool
def update_project_status_tool(project_id: str, new_status: str) -> ProjectResponse:
    """
    Update the status of a project using the ProjectService.

    Args:
        project_id: UUID of the project to update
        new_status: New status for the project (planning, active, on_hold, completed, cancelled)

    Returns:
        ProjectResponse with updated project data or error
    """
    try:
        # Convert string to ProjectStatus enum
        status_enum = ProjectStatus(new_status.lower())
        return ProjectService.update_project_status(project_id, status_enum)
    except ValueError:
        return ProjectResponse(
            success=False,
            error=f"Invalid status: {new_status}. Valid options are: {[s.value for s in ProjectStatus]}",
        )
    except Exception as e:
        return ProjectResponse(
            success=False, error=f"Error updating project status: {str(e)}"
        )


@tool
def delete_project_tool(project_id: str) -> DatabaseResponse:
    """
    Delete a project using the ProjectService.

    Args:
        project_id: UUID of the project to delete

    Returns:
        DatabaseResponse indicating success or failure
    """
    return ProjectService.delete_project(project_id)


# Project Task Management Tools using ProjectTaskService


@tool
def get_task_by_id(task_id: str) -> TaskResponse:
    """
    Retrieve a specific project task by its ID using the task service.

    Args:
        task_id: UUID of the task to retrieve

    Returns:
        TaskResponse with task data or error
    """
    return ProjectTaskService.get_task_by_id(task_id)


@tool
def get_project_tasks(project_id: str) -> Dict[str, Any]:
    """
    Retrieve all tasks for a specific project using the task service.

    Args:
        project_id: UUID of the project

    Returns:
        Dictionary with tasks data and status
    """
    try:
        tasks = ProjectTaskService.get_tasks_by_project(project_id)
        return {
            "success": True,
            "tasks": [task.model_dump() for task in tasks],
            "task_count": len(tasks),
        }
    except Exception as e:
        return {"success": False, "error": f"Error retrieving tasks: {str(e)}"}


@tool
def get_phase_tasks(phase_id: str) -> Dict[str, Any]:
    """
    Retrieve all tasks for a specific project phase using the task service.

    Args:
        phase_id: UUID of the project phase

    Returns:
        Dictionary with tasks data and status
    """
    try:
        tasks = ProjectTaskService.get_tasks_by_phase(phase_id)
        return {
            "success": True,
            "tasks": [task.model_dump() for task in tasks],
            "task_count": len(tasks),
        }
    except Exception as e:
        return {"success": False, "error": f"Error retrieving phase tasks: {str(e)}"}


@tool
def update_task_status(task_id: str, new_status: str) -> TaskResponse:
    """
    Update the status of a project task using the task service.

    Args:
        task_id: UUID of the task to update
        new_status: New status for the task (not_started, in_progress, review, completed, blocked)

    Returns:
        TaskResponse with updated task data or error
    """
    try:
        # Convert string to TaskStatus enum
        status_enum = TaskStatus(new_status.lower())
        return ProjectTaskService.update_task_status(task_id, status_enum)
    except ValueError:
        return TaskResponse(
            success=False,
            error=f"Invalid status: {new_status}. Valid options are: {[s.value for s in TaskStatus]}",
        )
    except Exception as e:
        return TaskResponse(
            success=False, error=f"Error updating task status: {str(e)}"
        )


@tool
def update_task_hours(
    task_id: str,
    estimated_hours: Optional[int] = None,
    actual_hours: Optional[int] = None,
) -> TaskResponse:
    """
    Update the estimated or actual hours for a project task using the task service.

    Args:
        task_id: UUID of the task to update
        estimated_hours: New estimated hours (optional)
        actual_hours: New actual hours (optional)

    Returns:
        TaskResponse with updated task data or error
    """
    return ProjectTaskService.update_task_hours(task_id, estimated_hours, actual_hours)


@tool
def update_task_details(
    task_id: str,
    task_name: Optional[str] = None,
    task_description: Optional[str] = None,
    task_start_date: Optional[str] = None,
    task_due_date: Optional[str] = None,
) -> TaskResponse:
    """
    Update various details of a project task using the task service.

    Args:
        task_id: UUID of the task to update
        task_name: New task name (optional)
        task_description: New task description (optional)
        task_start_date: New start date in YYYY-MM-DD format (optional)
        task_due_date: New due date in YYYY-MM-DD format (optional)

    Returns:
        TaskResponse with updated task data or error
    """
    updates = {}
    if task_name is not None:
        updates["project_task_name"] = task_name
    if task_description is not None:
        updates["project_task_description"] = task_description
    if task_start_date is not None:
        updates["project_task_start_date"] = task_start_date
    if task_due_date is not None:
        updates["project_task_due_date"] = task_due_date

    if not updates:
        return TaskResponse(success=False, error="No update data provided")

    return ProjectTaskService.update_task(task_id, updates)


@tool
def get_tasks_by_status(
    status: str, project_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Retrieve tasks filtered by status and optionally by project using the task service.

    Args:
        status: Status to filter by (not_started, in_progress, review, completed, blocked)
        project_id: Optional project ID to further filter results

    Returns:
        Dictionary with tasks data and status
    """
    try:
        # Convert string to TaskStatus enum
        status_enum = TaskStatus(status.lower())
        tasks = ProjectTaskService.get_tasks_by_status(status_enum, project_id)
        return {
            "success": True,
            "tasks": [task.model_dump() for task in tasks],
            "task_count": len(tasks),
            "status_filter": status,
            "project_filter": project_id,
        }
    except ValueError:
        return {
            "success": False,
            "error": f"Invalid status: {status}. Valid options are: {[s.value for s in TaskStatus]}",
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error retrieving tasks by status: {str(e)}",
        }


@tool
def get_overdue_tasks(project_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Retrieve tasks that are overdue using the task service.

    Args:
        project_id: Optional project ID to filter results

    Returns:
        Dictionary with overdue tasks data and status
    """
    try:
        tasks = ProjectTaskService.get_overdue_tasks(project_id)
        return {
            "success": True,
            "overdue_tasks": [task.model_dump() for task in tasks],
            "overdue_count": len(tasks),
            "project_filter": project_id,
        }
    except Exception as e:
        return {"success": False, "error": f"Error retrieving overdue tasks: {str(e)}"}


@tool
def delete_task(task_id: str) -> DatabaseResponse:
    """
    Delete a project task using the task service.

    Args:
        task_id: UUID of the task to delete

    Returns:
        DatabaseResponse indicating success or failure
    """
    return ProjectTaskService.delete_task(task_id)


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
                # Core project CRUD operations using ProjectService
                create_project_record,
                update_project_record,
                get_project_details,
                create_project_task,
                get_available_clients,
                analyze_project_status,
                # Additional project management tools using ProjectService
                get_all_projects,
                get_projects_by_client,
                get_projects_by_status,
                get_active_projects,
                get_overdue_projects,
                search_projects,
                update_project_status_tool,
                # Task management tools using ProjectTaskService
                get_task_by_id,
                get_project_tasks,
                update_task_status,
                update_task_hours,
                update_task_details,
                get_tasks_by_status,
                get_overdue_tasks,
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
