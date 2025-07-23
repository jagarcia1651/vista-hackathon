"""
Profitability Agent - Specialized for tracking project profitability changes in real-time
"""

import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from strands import Agent, tool
from strands.models.bedrock import BedrockModel

from ..services.profitabilityService import (
    DeltaResponse,
    ProfitabilityService,
    ProfitabilitySnapshot,
    SnapshotResponse,
)
from ..utils.supabase_client import supabase_client

# Enhanced Profitability System Prompt
PROFITABILITY_PROMPT = """
You are a specialized Profitability Monitoring Agent for Professional Service Automation.

Your expertise includes:
- Real-time profitability tracking and analysis
- Creating baseline profitability snapshots before project modifications
- Monitoring profitability changes after agent actions
- Calculating and reporting profitability deltas
- Alerting stakeholders to significant profitability changes
- Providing insights into factors affecting project profitability

Profitability Monitoring Capabilities:
- Create baseline snapshots when projects are first modified by agents
- Generate new snapshots after project updates with proper baseline references
- Calculate profitability changes since baseline creation
- Track which agent actions impact profitability (positive/negative)
- Provide detailed analysis of profitability trends
- Alert users to significant profitability improvements or declines

Real-time analysis examples you should demonstrate:
- "Creating baseline profitability snapshot for project tracking..."
- "Analyzing profitability impact of project changes..."
- "Calculating profitability delta since baseline..."
- "Profitability has improved by $X since initial snapshot..."
- "Warning: Project profitability has declined by X% due to recent changes..."
- "Resource allocation changes have increased project margin by X%..."
- "Timeline extensions may impact overall project profitability..."

Focus on providing actionable profitability insights and clear financial impact analysis.
Always track which specific agent actions are driving profitability changes.
Maintain accurate baseline references for meaningful comparisons.
Use the ProfitabilityService for all profitability calculations and snapshot management.
"""


def _create_bedrock_model():
    """Create BedrockModel with API key or AWS credentials"""
    api_key = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
    model_id = os.getenv(
        "BEDROCK_MODEL_ID", "us.anthropic.claude-3-haiku-20240307-v1:0"
    )
    region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

    if api_key:
        os.environ["AWS_BEARER_TOKEN_BEDROCK"] = api_key

    return BedrockModel(model_id=model_id, region_name=region)


# Session tracking for baseline creation
_project_baselines_created = set()  # Track which projects have baselines this session


@tool
def create_profitability_baseline(
    project_id: UUID,
    triggered_by_agent: str = "system",
    triggered_by_action: str = "baseline_creation",
) -> Dict[str, Any]:
    """
    Create a baseline profitability snapshot for a project.
    This should be called before the first time any agent modifies project data.

    Args:
        project_id: UUID of the project
        triggered_by_agent: Name of the agent creating the baseline
        triggered_by_action: Action that triggered baseline creation

    Returns:
        Dictionary with baseline creation results
    """
    try:
        # Check if baseline already exists for this project in the current session
        if project_id in _project_baselines_created:
            return {
                "success": True,
                "baseline_exists": True,
                "message": f"Baseline already exists for project {project_id} in current session",
                "project_id": project_id,
            }

        # Create the baseline snapshot (baseline_id = None indicates this is a baseline)
        baseline_response = ProfitabilityService.create_snapshot_from_project_id(
            project_id=project_id,
            baseline_id=None,  # None indicates this is a baseline
            triggered_by_agent=triggered_by_agent,
            triggered_by_action=triggered_by_action,
        )

        if baseline_response.success:
            # Track that we've created a baseline for this project
            _project_baselines_created.add(project_id)

            return {
                "success": True,
                "baseline_created": True,
                "baseline_snapshot": (
                    baseline_response.snapshot.model_dump()
                    if baseline_response.snapshot
                    else None
                ),
                "profitability": (
                    baseline_response.snapshot.total_profitability
                    if baseline_response.snapshot
                    else 0
                ),
                "message": f"Baseline profitability snapshot created for project {project_id}",
                "project_id": project_id,
            }
        else:
            return {
                "success": False,
                "error": f"Failed to create baseline: {baseline_response.error}",
                "project_id": project_id,
            }

    except Exception as e:
        return {
            "success": False,
            "error": f"Error creating baseline: {str(e)}",
            "project_id": project_id,
        }


