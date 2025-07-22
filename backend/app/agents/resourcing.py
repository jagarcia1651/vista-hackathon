"""
Resourcing Agent - Specialized for resource allocation and capacity planning
"""

import json
import os
from typing import Any, Dict, List, Optional

from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# Resourcing System Prompt
RESOURCING_PROMPT = """
You are a specialized Resourcing Agent for Professional Service Automation.

Your expertise includes:
- Resource allocation and optimization
- Capacity planning and utilization analysis
- Skill matching and team composition
- Workload balancing and scheduling
- Resource cost optimization
- Availability forecasting

Focus on maximizing team utilization while ensuring project requirements are met.
Consider skills, seniority levels, rates, and availability when making recommendations.
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


@tool
def resourcing_agent(query: str, resource_context: Optional[str] = None) -> str:
    """
    Handle resourcing queries including allocation, capacity planning, and optimization.

    Args:
        query: Resourcing question or request
        resource_context: Optional context about available resources

    Returns:
        Structured resourcing response with allocation recommendations
    """
    try:
        # Create specialized resourcing agent
        bedrock_model = _create_bedrock_model()

        resource_agent = Agent(
            model=bedrock_model,
            system_prompt=RESOURCING_PROMPT,
            tools=[],  # Add specific resourcing tools as needed
        )

        # Enhance query with context if provided
        enhanced_query = query
        if resource_context:
            enhanced_query = f"Resource Context: {resource_context}\n\nQuery: {query}"

        # Get agent response
        response = resource_agent(enhanced_query)

        # Structure the response for consistency
        return f"Resourcing Analysis:\n{str(response)}"

    except Exception as e:
        return f"Error in resourcing agent: {str(e)}"


def optimize_resource_allocation(
    project_requirements: Dict[str, Any], available_resources: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Optimize resource allocation for a project using the resourcing agent
    """
    query = f"""
    Optimize resource allocation for the following requirements:
    
    Project Requirements:
    - Skills needed: {project_requirements.get('skills', [])}
    - Duration: {project_requirements.get('duration', 'Not specified')}
    - Budget constraints: {project_requirements.get('budget', 'Not specified')}
    - Start date: {project_requirements.get('start_date', 'Not specified')}
    
    Available Resources:
    {json.dumps(available_resources, indent=2)}
    
    Please provide:
    1. Optimal resource allocation
    2. Utilization percentages
    3. Cost analysis
    4. Alternative scenarios
    5. Risk factors
    """

    resource_context = f"Available team members: {len(available_resources)}"
    response = resourcing_agent(query, resource_context)

    return {"allocation_plan": response, "status": "optimized", "agent": "resourcing"}


def analyze_capacity(
    team_data: List[Dict[str, Any]], time_period: str
) -> Dict[str, Any]:
    """
    Analyze team capacity and utilization
    """
    query = f"""
    Analyze team capacity for the period: {time_period}
    
    Team Data:
    {json.dumps(team_data, indent=2)}
    
    Please provide:
    1. Current utilization rates
    2. Available capacity
    3. Bottlenecks and constraints
    4. Recommendations for optimization
    """

    response = resourcing_agent(query)

    return {"capacity_analysis": response, "period": time_period, "agent": "resourcing"}
