import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .agents.orchestrator import run as orchestrator_run
from .agents.project_management import (
    analyze_project_health,
    create_comprehensive_project_plan,
    project_management_agent,
)
from .config import agent_config, app_config

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


class ProjectManagementRequest(BaseModel):
    query: str
    project_context: Optional[str] = None


class ProjectCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    client_id: str
    duration: Optional[str] = None
    budget: Optional[str] = None
    team_size: Optional[str] = None
    project_status: str = "RFP"
    project_start_date: Optional[str] = None
    project_due_date: Optional[str] = None


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
            "project_management": "/api/v1/project-management/query",
            "project_create": "/api/v1/project-management/create",
            "project_analyze": "/api/v1/project-management/analyze/{project_id}",
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

    async def generate_stream():
        try:
            async for chunk in orchestrator_run(request.query):
                # Chunks are already filtered by orchestrator
                yield f"data: {json.dumps(chunk)}\n\n"
        except Exception as e:
            # Send error as final chunk
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


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


# Project Management API endpoints
@app.post("/api/v1/project-management/query")
async def project_management_query(request: ProjectManagementRequest):
    """
    Handle project management queries with database integration
    """
    try:
        result = project_management_agent(request.query, request.project_context)
        return {
            "response": result,
            "agent": "project_management",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Project management query failed: {str(e)}"
        )


@app.post("/api/v1/project-management/create")
async def create_project_plan_endpoint(request: ProjectCreateRequest):
    """
    Create a comprehensive project plan with database integration
    """
    try:
        project_data = {
            "name": request.name,
            "description": request.description,
            "client_id": request.client_id,
            "duration": request.duration,
            "budget": request.budget,
            "team_size": request.team_size,
            "project_status": request.project_status,
            "project_start_date": request.project_start_date,
            "project_due_date": request.project_due_date,
        }

        result = create_comprehensive_project_plan(project_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Project creation failed: {str(e)}"
        )


@app.get("/api/v1/project-management/analyze/{project_id}")
async def analyze_project_endpoint(project_id: str):
    """
    Analyze project health and provide recommendations
    """
    try:
        result = analyze_project_health(project_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Project analysis failed: {str(e)}"
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