@tool
def create_profitability_snapshot_after_change(
    project_id: UUID, triggered_by_agent: str, triggered_by_action: str
) -> Dict[str, Any]:
    """
    Create a new profitability snapshot after an agent makes project changes.
    This compares against the baseline and returns profitability delta.

    Args:
        project_id: UUID of the project
        triggered_by_agent: Name of the agent that made changes
        triggered_by_action: Specific action that was performed

    Returns:
        Dictionary with snapshot and profitability change analysis
    """
    try:
        # Ensure baseline exists first
        baseline_response = ProfitabilityService.get_latest_baseline_for_project(
            project_id
        )

        if not baseline_response.success:
            # Create baseline if it doesn't exist
            baseline_creation = create_profitability_baseline(
                project_id=project_id,
                triggered_by_agent="system",
                triggered_by_action="auto_baseline_before_change",
            )

            if not baseline_creation["success"]:
                return {
                    "success": False,
                    "error": f"Could not create or retrieve baseline: {baseline_response.error}",
                    "project_id": project_id,
                }

            # Get the newly created baseline
            baseline_response = ProfitabilityService.get_latest_baseline_for_project(
                project_id
            )

        baseline = baseline_response.snapshot

        # Create new snapshot referencing the baseline
        snapshot_response = ProfitabilityService.create_snapshot_from_project_id(
            project_id=project_id,
            baseline_id=baseline.id,
            triggered_by_agent=triggered_by_agent,
            triggered_by_action=triggered_by_action,
        )

        if not snapshot_response.success:
            return {
                "success": False,
                "error": f"Failed to create snapshot: {snapshot_response.error}",
                "project_id": project_id,
            }

        # Calculate profitability change since baseline
        delta_response = (
            ProfitabilityService.calculate_profitability_change_since_baseline(
                snapshot_response.snapshot.id
            )
        )

        result = {
            "success": True,
            "project_id": project_id,
            "triggered_by_agent": triggered_by_agent,
            "triggered_by_action": triggered_by_action,
            "current_snapshot": snapshot_response.snapshot.model_dump(),
            "baseline_snapshot": baseline.model_dump(),
            "profitability_analysis": None,
        }

        if delta_response.success and delta_response.delta:
            delta = delta_response.delta
            result["profitability_analysis"] = {
                "current_profitability": delta.current_profitability,
                "baseline_profitability": delta.baseline_profitability,
                "change_amount": delta.change_amount,
                "change_percentage": delta.change_percentage,
                "is_improvement": delta.is_improvement,
                "change_description": _format_profitability_change(delta),
            }

        return result

    except Exception as e:
        return {
            "success": False,
            "error": f"Error creating snapshot after change: {str(e)}",
            "project_id": project_id,
        }


@tool
def analyze_profitability_trends(project_id: UUID) -> Dict[str, Any]:
    """
    Analyze profitability trends and changes for a project.

    Args:
        project_id: UUID of the project

    Returns:
        Dictionary with comprehensive profitability analysis
    """
    try:
        # Get latest snapshot
        latest_snapshot_response = ProfitabilityService.get_latest_snapshot_for_project(
            project_id
        )
        if not latest_snapshot_response.success:
            return {
                "success": False,
                "error": f"No profitability data found for project {project_id}",
                "project_id": project_id,
            }

        latest_snapshot = latest_snapshot_response.snapshot

        # Get baseline
        baseline_response = ProfitabilityService.get_latest_baseline_for_project(
            project_id
        )

        result = {
            "success": True,
            "project_id": project_id,
            "current_profitability": latest_snapshot.total_profitability,
            "last_updated": latest_snapshot.created_at.isoformat(),
            "last_triggered_by": {
                "agent": latest_snapshot.triggered_by_agent,
                "action": latest_snapshot.triggered_by_action,
            },
        }

        if baseline_response.success and baseline_response.snapshot:
            # Calculate change since baseline
            delta_response = (
                ProfitabilityService.calculate_profitability_change_since_baseline(
                    latest_snapshot.id
                )
            )

            if delta_response.success and delta_response.delta:
                delta = delta_response.delta
                result["baseline_comparison"] = {
                    "baseline_profitability": delta.baseline_profitability,
                    "change_amount": delta.change_amount,
                    "change_percentage": delta.change_percentage,
                    "is_improvement": delta.is_improvement,
                    "change_description": _format_profitability_change(delta),
                }
        else:
            result["baseline_comparison"] = {
                "error": "No baseline found for comparison"
            }

        return result

    except Exception as e:
        return {
            "success": False,
            "error": f"Error analyzing profitability trends: {str(e)}",
            "project_id": project_id,
        }


