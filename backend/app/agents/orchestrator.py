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
    Main orchestrator for PSA multi-agent system - simplified for fast testing
    """

    def __init__(self):
        # Simplified initialization - no agent setup for faster testing
        self.agent = None  # Bypassed for testing
        self.mode = "testing"

    async def process_request(
        self, query: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a PSA request - simplified for testing without agent latency

        Args:
            query: User query or request
            context: Optional context including project data, resources, etc.

        Returns:
            Fast mock response for testing UI
        """
        try:
            # Fast mock responses based on query keywords for testing
            query_lower = query.lower()

            if any(word in query_lower for word in ["project", "plan", "planning"]):
                response = """📋 **Project Planning Analysis**

Based on your request, here are the key recommendations:

**Phase 1: Discovery & Requirements**
- Duration: 2-3 weeks
- Resources: 1 Business Analyst, 1 Project Manager
- Deliverables: Requirements document, scope definition

**Phase 2: Design & Architecture**  
- Duration: 3-4 weeks
- Resources: 1 Solution Architect, 1 UX Designer
- Deliverables: Technical architecture, UI/UX mockups

**Phase 3: Development**
- Duration: 8-12 weeks  
- Resources: 3-4 Developers, 1 Tech Lead
- Deliverables: Core functionality, integrations

**Estimated Timeline:** 14-18 weeks
**Estimated Budget:** $180K - $240K
**Risk Level:** Medium"""

            elif any(word in query_lower for word in ["resource", "capacity", "team"]):
                response = """👥 **Resource Allocation Analysis**

**Current Team Capacity:**
- Available capacity: 32 hours/week
- Current utilization: 85%
- Upcoming availability: 15% increase next month

**Optimal Resource Mix:**
- Senior Developer: 2 FTE (40 hrs/week)
- Mid-level Developer: 1 FTE (40 hrs/week)  
- Project Manager: 0.5 FTE (20 hrs/week)
- QA Engineer: 0.5 FTE (20 hrs/week)

**Recommendations:**
- ✅ Team has sufficient capacity for Q1 projects
- ⚠️ Consider hiring 1 additional mid-level developer for Q2
- 🎯 Focus on skill development in cloud technologies"""

            elif any(
                word in query_lower for word in ["quote", "price", "cost", "budget"]
            ):
                response = """💰 **Quote Generation Analysis**

**Project Cost Breakdown:**

**Labor Costs:**
- Development: $120,000 (800 hours × $150/hr)
- Project Management: $18,000 (120 hours × $150/hr)
- QA & Testing: $15,000 (100 hours × $150/hr)
- **Subtotal: $153,000**

**Additional Costs:**
- Infrastructure & Tools: $5,000
- Third-party licenses: $3,000
- Contingency (10%): $16,100
- **Total Project Cost: $177,100**

**Competitive Positioning:**
- Market range: $150K - $220K
- Our quote: $177,100 (within competitive range)
- Value proposition: Premium quality with proven track record"""

            else:
                response = f"""🤖 **PSA Agent Response**

Thank you for your question: "{query}"

I'm your Professional Service Automation assistant. I can help you with:

**🔹 Project Management**
- Project planning and timeline estimation
- Risk assessment and mitigation strategies
- Resource allocation optimization

**🔹 Resource Planning**  
- Team capacity analysis
- Skill gap identification
- Utilization optimization

**🔹 Quote Generation**
- Competitive pricing strategies
- Cost estimation and breakdown
- Proposal recommendations

**🔹 Business Intelligence**
- Portfolio analysis
- Performance metrics
- Strategic recommendations

Would you like me to dive deeper into any of these areas? Just ask about specific project planning, resource allocation, or quote generation needs!"""

            return {
                "response": response,
                "status": "success",
                "orchestrator": "psa_simplified",
                "processing_time": "< 100ms",
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
