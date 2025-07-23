"""
Project Management Agent - Specialized for executing project modifications and task reassignments
"""

import json
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

from agents import Agent, function_tool
from pydantic import BaseModel

from ...events.bus import AgentType, BusinessEvent, BusinessEventType, event_bus
from ...models.project import (
    ProjectDetailsResponse,
    ProjectResponse,
    ProjectStatus,
    ProjectTask,
    ProjectTeam,
    ProjectUpdateRequest,
    TaskResponse,
    TaskStatus,
)
from ...services.projectService import ProjectService
from ...services.projectTaskService import ProjectTaskService
from ...utils.supabase_client import supabase_client

# Streamlined Project Management System Prompt
PROJECT_MANAGEMENT_PROMPT = """
You are a specialized Project Management Agent that EXECUTES project modifications and task reassignments.

Your primary responsibilities for the time-off reassignment flow:
1. **Execute task reassignments** based on recommendations from the resource management agent
2. **Update task dates** when replacement staffers have different availability
3. **Update project status** to reflect delays or schedule changes (e.g., "off-track", "delayed")
4. **Update project due dates** when timeline changes are needed
5. **Retrieve project and task details** to understand current state before making changes

Key Capabilities:
- Create new task assignments in the database
- Update task details including dates, status, and assignments
- Update project status and due dates
- Retrieve project and task information for context

You DO NOT make assignment decisions - you EXECUTE the assignments and project updates that have been decided by other agents.

Focus on providing clear confirmations of changes made and any impacts to project timelines.
Always structure your responses with clear confirmation of what was executed.
When working with database operations, confirm success and provide structured feedback.
"""


@function_tool
async def create_new_task_assignment(new_staffer_id: str, task_id: str) -> bool:
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

        # Get task and staffer details for human-readable event
        task_result = (
            supabase_client.table("project_tasks")
            .select("project_task_name")
            .eq("project_task_id", task_id)
            .execute()
        )
        staffer_result = (
            supabase_client.table("staffers")
            .select("first_name, last_name")
            .eq("id", new_staffer_id)
            .execute()
        )

        task_name = task_id
        staffer_name = new_staffer_id
        if task_result.data and len(task_result.data) > 0:
            task_name = task_result.data[0]["project_task_name"]
        if staffer_result.data and len(staffer_result.data) > 0:
            staffer = staffer_result.data[0]
            staffer_name = f"{staffer['first_name']} {staffer['last_name']}"

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

        if result.data:
            # Emit event for successful task assignment
            await event_bus.emit(
                BusinessEvent(
                    type=BusinessEventType.UPDATE,
                    message=f"Task '{task_name}' assigned to {staffer_name}",
                    agent_id=AgentType.PROJECT,
                )
            )
            return True

        return False

    except Exception as e:
        print(f"Error creating new task assignment: {e}")
        return False


@function_tool
async def remove_task_assignment(staffer_id: str, task_id: str) -> bool:
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

        # Get task and staffer details for human-readable event
        task_result = (
            supabase_client.table("project_tasks")
            .select("project_task_name")
            .eq("project_task_id", task_id)
            .execute()
        )
        staffer_result = (
            supabase_client.table("staffers")
            .select("first_name, last_name")
            .eq("id", staffer_id)
            .execute()
        )

        task_name = task_id
        staffer_name = staffer_id
        if task_result.data and len(task_result.data) > 0:
            task_name = task_result.data[0]["project_task_name"]
        if staffer_result.data and len(staffer_result.data) > 0:
            staffer = staffer_result.data[0]
            staffer_name = f"{staffer['first_name']} {staffer['last_name']}"

        result = (
            supabase_client.table("staffer_assignments")
            .delete()
            .eq("staffer_id", staffer_id)
            .eq("project_task_id", task_id)
            .execute()
        )

        # Emit event for successful task assignment removal
        await event_bus.emit(
            BusinessEvent(
                type=BusinessEventType.UPDATE,
                message=f"Task '{task_name}' unassigned from {staffer_name}",
                agent_id=AgentType.PROJECT,
            )
        )
        return True

    except Exception as e:
        print(f"Error removing task assignment: {e}")
        return False


@function_tool
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
            success=True, project=project, phases=None, tasks=tasks, teams=teams
        )

    except Exception as e:
        return ProjectDetailsResponse(success=False, error=f"Database error: {str(e)}")


@function_tool
def get_task_by_id(task_id: str) -> TaskResponse:
    """
    Retrieve a specific project task by its ID using the task service.

    Args:
        task_id: UUID of the task to retrieve

    Returns:
        TaskResponse with task data or error
    """
    return ProjectTaskService.get_task_by_id(task_id)


