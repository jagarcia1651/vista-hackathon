"""
Project Task Service - CRUD operations for project_tasks table using Supabase
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from ..models.project import (
    DatabaseResponse,
    ProjectTask,
    ProjectTaskCreateRequest,
    TaskResponse,
    TaskStatus,
)
from ..utils.supabase_client import supabase_client


class ProjectTaskService:
    """Service class for project task CRUD operations"""

    @staticmethod
    def create_task(task_request: ProjectTaskCreateRequest) -> TaskResponse:
        """
        Create a new project task in the database.

        Args:
            task_request: TaskCreateRequest with task details

        Returns:
            TaskResponse with created task data or error
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

            if result.data and len(result.data) > 0:
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

    @staticmethod
    def get_task_by_id(task_id: str) -> TaskResponse:
        """
        Retrieve a specific project task by its ID.

        Args:
            task_id: UUID of the task to retrieve

        Returns:
            TaskResponse with task data or error
        """
        try:
            if not supabase_client:
                return TaskResponse(
                    success=False, error="Database connection not available"
                )

            result = (
                supabase_client.table("project_tasks")
                .select("*")
                .eq("project_task_id", task_id)
                .execute()
            )

            if result.data and len(result.data) > 0:
                task = ProjectTask(**result.data[0])
                return TaskResponse(success=True, task=task)
            else:
                return TaskResponse(success=False, error="Task not found")

        except Exception as e:
            return TaskResponse(success=False, error=f"Database error: {str(e)}")

    @staticmethod
    def get_task_by_name(
        task_name: str, exact_match: bool = True, project_id: Optional[str] = None
    ) -> TaskResponse:
        """
        Retrieve a project task by its name.

        Args:
            task_name: Name of the task to retrieve
            exact_match: If True, performs exact match; if False, case-insensitive partial match
            project_id: Optional project ID to limit search scope

        Returns:
            TaskResponse with task data or error
        """
        try:
            if not supabase_client:
                return TaskResponse(
                    success=False, error="Database connection not available"
                )

            if exact_match:
                query = (
                    supabase_client.table("project_tasks")
                    .select("*")
                    .eq("project_task_name", task_name)
                )
            else:
                query = (
                    supabase_client.table("project_tasks")
                    .select("*")
                    .ilike("project_task_name", f"%{task_name}%")
                    .order("created_at")
                )

            # Add project filter if specified
            if project_id:
                query = query.eq("project_id", project_id)

            result = query.execute()

            if result.data and len(result.data) > 0:
                if exact_match and len(result.data) == 1:
                    task = ProjectTask(**result.data[0])
                    return TaskResponse(success=True, task=task)
                elif exact_match and len(result.data) > 1:
                    scope = f" in project {project_id}" if project_id else ""
                    return TaskResponse(
                        success=False,
                        error=f"Multiple tasks found with exact name '{task_name}'{scope}",
                    )
                else:
                    # For partial match, return the first result
                    task = ProjectTask(**result.data[0])
                    scope_msg = f" in project {project_id}" if project_id else ""
                    return TaskResponse(
                        success=True,
                        task=task,
                        message=f"Found task using partial match{scope_msg} (total matches: {len(result.data)})",
                    )
            else:
                match_type = "exact" if exact_match else "partial"
                scope = f" in project {project_id}" if project_id else ""
                return TaskResponse(
                    success=False,
                    error=f"No task found with {match_type} name match for '{task_name}'{scope}",
                )

        except Exception as e:
            return TaskResponse(success=False, error=f"Database error: {str(e)}")

    @staticmethod
    def get_tasks_by_project(project_id: str) -> List[ProjectTask]:
        """
        Retrieve all tasks for a specific project.

        Args:
            project_id: UUID of the project

        Returns:
            List of ProjectTask objects
        """
        try:
            if not supabase_client:
                return []

            result = (
                supabase_client.table("project_tasks")
                .select("*")
                .eq("project_id", project_id)
                .order("created_at")
                .execute()
            )

            return [ProjectTask(**task) for task in (result.data or [])]

        except Exception as e:
            print(f"Database error getting tasks by project: {str(e)}")
            return []

    @staticmethod
    def get_tasks_by_phase(phase_id: str) -> List[ProjectTask]:
        """
        Retrieve all tasks for a specific project phase.

        Args:
            phase_id: UUID of the project phase

        Returns:
            List of ProjectTask objects
        """
        try:
            if not supabase_client:
                return []

            result = (
                supabase_client.table("project_tasks")
                .select("*")
                .eq("project_phase_id", phase_id)
                .order("created_at")
                .execute()
            )

            return [ProjectTask(**task) for task in (result.data or [])]

        except Exception as e:
            print(f"Database error getting tasks by phase: {str(e)}")
            return []

    @staticmethod
    def update_task(task_id: str, updates: dict) -> TaskResponse:
        """
        Update a project task with new data.

        Args:
            task_id: UUID of the task to update
            updates: Dictionary of fields to update

        Returns:
            TaskResponse with updated task data or error
        """
        try:
            if not supabase_client:
                return TaskResponse(
                    success=False, error="Database connection not available"
                )

            # Add last_updated_at timestamp
            updates["last_updated_at"] = datetime.utcnow().isoformat()

            result = (
                supabase_client.table("project_tasks")
                .update(updates)
                .eq("project_task_id", task_id)
                .execute()
            )

            if result.data and len(result.data) > 0:
                task = ProjectTask(**result.data[0])
                return TaskResponse(
                    success=True,
                    task=task,
                    message=f"Task {task_id} updated successfully",
                )
            else:
                return TaskResponse(
                    success=False, error="Task not found or update failed"
                )

        except Exception as e:
            return TaskResponse(success=False, error=f"Database error: {str(e)}")

    @staticmethod
    def update_task_status(task_id: str, status: TaskStatus) -> TaskResponse:
        """
        Update the status of a project task.

        Args:
            task_id: UUID of the task to update
            status: New TaskStatus for the task

        Returns:
            TaskResponse with updated task data or error
        """
        return ProjectTaskService.update_task(
            task_id, {"project_task_status": status.value}
        )

    @staticmethod
    def update_task_hours(
        task_id: str,
        estimated_hours: Optional[int] = None,
        actual_hours: Optional[int] = None,
    ) -> TaskResponse:
        """
        Update the estimated or actual hours for a project task.

        Args:
            task_id: UUID of the task to update
            estimated_hours: New estimated hours (optional)
            actual_hours: New actual hours (optional)

        Returns:
            TaskResponse with updated task data or error
        """
        updates = {}
        if estimated_hours is not None:
            updates["estimated_hours"] = estimated_hours
        if actual_hours is not None:
            updates["actual_hours"] = actual_hours

        if not updates:
            return TaskResponse(
                success=False, error="No hours data provided for update"
            )

        return ProjectTaskService.update_task(task_id, updates)

    @staticmethod
    def delete_task(task_id: str) -> DatabaseResponse:
        """
        Delete a project task from the database.

        Args:
            task_id: UUID of the task to delete

        Returns:
            DatabaseResponse indicating success or failure
        """
        try:
            if not supabase_client:
                return DatabaseResponse(
                    success=False, error="Database connection not available"
                )

            result = (
                supabase_client.table("project_tasks")
                .delete()
                .eq("project_task_id", task_id)
                .execute()
            )

            if result.data:
                return DatabaseResponse(
                    success=True, message=f"Task {task_id} deleted successfully"
                )
            else:
                return DatabaseResponse(
                    success=False, error="Task not found or delete failed"
                )

        except Exception as e:
            return DatabaseResponse(success=False, error=f"Database error: {str(e)}")

    @staticmethod
    def get_tasks_by_status(
        status: TaskStatus, project_id: Optional[str] = None
    ) -> List[ProjectTask]:
        """
        Retrieve tasks filtered by status and optionally by project.

        Args:
            status: TaskStatus to filter by
            project_id: Optional project ID to further filter results

        Returns:
            List of ProjectTask objects matching the criteria
        """
        try:
            if not supabase_client:
                return []

            query = (
                supabase_client.table("project_tasks")
                .select("*")
                .eq("project_task_status", status.value)
            )

            if project_id:
                query = query.eq("project_id", project_id)

            result = query.order("created_at").execute()

            return [ProjectTask(**task) for task in (result.data or [])]

        except Exception as e:
            print(f"Database error getting tasks by status: {str(e)}")
            return []

    @staticmethod
    def get_overdue_tasks(project_id: Optional[str] = None) -> List[ProjectTask]:
        """
        Retrieve tasks that are overdue (past due date and not completed).

        Args:
            project_id: Optional project ID to filter results

        Returns:
            List of overdue ProjectTask objects
        """
        try:
            if not supabase_client:
                return []

            current_date = datetime.utcnow().date().isoformat()

            query = (
                supabase_client.table("project_tasks")
                .select("*")
                .lt("project_task_due_date", current_date)
                .neq("project_task_status", TaskStatus.COMPLETED.value)
            )

            if project_id:
                query = query.eq("project_id", project_id)

            result = query.order("project_task_due_date").execute()

            return [ProjectTask(**task) for task in (result.data or [])]

        except Exception as e:
            print(f"Database error getting overdue tasks: {str(e)}")
            return []
