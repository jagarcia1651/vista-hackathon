from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from ..utils.supabase_client import supabase_client


# Profitability Models
class ProfitabilitySnapshot(BaseModel):
    """Profitability snapshot model matching the database schema"""

    id: str
    created_at: datetime
    project_id: str
    baseline_id: Optional[str] = None
    total_profitability: float
    triggered_by_agent: Optional[str] = None
    triggered_by_action: Optional[str] = None


class ProfitabilityDelta(BaseModel):
    """Profitability change calculation result"""

    current_profitability: float
    baseline_profitability: float
    change_amount: float
    change_percentage: Optional[float] = None
    is_improvement: bool


# Response Models
class DatabaseResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None


class SnapshotResponse(DatabaseResponse):
    snapshot: Optional[ProfitabilitySnapshot] = None


class DeltaResponse(DatabaseResponse):
    delta: Optional[ProfitabilityDelta] = None


class ProfitabilityService:
    """Service class for profitability snapshot CRUD operations"""

    @staticmethod
    def get_profitability_snapshot_by_id(snapshot_id: str) -> SnapshotResponse:
        """
        Retrieve a profitability snapshot by its ID.

        Args:
            snapshot_id: UUID of the snapshot to retrieve

        Returns:
            SnapshotResponse with snapshot data or error
        """
        try:
            if not supabase_client:
                return SnapshotResponse(
                    success=False, error="Database connection not available"
                )

            result = (
                supabase_client.table("project_profitability_snapshots")
                .select("*")
                .eq("id", snapshot_id)
                .execute()
            )

            if result.data and len(result.data) > 0:
                snapshot = ProfitabilitySnapshot(**result.data[0])
                return SnapshotResponse(
                    success=True,
                    snapshot=snapshot,
                    message=f"Snapshot {snapshot_id} retrieved successfully",
                )
            else:
                return SnapshotResponse(
                    success=False, error=f"Snapshot with ID {snapshot_id} not found"
                )

        except Exception as e:
            return SnapshotResponse(
                success=False, error=f"Error retrieving snapshot: {str(e)}"
            )

    @staticmethod
    def calculate_project_profitability(project_id: str) -> float:
        """
        Calculate the total profitability for a project using a Supabase Edge Function.

        This method calls the 'get-total-profitability' Edge Function that should contain
        the profitability calculation logic.

        Args:
            project_id: UUID of the project

        Returns:
            Total profitability as a float
        """
        try:
            if not supabase_client:
                raise Exception("Database connection not available")

            response = supabase_client.functions.invoke(
                "get-total-profitability",
                invoke_options={"body": {"project_id": project_id}},
            )

            if response and hasattr(response, "data") and response.data is not None:
                # Handle different possible response formats
                if isinstance(response.data, dict):
                    # If response.data is a dict, look for total_profitability key
                    return float(response.data.get("total_profitability", 0))
                elif isinstance(response.data, (int, float)):
                    # If response.data is already a number
                    return float(response.data)
                else:
                    # Try to convert to float directly
                    return float(response.data)
            else:
                return 0.0

        except Exception as e:
            # Log the error and return 0 for now
            print(f"Error calculating profitability for project {project_id}: {str(e)}")
            return 0.0

    @staticmethod
    def create_snapshot_from_project_id(
        project_id: uuid,
        baseline_id: Optional[str] = None,
        triggered_by_agent: Optional[str] = None,
        triggered_by_action: Optional[str] = None,
    ) -> SnapshotResponse:
        """
        Create a new profitability snapshot for a project.

        Args:
            project_id: UUID of the project
            baseline_id: Optional baseline ID (None for baseline snapshots)
            triggered_by_agent: Name of the agent that triggered this calculation
            triggered_by_action: Specific action that triggered this calculation

        Returns:
            SnapshotResponse with created snapshot data or error
        """
        try:
            if not supabase_client:
                return SnapshotResponse(
                    success=False, error="Database connection not available"
                )

            # Calculate the current profitability
            total_profitability = ProfitabilityService.calculate_project_profitability(
                project_id
            )

            # Prepare snapshot data
            snapshot_data = {
                "project_id": project_id,
                "baseline_id": baseline_id,
                "total_profitability": total_profitability,
                "triggered_by_agent": triggered_by_agent,
                "triggered_by_action": triggered_by_action,
                "created_at": datetime.utcnow().isoformat(),
            }

            # Insert the snapshot
            result = (
                supabase_client.table("project_profitability_snapshots")
                .insert(snapshot_data)
                .execute()
            )

            if result.data and len(result.data) > 0:
                snapshot = ProfitabilitySnapshot(**result.data[0])
                snapshot_type = "baseline" if baseline_id is None else "snapshot"
                return SnapshotResponse(
                    success=True,
                    snapshot=snapshot,
                    message=f"Profitability {snapshot_type} created successfully for project {project_id}",
                )
            else:
                return SnapshotResponse(
                    success=False, error="Failed to create profitability snapshot"
                )

        except Exception as e:
            return SnapshotResponse(
                success=False, error=f"Error creating snapshot: {str(e)}"
            )

    @staticmethod
    def get_latest_baseline_for_project(project_id: str) -> SnapshotResponse:
        """
        Get the latest baseline snapshot for a project.

        Args:
            project_id: UUID of the project

        Returns:
            SnapshotResponse with baseline snapshot data or error
        """
        try:
            if not supabase_client:
                return SnapshotResponse(
                    success=False, error="Database connection not available"
                )

            # Get the latest baseline (where baseline_id is null)
            result = (
                supabase_client.table("project_profitability_snapshots")
                .select("*")
                .eq("project_id", project_id)
                .is_("baseline_id", "null")
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

            if result.data and len(result.data) > 0:
                snapshot = ProfitabilitySnapshot(**result.data[0])
                return SnapshotResponse(
                    success=True,
                    snapshot=snapshot,
                    message=f"Latest baseline found for project {project_id}",
                )
            else:
                return SnapshotResponse(
                    success=False,
                    error=f"No baseline snapshot found for project {project_id}",
                )

        except Exception as e:
            return SnapshotResponse(
                success=False, error=f"Error retrieving baseline: {str(e)}"
            )

    @staticmethod
    def calculate_profitability_change_since_baseline(
        snapshot_id: str,
    ) -> DeltaResponse:
        """
        Calculate the profitability change between a snapshot and its baseline.

        Args:
            snapshot_id: UUID of the snapshot to compare

        Returns:
            DeltaResponse with profitability change calculation or error
        """
        try:
            # Get the current snapshot
            current_response = ProfitabilityService.get_profitability_snapshot_by_id(
                snapshot_id
            )
            if not current_response.success or not current_response.snapshot:
                return DeltaResponse(
                    success=False, error=f"Could not retrieve snapshot {snapshot_id}"
                )

            current_snapshot = current_response.snapshot

            # Get the baseline for this project
            baseline_response = ProfitabilityService.get_latest_baseline_for_project(
                current_snapshot.project_id
            )
            if not baseline_response.success or not baseline_response.snapshot:
                return DeltaResponse(
                    success=False,
                    error=f"Could not retrieve baseline for project {current_snapshot.project_id}",
                )

            baseline_snapshot = baseline_response.snapshot

            # Calculate the delta
            current_profitability = current_snapshot.total_profitability
            baseline_profitability = baseline_snapshot.total_profitability
            change_amount = current_profitability - baseline_profitability

            # Calculate percentage change (avoid division by zero)
            change_percentage = None
            if baseline_profitability != 0:
                change_percentage = (change_amount / abs(baseline_profitability)) * 100

            is_improvement = change_amount > 0

            delta = ProfitabilityDelta(
                current_profitability=current_profitability,
                baseline_profitability=baseline_profitability,
                change_amount=change_amount,
                change_percentage=change_percentage,
                is_improvement=is_improvement,
            )

            return DeltaResponse(
                success=True,
                delta=delta,
                message=f"Profitability change calculated: {'improvement' if is_improvement else 'decline'} of ${change_amount:.2f}",
            )

        except Exception as e:
            return DeltaResponse(
                success=False, error=f"Error calculating profitability change: {str(e)}"
            )

    @staticmethod
    def get_latest_snapshot_for_project(project_id: str) -> SnapshotResponse:
        """
        Get the most recent profitability snapshot for a project.

        Args:
            project_id: UUID of the project

        Returns:
            SnapshotResponse with latest snapshot data or error
        """
        try:
            if not supabase_client:
                return SnapshotResponse(
                    success=False, error="Database connection not available"
                )

            result = (
                supabase_client.table("project_profitability_snapshots")
                .select("*")
                .eq("project_id", project_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

            if result.data and len(result.data) > 0:
                snapshot = ProfitabilitySnapshot(**result.data[0])
                return SnapshotResponse(
                    success=True,
                    snapshot=snapshot,
                    message=f"Latest snapshot found for project {project_id}",
                )
            else:
                return SnapshotResponse(
                    success=False, error=f"No snapshots found for project {project_id}"
                )

        except Exception as e:
            return SnapshotResponse(
                success=False, error=f"Error retrieving latest snapshot: {str(e)}"
            )
