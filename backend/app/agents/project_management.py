"""
Project Management Agent - Specialized for project planning and analysis
"""

import json
import os
from typing import Any, Dict, Optional

from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# Project Management System Prompt
PROJECT_MANAGEMENT_PROMPT = """
You are a specialized Project Management Agent for Professional Service Automation.

Your expertise includes:
- Project planning and breakdown structure creation
- Timeline estimation and milestone planning
- Resource requirement analysis
- Risk assessment and mitigation strategies
- Project status monitoring and reporting

Focus on providing actionable project management insights based on PSA best practices.
Always structure your responses with clear phases, tasks, and timelines.
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
        # Note: Set as environment variable for boto3 to pick up
        os.environ["AWS_BEARER_TOKEN_BEDROCK"] = api_key

    return BedrockModel(model_id=model_id, region_name=region)


@tool
def project_management_agent(query: str, project_context: Optional[str] = None) -> str:
    """
    Handle project management queries including planning, analysis, and optimization.

    Args:
        query: Project management question or request
        project_context: Optional context about existing project details

    Returns:
        Structured project management response with actionable recommendations
    """
    try:
        # Create specialized project management agent
        bedrock_model = _create_bedrock_model()

        pm_agent = Agent(
            model=bedrock_model,
            system_prompt=PROJECT_MANAGEMENT_PROMPT,
            tools=[],  # Add specific PM tools as needed
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


def create_project_plan(project_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a detailed project plan using the project management agent
    """
    query = f"""
    Create a comprehensive project plan for the following project:
    
    Project Details:
    - Name: {project_data.get('name', 'Unnamed Project')}
    - Description: {project_data.get('description', 'No description provided')}
    - Duration: {project_data.get('duration', 'Not specified')}
    - Budget: {project_data.get('budget', 'Not specified')}
    - Team Size: {project_data.get('team_size', 'Not specified')}
    
    Please provide:
    1. Project phases breakdown
    2. Key milestones and timeline
    3. Resource requirements
    4. Risk assessment
    5. Success criteria
    """

    response = project_management_agent(query)

    return {
        "project_plan": response,
        "status": "generated",
        "agent": "project_management",
    }
