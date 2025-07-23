"""
Project Service - CRUD operations for projects table using Supabase
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from ..models.project import (
    DatabaseResponse,
    Project,
    ProjectCreateRequest,
    ProjectResponse,
    ProjectStatus,
    ProjectUpdateRequest,
)
from ..utils.supabase_client import supabase_client


class ProjectService:
    """Service class for project CRUD operations"""

    @staticmethod
    def create_project(project_request: ProjectCreateRequest) -> ProjectResponse:
        """
        Create a new project in the database.

        Args:
            project_request: ProjectCreateRequest with project details

        Returns:
            ProjectResponse with created project data or error
        """
        try:
            if not supabase_client:
                return ProjectResponse(
                    success=False, error="Database connection not available"
                )

            project_data = {
                "project_name": project_request.project_name,
                "client_id": project_request.client_id,
                "project_status": project_request.project_status,
                "project_start_date": project_request.project_start_date,
                "project_due_date": project_request.project_due_date,
                "created_at": datetime.utcnow().isoformat(),
                "last_updated_at": datetime.utcnow().isoformat(),
            }

            result = supabase_client.table("projects").insert(project_data).execute()

            if result.data and len(result.data) > 0:
                project = Project(**result.data[0])
                return ProjectResponse(
                    success=True,
                    project=project,
                    message=f"Project '{project_request.project_name}' created successfully",
                )
            else:
                return ProjectResponse(success=False, error="Failed to create project")

        except Exception as e:
            return ProjectResponse(success=False, error=f"Database error: {str(e)}")

    @staticmethod
    def get_project_by_id(project_id: str) -> ProjectResponse:
        """
        Retrieve a specific project by its ID.

        Args:
            project_id: UUID of the project to retrieve

        Returns:
            ProjectResponse with project data or error
        """
        try:
            if not supabase_client:
                return ProjectResponse(
                    success=False, error="Database connection not available"
                )

            result = (
                supabase_client.table("projects")
                .select("*")
                .eq("project_id", project_id)
                .execute()
            )

            if result.data and len(result.data) > 0:
                project = Project(**result.data[0])
                return ProjectResponse(success=True, project=project)
            else:
                return ProjectResponse(success=False, error="Project not found")

        except Exception as e:
            return ProjectResponse(success=False, error=f"Database error: {str(e)}")

    @staticmethod
    def get_all_projects(limit: Optional[int] = None) -> List[Project]:
        """
        Retrieve all projects from the database.

        Args:
            limit: Optional limit on number of projects to retrieve

        Returns:
            List of Project objects
        """
        try:
            if not supabase_client:
                return []

            query = supabase_client.table("projects").select("*").order("created_at")

            if limit:
                query = query.limit(limit)

            result = query.execute()

            return [Project(**project) for project in (result.data or [])]

        except Exception as e:
            print(f"Database error getting all projects: {str(e)}")
            return []

    @staticmethod
    def get_projects_by_client(client_id: str) -> List[Project]:
        """
        Retrieve all projects for a specific client.

        Args:
            client_id: UUID of the client

        Returns:
            List of Project objects
        """
        try:
            if not supabase_client:
                return []

            result = (
                supabase_client.table("projects")
                .select("*")
                .eq("client_id", client_id)
                .order("created_at")
                .execute()
            )

            return [Project(**project) for project in (result.data or [])]

        except Exception as e:
            print(f"Database error getting projects by client: {str(e)}")
            return []

    @staticmethod
    def update_project(project_id: str, updates: dict) -> ProjectResponse:
        """
        Update a project with new data.

        Args:
            project_id: UUID of the project to update
            updates: Dictionary of fields to update

        Returns:
            ProjectResponse with updated project data or error
        """
        try:
            if not supabase_client:
                return ProjectResponse(
                    success=False, error="Database connection not available"
                )

            # Add last_updated_at timestamp
            updates["last_updated_at"] = datetime.utcnow().isoformat()

            result = (
                supabase_client.table("projects")
                .update(updates)
                .eq("project_id", project_id)
                .execute()
            )

            if result.data and len(result.data) > 0:
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

    @staticmethod
    def update_project_from_request(
        project_id: str, update_request: ProjectUpdateRequest
    ) -> ProjectResponse:
        """
        Update a project using a structured update request.

        Args:
            project_id: UUID of the project to update
            update_request: ProjectUpdateRequest with fields to update

        Returns:
            ProjectResponse with updated project data or error
        """
        # Convert updates to dict, excluding None values
        updates = update_request.model_dump(exclude_none=True)
        return ProjectService.update_project(project_id, updates)

    @staticmethod
    def update_project_status(
        project_id: str, status: ProjectStatus
    ) -> ProjectResponse:
        """
        Update the status of a project.

        Args:
            project_id: UUID of the project to update
            status: New ProjectStatus for the project

        Returns:
            ProjectResponse with updated project data or error
        """
        return ProjectService.update_project(
            project_id, {"project_status": status.value}
        )

    @staticmethod
    def update_project_due_date(
        project_id: str, due_date: Optional[str]
    ) -> ProjectResponse:
        """
        Update the due date of a project.

        Args:
            project_id: UUID of the project to update
            due_date: New due date in YYYY-MM-DD format (None to clear due date)

        Returns:
            ProjectResponse with updated project data or error
        """
        return ProjectService.update_project(project_id, {"project_due_date": due_date})

    @staticmethod
    def delete_project(project_id: str) -> DatabaseResponse:
        """
        Delete a project from the database.

        Args:
            project_id: UUID of the project to delete

        Returns:
            DatabaseResponse indicating success or failure
        """
        try:
            if not supabase_client:
                return DatabaseResponse(
                    success=False, error="Database connection not available"
                )

            result = (
                supabase_client.table("projects")
                .delete()
                .eq("project_id", project_id)
                .execute()
            )

            if result.data:
                return DatabaseResponse(
                    success=True, message=f"Project {project_id} deleted successfully"
                )
            else:
                return DatabaseResponse(
                    success=False, error="Project not found or delete failed"
                )

        except Exception as e:
            return DatabaseResponse(success=False, error=f"Database error: {str(e)}")

    @staticmethod
    def get_projects_by_status(
        status: ProjectStatus, client_id: Optional[str] = None
    ) -> List[Project]:
        """
        Retrieve projects filtered by status and optionally by client.

        Args:
            status: ProjectStatus to filter by
            client_id: Optional client ID to further filter results

        Returns:
            List of Project objects matching the criteria
        """
        try:
            if not supabase_client:
                return []

            query = (
                supabase_client.table("projects")
                .select("*")
                .eq("project_status", status.value)
            )

            if client_id:
                query = query.eq("client_id", client_id)

            result = query.order("created_at").execute()

            return [Project(**project) for project in (result.data or [])]

        except Exception as e:
            print(f"Database error getting projects by status: {str(e)}")
            return []

    @staticmethod
    def get_active_projects() -> List[Project]:
        """
        Retrieve all active projects.

        Returns:
            List of active Project objects
        """
        return ProjectService.get_projects_by_status(ProjectStatus.ACTIVE)

    @staticmethod
    def get_overdue_projects() -> List[Project]:
        """
        Retrieve projects that are overdue (past due date and not completed/cancelled).

        Returns:
            List of overdue Project objects
        """
        try:
            if not supabase_client:
                return []

            current_date = datetime.utcnow().date().isoformat()

            result = (
                supabase_client.table("projects")
                .select("*")
                .lt("project_due_date", current_date)
                .neq("project_status", ProjectStatus.COMPLETED.value)
                .neq("project_status", ProjectStatus.CANCELLED.value)
                .order("project_due_date")
                .execute()
            )

            return [Project(**project) for project in (result.data or [])]

        except Exception as e:
            print(f"Database error getting overdue projects: {str(e)}")
            return []

    @staticmethod
    def get_project_by_name(
        project_name: str, exact_match: bool = True
    ) -> ProjectResponse:
        """
        Retrieve a project by its name.

        Args:
            project_name: Name of the project to retrieve
            exact_match: If True, performs exact match; if False, case-insensitive partial match

        Returns:
            ProjectResponse with project data or error
        """
        try:
            if not supabase_client:
                return ProjectResponse(
                    success=False, error="Database connection not available"
                )

            if exact_match:
                result = (
                    supabase_client.table("projects")
                    .select("*")
                    .eq("project_name", project_name)
                    .execute()
                )
            else:
                result = (
                    supabase_client.table("projects")
                    .select("*")
                    .ilike("project_name", f"%{project_name}%")
                    .order("created_at")
                    .execute()
                )

            if result.data and len(result.data) > 0:
                if exact_match and len(result.data) == 1:
                    project = Project(**result.data[0])
                    return ProjectResponse(success=True, project=project)
                elif exact_match and len(result.data) > 1:
                    return ProjectResponse(
                        success=False,
                        error=f"Multiple projects found with exact name '{project_name}'",
                    )
                else:
                    # For partial match, return the first result
                    project = Project(**result.data[0])
                    return ProjectResponse(
                        success=True,
                        project=project,
                        message=f"Found project using partial match (total matches: {len(result.data)})",
                    )
            else:
                match_type = "exact" if exact_match else "partial"
                return ProjectResponse(
                    success=False,
                    error=f"No project found with {match_type} name match for '{project_name}'",
                )

        except Exception as e:
            return ProjectResponse(success=False, error=f"Database error: {str(e)}")

    @staticmethod
    def search_projects(search_term: str) -> List[Project]:
        """
        Search projects by name (case-insensitive partial match).

        Args:
            search_term: Term to search for in project names

        Returns:
            List of Project objects matching the search term
        """
        try:
            if not supabase_client:
                return []

            result = (
                supabase_client.table("projects")
                .select("*")
                .ilike("project_name", f"%{search_term}%")
                .order("created_at")
                .execute()
            )

            return [Project(**project) for project in (result.data or [])]

        except Exception as e:
            print(f"Database error searching projects: {str(e)}")
            return []

    @staticmethod
    def get_projects_by_date_range(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        date_field: str = "created_at",
    ) -> List[Project]:
        """
        Retrieve projects within a date range.

        Args:
            start_date: Start date in YYYY-MM-DD format (optional)
            end_date: End date in YYYY-MM-DD format (optional)
            date_field: Field to filter by ('created_at', 'project_start_date', 'project_due_date')

        Returns:
            List of Project objects within the date range
        """
        try:
            if not supabase_client:
                return []

            query = supabase_client.table("projects").select("*")

            if start_date:
                query = query.gte(date_field, start_date)
            if end_date:
                query = query.lte(date_field, end_date)

            result = query.order("created_at").execute()

            return [Project(**project) for project in (result.data or [])]

        except Exception as e:
            print(f"Database error getting projects by date range: {str(e)}")
            return []
