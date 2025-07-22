"""
Quotes Agent - Specialized for quote generation and pricing optimization
"""

import json
import os
from typing import Any, Dict, List, Optional

from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# Quotes System Prompt
QUOTES_PROMPT = """
You are a specialized Quotes Agent for Professional Service Automation.

Your expertise includes:
- Quote generation and pricing strategies
- Cost estimation and budget planning
- Competitive pricing analysis
- Value-based pricing models
- Risk-adjusted pricing
- Quote optimization and margin analysis

Focus on creating competitive yet profitable quotes that reflect true project value.
Consider market rates, project complexity, timeline, and resource requirements.
Always provide clear cost breakdowns and justifications.
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
def quotes_agent(query: str, pricing_context: Optional[str] = None) -> str:
    """
    Handle quote generation and pricing optimization queries.

    Args:
        query: Quote or pricing question
        pricing_context: Optional context about pricing constraints or market data

    Returns:
        Structured quote response with pricing recommendations
    """
    try:
        # Create specialized quotes agent
        bedrock_model = _create_bedrock_model()

        quote_agent = Agent(
            model=bedrock_model,
            system_prompt=QUOTES_PROMPT,
            tools=[],  # Add specific pricing tools as needed
        )

        # Enhance query with context if provided
        enhanced_query = query
        if pricing_context:
            enhanced_query = f"Pricing Context: {pricing_context}\n\nQuery: {query}"

        # Get agent response
        response = quote_agent(enhanced_query)

        # Structure the response for consistency
        return f"Quote Analysis:\n{str(response)}"

    except Exception as e:
        return f"Error in quotes agent: {str(e)}"


def generate_project_quote(
    project_spec: Dict[str, Any], client_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate a comprehensive quote for a project
    """
    client_info = ""
    if client_context:
        client_info = f"""
        Client Context:
        - Industry: {client_context.get('industry', 'Not specified')}
        - Size: {client_context.get('size', 'Not specified')}
        - Budget range: {client_context.get('budget_range', 'Not specified')}
        - Timeline constraints: {client_context.get('timeline', 'Not specified')}
        """

    query = f"""
    Generate a comprehensive quote for the following project:
    
    Project Specification:
    - Scope: {project_spec.get('scope', 'Not defined')}
    - Deliverables: {project_spec.get('deliverables', [])}
    - Timeline: {project_spec.get('timeline', 'Not specified')}
    - Complexity: {project_spec.get('complexity', 'Medium')}
    - Required skills: {project_spec.get('skills', [])}
    
    {client_info}
    
    Please provide:
    1. Detailed cost breakdown
    2. Timeline and milestones
    3. Resource allocation
    4. Risk factors and contingencies
    5. Terms and conditions recommendations
    6. Alternative pricing scenarios
    """

    pricing_context = f"Project complexity: {project_spec.get('complexity', 'Medium')}"
    response = quotes_agent(query, pricing_context)

    return {"quote": response, "status": "generated", "agent": "quotes"}


def optimize_quote_pricing(
    base_quote: Dict[str, Any], market_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Optimize quote pricing based on market data and competitive analysis
    """
    query = f"""
    Optimize the pricing for this quote based on market conditions:
    
    Base Quote:
    {json.dumps(base_quote, indent=2)}
    
    Market Data:
    {json.dumps(market_data, indent=2)}
    
    Please provide:
    1. Optimized pricing strategy
    2. Competitive positioning
    3. Margin analysis
    4. Risk assessment
    5. Negotiation recommendations
    """

    response = quotes_agent(query)

    return {"optimized_quote": response, "status": "optimized", "agent": "quotes"}