@function_tool
async def update_task_details(
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

    response = ProjectTaskService.update_task(task_id, updates)

    if response.success:
        # Emit event for successful task details update
        await event_bus.emit(
            BusinessEvent(
                type=BusinessEventType.UPDATE,
                message=f"Task {task_name} details updated: {', '.join(updates.keys())}",
                agent_id=AgentType.PROJECT,
            )
        )

    return response


@function_tool
async def update_task_status(task_id: str, new_status: str) -> TaskResponse:
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
        response = ProjectTaskService.update_task_status(task_id, status_enum)

        if response.success:
            # Emit event for successful task status update
            await event_bus.emit(
                BusinessEvent(
                    type=BusinessEventType.UPDATE,
                    message=f"Task {task_id} status updated to {new_status}",
                    agent_id=AgentType.PROJECT,
                )
            )

        return response
    except ValueError:
        return TaskResponse(
            success=False,
            error=f"Invalid status: {new_status}. Valid options are: {[s.value for s in TaskStatus]}",
        )
    except Exception as e:
        return TaskResponse(
            success=False, error=f"Error updating task status: {str(e)}"
        )


@function_tool
async def update_project_status_tool(
    project_id: str, new_status: str
) -> ProjectResponse:
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
        response = ProjectService.update_project_status(project_id, status_enum)

        if response.success:
            # Emit event for successful project status update
            await event_bus.emit(
                BusinessEvent(
                    type=BusinessEventType.UPDATE,
                    message=f"Project {project_id} status updated to {new_status}",
                    agent_id=AgentType.PROJECT,
                )
            )

        return response
    except ValueError:
        return ProjectResponse(
            success=False,
            error=f"Invalid status: {new_status}. Valid options are: {[s.value for s in ProjectStatus]}",
        )
    except Exception as e:
        return ProjectResponse(
            success=False, error=f"Error updating project status: {str(e)}"
        )


@function_tool
async def update_project_due_date_tool(
    project_id: str, due_date: Optional[str] = None
) -> ProjectResponse:
    """
    Update the due date of a project using the ProjectService.

    Args:
        project_id: UUID of the project to update
        due_date: New due date in YYYY-MM-DD format (None or empty string to clear due date)

    Returns:
        ProjectResponse with updated project data or error
    """
    try:
        # Handle empty string as None
        if due_date == "":
            due_date = None

        # Basic date format validation if due_date is provided
        if due_date:
            from datetime import datetime

            try:
                datetime.strptime(due_date, "%Y-%m-%d")
            except ValueError:
                return ProjectResponse(
                    success=False,
                    error=f"Invalid date format: {due_date}. Please use YYYY-MM-DD format.",
                )

        response = ProjectService.update_project_due_date(project_id, due_date)

        if response.success:
            # Emit event for successful project due date update
            await event_bus.emit(
                BusinessEvent(
                    type=BusinessEventType.UPDATE,
                    message=f"Project {project_id} due date updated to {due_date or 'None'}",
                    agent_id=AgentType.PROJECT,
                )
            )

        return response
    except Exception as e:
        return ProjectResponse(
            success=False, error=f"Error updating project due date: {str(e)}"
        )


# Create the streamlined project management agent
project_management_agent = Agent(
    name="project_management_agent",
    model="gpt-4o-mini",
    instructions=PROJECT_MANAGEMENT_PROMPT,
    tools=[
        # Core functions needed for time-off reassignment flow
        create_new_task_assignment,
        remove_task_assignment,
        get_project_details,
        get_task_by_id,
        update_task_details,
        update_task_status,
        update_project_status_tool,
        update_project_due_date_tool,
    ],
)


async def handle_project_management(
    query: str, project_context: Optional[str] = None
) -> str:
    """
    Handle project management queries focused on executing modifications and reassignments.

    Args:
        query: Project management action request
        project_context: Optional context about existing project details

    Returns:
        Structured project management response confirming actions taken
    """
    try:
        # Enhance query with context if provided
        enhanced_query = query
        if project_context:
            enhanced_query = (
                f"Project Context: {project_context}\n\nAction Request: {query}"
            )

        # Run the agent with the OpenAI Agents SDK
        from agents import Runner

        result = await Runner.run(agent=project_management_agent, input=enhanced_query)

        # Structure the response for consistency
        return f"Project Management Actions Executed:\n{str(result)}"

    except Exception as e:
        return f"Error in project management agent: {str(e)}"
