"""
PSA Orchestrator Agent - Coordinates specialized agents using Strands "agents as tools" pattern
"""

import json
import os
from typing import Any, Dict, List, Optional

from strands import Agent
from strands.models.bedrock import BedrockModel

from .project_management import create_project_plan, project_management_agent
from .quotes import generate_project_quote, optimize_quote_pricing, quotes_agent
from .resourcing import analyze_capacity, optimize_resource_allocation, resourcing_agent

# Main Orchestrator System Prompt
ORCHESTRATOR_PROMPT = """
You are the PSA Orchestrator Agent - the main coordinator for Professional Service Automation.

You have access to three specialized agents as tools:
1. Project Management Agent - For project planning, analysis, and optimization
2. Resourcing Agent - For resource allocation, capacity planning, and team optimization  
3. Quotes Agent - For quote generation, pricing strategies, and cost optimization

Your role is to:
- Understand complex PSA queries that may require multiple agents
- Determine which agents to engage and in what sequence
- Coordinate between agents to provide comprehensive solutions
- Synthesize multi-agent responses into coherent recommendations
- Handle cross-domain PSA scenarios (e.g., project planning with resource constraints and pricing)

When users ask PSA-related questions:
1. Analyze what domain expertise is needed
2. Call the appropriate specialist agents as tools
3. Combine their insights into unified recommendations
4. Provide actionable next steps

Always be strategic and business-focused in your responses.
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


class PSAOrchestrator:
    """
    Main orchestrator for PSA multi-agent system using Strands agents-as-tools pattern
    """

    def __init__(self):
        # Configure Bedrock model for orchestrator
        bedrock_model = _create_bedrock_model()

        # Initialize the orchestrator agent with specialized agents as tools
        self.agent = Agent(
            model=bedrock_model,
            system_prompt=ORCHESTRATOR_PROMPT,
            tools=[project_management_agent, resourcing_agent, quotes_agent],
        )

    async def process_request(
        self, query: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a PSA request using the multi-agent orchestrator

        Args:
            query: User query or request
            context: Optional context including project data, resources, etc.

        Returns:
            Orchestrated response with insights from relevant agents
        """
        try:
            # Enhance query with context if provided
            enhanced_query = query
            if context:
                enhanced_query = f"""
                Context: {json.dumps(context, indent=2)}
                
                Query: {query}
                
                Please analyze this request and coordinate with the appropriate specialist agents to provide a comprehensive response.
                """

            # Get orchestrated response
            response = self.agent(enhanced_query)

            return {
                "response": str(response),
                "status": "success",
                "orchestrator": "psa_main",
            }

        except Exception as e:
            return {"error": f"Orchestrator error: {str(e)}", "status": "error"}

    async def plan_project_with_resources(
        self, project_data: Dict[str, Any], available_resources: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Create a comprehensive project plan with resource allocation
        """
        query = f"""
        I need to plan a new project with optimal resource allocation:
        
        Project Data: {json.dumps(project_data, indent=2)}
        Available Resources: {json.dumps(available_resources, indent=2)}
        
        Please:
        1. Use the project management agent to create a detailed project plan
        2. Use the resourcing agent to optimize resource allocation
        3. Provide integrated recommendations for execution
        """

        context = {
            "project": project_data,
            "resources": available_resources,
            "request_type": "integrated_planning",
        }

        return await self.process_request(query, context)

    async def generate_comprehensive_quote(
        self,
        project_spec: Dict[str, Any],
        client_context: Dict[str, Any],
        team_data: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Generate a quote with project planning and resource analysis
        """
        query = f"""
        Generate a comprehensive quote for this project opportunity:
        
        Project Specification: {json.dumps(project_spec, indent=2)}
        Client Context: {json.dumps(client_context, indent=2)}
        Team Data: {json.dumps(team_data, indent=2)}
        
        Please:
        1. Use the project management agent to analyze project complexity and requirements
        2. Use the resourcing agent to determine optimal team composition and timeline
        3. Use the quotes agent to generate competitive pricing with detailed justification
        4. Provide a unified proposal strategy
        """

        context = {
            "project_spec": project_spec,
            "client": client_context,
            "team": team_data,
            "request_type": "comprehensive_quote",
        }

        return await self.process_request(query, context)

    async def analyze_portfolio_capacity(
        self,
        projects: List[Dict[str, Any]],
        resources: List[Dict[str, Any]],
        time_horizon: str,
    ) -> Dict[str, Any]:
        """
        Analyze portfolio capacity and optimization opportunities
        """
        query = f"""
        Analyze our portfolio capacity and identify optimization opportunities:
        
        Current Projects: {json.dumps(projects, indent=2)}
        Available Resources: {json.dumps(resources, indent=2)}
        Time Horizon: {time_horizon}
        
        Please:
        1. Use the project management agent to analyze project portfolio health
        2. Use the resourcing agent to identify capacity constraints and opportunities
        3. Provide strategic recommendations for portfolio optimization
        """

        context = {
            "projects": projects,
            "resources": resources,
            "time_horizon": time_horizon,
            "request_type": "portfolio_analysis",
        }

        return await self.process_request(query, context)