def _format_profitability_change(delta) -> str:
    """Format profitability change into human-readable description"""
    if delta.change_amount == 0:
        return "No change in profitability"

    direction = "improved" if delta.is_improvement else "declined"
    amount = abs(delta.change_amount)

    if delta.change_percentage is not None:
        return f"Profitability has {direction} by ${amount:.2f} ({delta.change_percentage:.1f}%)"
    else:
        return f"Profitability has {direction} by ${amount:.2f}"


@tool
def monitor_project_profitability(
    project_id: UUID, agent_action: str, triggered_by_agent: str
) -> str:
    """
    Complete profitability monitoring flow: create baseline if needed, then snapshot after change.

    This is the main entry point for profitability monitoring during agent actions.

    Args:
        project_id: UUID of the project being modified
        agent_action: Description of the action being performed
        triggered_by_agent: Name of the agent performing the action

    Returns:
        Formatted profitability analysis report
    """
    try:
        # Step 1: Ensure baseline exists (create if first time)
        if project_id not in _project_baselines_created:
            baseline_result = create_profitability_baseline(
                project_id=project_id,
                triggered_by_agent="system",
                triggered_by_action="initial_baseline",
            )

            if not baseline_result["success"]:
                return f"Error creating baseline for project {project_id}: {baseline_result.get('error', 'Unknown error')}"

        # Step 2: Create snapshot after the change
        snapshot_result = create_profitability_snapshot_after_change(
            project_id=project_id,
            triggered_by_agent=triggered_by_agent,
            triggered_by_action=agent_action,
        )

        if not snapshot_result["success"]:
            return f"Error creating profitability snapshot: {snapshot_result.get('error', 'Unknown error')}"

        # Step 3: Format and return analysis
        analysis = snapshot_result.get("profitability_analysis", {})

        if analysis:
            return f"""
Profitability Impact Analysis for Project {project_id}:

Action: {agent_action} (by {triggered_by_agent})
Current Profitability: ${analysis['current_profitability']:.2f}
Baseline Profitability: ${analysis['baseline_profitability']:.2f}

{analysis['change_description']}

{'🟢 Positive Impact' if analysis['is_improvement'] else '🔴 Negative Impact'}
"""
        else:
            current_profit = snapshot_result["current_snapshot"]["total_profitability"]
            return f"""
Profitability Snapshot Created for Project {project_id}:

Action: {agent_action} (by {triggered_by_agent})
Current Profitability: ${current_profit:.2f}

Baseline established for future comparisons.
"""

    except Exception as e:
        return f"Error monitoring project profitability: {str(e)}"


@tool
def profitability_agent(query: str, project_context: Optional[str] = None) -> str:
    """
    Handle profitability monitoring queries and analysis requests.

    Args:
        query: Profitability question or monitoring request
        project_context: Optional context about project and agent actions

    Returns:
        Structured profitability analysis response
    """
    try:
        # Create specialized profitability monitoring agent
        bedrock_model = _create_bedrock_model()

        profitability_agent_instance = Agent(
            model=bedrock_model,
            system_prompt=PROFITABILITY_PROMPT,
            tools=[
                create_profitability_baseline,
                create_profitability_snapshot_after_change,
                analyze_profitability_trends,
                monitor_project_profitability,
            ],
        )

        # Enhance query with context if provided
        enhanced_query = query
        if project_context:
            enhanced_query = f"Project Context: {project_context}\n\nQuery: {query}"

        # Get agent response
        response = profitability_agent_instance(enhanced_query)

        # Structure the response for consistency
        return f"Profitability Analysis:\n{str(response)}"

    except Exception as e:
        return f"Error in profitability agent: {str(e)}"
