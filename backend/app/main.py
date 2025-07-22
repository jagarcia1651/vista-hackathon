import json
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .agents import PSAOrchestrator
from .config import agent_config, app_config

# Initialize the PSA Orchestrator
orchestrator = PSAOrchestrator()

app = FastAPI(
    title="PSA Agent Backend",
    description="Professional Service Automation with Strands Multi-Agent Architecture",
    version="0.2.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=app_config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API requests
class AgentQueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None


class ProjectPlanRequest(BaseModel):
    project_data: Dict[str, Any]
    available_resources: List[Dict[str, Any]]


class QuoteRequest(BaseModel):
    project_spec: Dict[str, Any]
    client_context: Dict[str, Any]
    team_data: List[Dict[str, Any]]


class CapacityAnalysisRequest(BaseModel):
    projects: List[Dict[str, Any]]
    resources: List[Dict[str, Any]]
    time_horizon: str


@app.get("/health")
async def health_check():
    """Health check endpoint with agent status"""
    return {
        "status": "healthy",
        "service": "psa-agent-backend",
        "version": "0.2.0",
        "agents_available": agent_config.BEDROCK_API_KEY is not None,
        "config": {
            "model": agent_config.BEDROCK_MODEL_ID,
            "temperature": agent_config.TEMPERATURE,
            "region": agent_config.AWS_DEFAULT_REGION,
        },
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "PSA Agent Backend API with Strands Multi-Agent Architecture",
        "version": "0.2.0",
        "endpoints": {
            "health": "/health",
            "agent_query": "/api/v1/agent/query",
            "project_plan": "/api/v1/agent/project-plan",
            "quote": "/api/v1/agent/quote",
            "capacity": "/api/v1/agent/capacity-analysis",
        },
    }


# Agent API endpoints
@app.post("/api/v1/agent/query")
async def agent_query(request: AgentQueryRequest):
    """
    General agent query endpoint - orchestrator determines which agents to use
    """
    try:
        result = await orchestrator.process_request(request.query, request.context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent query failed: {str(e)}")


@app.post("/api/v1/agent/project-plan")
async def create_project_plan(request: ProjectPlanRequest):
    """
    Create a comprehensive project plan with resource allocation
    """
    try:
        result = await orchestrator.plan_project_with_resources(
            request.project_data, request.available_resources
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Project planning failed: {str(e)}"
        )


@app.post("/api/v1/agent/quote")
async def generate_quote(request: QuoteRequest):
    """
    Generate a comprehensive quote with project analysis and resource planning
    """
    try:
        result = await orchestrator.generate_comprehensive_quote(
            request.project_spec, request.client_context, request.team_data
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Quote generation failed: {str(e)}"
        )


@app.post("/api/v1/agent/capacity-analysis")
async def analyze_capacity(request: CapacityAnalysisRequest):
    """
    Analyze portfolio capacity and optimization opportunities
    """
    try:
        result = await orchestrator.analyze_portfolio_capacity(
            request.projects, request.resources, request.time_horizon
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Capacity analysis failed: {str(e)}"
        )


# Configuration endpoints
@app.get("/api/v1/config/agents")
async def get_agent_config():
    """Get current agent configuration"""
    return {
        "model_id": agent_config.BEDROCK_MODEL_ID,
        "region": agent_config.AWS_DEFAULT_REGION,
        "temperature": agent_config.TEMPERATURE,
        "max_tokens": agent_config.MAX_TOKENS,
        "memory_enabled": agent_config.ENABLE_MEMORY,
        "logging_enabled": agent_config.ENABLE_LOGGING,
        "guardrails_enabled": agent_config.GUARDRAIL_ID is not None,
        "available_models": agent_config.AVAILABLE_MODELS,
    }


@app.get("/api/v1/config/psa-defaults")
async def get_psa_defaults():
    """Get PSA domain defaults and configuration"""
    return {
        "project_phases": agent_config.DEFAULT_PROJECT_PHASES,
        "skill_categories": agent_config.DEFAULT_SKILL_CATEGORIES,
        "hourly_rates": agent_config.DEFAULT_HOURLY_RATES,
    }
