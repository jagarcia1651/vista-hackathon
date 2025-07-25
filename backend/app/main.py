import asyncio
import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from .ai.agents.orchestrator import run as orchestrator_run
from .ai.agents.project_management import handle_project_management
from .config import agent_config, app_config
from .events.bus import BusinessEvent, event_bus
from .models.project import ProjectManagementRequest

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API requests
class AgentQueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None


# Pydantic models for API responses
class ChatResponse(BaseModel):
    response: str
    status: str
    orchestrator: Optional[str] = None
    error: Optional[str] = None


class ProjectPlanRequest(BaseModel):
    project_data: Dict[str, Any]
    available_resources: List[Dict[str, Any]]


class QuoteRequest(BaseModel):
    project_spec: Dict[str, Any]
    client_context: Dict[str, Any]
    team_data: List[Dict[str, Any]]


# ProjectManagementRequest and ProjectCreateRequest now imported from models.project


class CapacityAnalysisRequest(BaseModel):
    staffers: List[Dict[str, Any]]
    time_range: Dict[str, str]


class StafferTimeOffRequest(BaseModel):
    time_off_id: str
    staffer_id: str
    time_off_start_datetime: str
    time_off_end_datetime: str
    time_off_cumulative_hours: float
    created_at: Optional[str] = None
    last_updated_at: Optional[str] = None


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
            "quote": "/api/v1/agent/quote",
            "capacity": "/api/v1/agent/capacity-analysis",
            "time_off_created": "/api/v1/agent/time-off-created",
        },
    }


# Agent API endpoints
@app.post("/api/v1/agent/query")
async def agent_query(request: AgentQueryRequest) -> ChatResponse:
    """
    General agent query endpoint - orchestrator determines which agents to use
    """
    try:
        # Run the orchestrator and wait for the result
        result = await orchestrator_run(request.query)

        return ChatResponse(
            response=result, status="success", orchestrator="main_orchestrator"
        )
    except Exception as e:
        return ChatResponse(
            response="", status="error", error=f"Error processing query: {str(e)}"
        )


@app.post("/api/v1/agent/project-plan")
async def create_project_plan(request: ProjectPlanRequest):
    """
    Create a comprehensive project plan with resource allocation
    """
    try:
        result = await orchestrator_run.plan_project_with_resources(
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
        result = await orchestrator_run.generate_comprehensive_quote(
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
        result = await handle_project_management(request.query, request.project_context)
        return {
            "response": result,
            "agent": "project_management",
            "timestamp": datetime.utcnow().isoformat() + "Z",  # Explicitly mark as UTC
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Project management query failed: {str(e)}"
        )


@app.post("/api/v1/agent/capacity-analysis")
async def capacity_analysis(request: CapacityAnalysisRequest):
    """
    Analyze team capacity and utilization
    """
    try:
        result = await orchestrator_run.analyze_capacity(
            request.staffers, request.time_range
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Capacity analysis failed: {str(e)}"
        )


@app.post("/api/v1/agent/time-off-created-debug")
async def time_off_created_debug(request: Dict[str, Any]):
    """
    Debug endpoint to see raw request data
    """
    print(f"DEBUG - Raw request data: {request}")
    print(f"DEBUG - Request type: {type(request)}")
    for key, value in request.items():
        print(f"DEBUG - {key}: {value} (type: {type(value)})")
    return {"received": request}


@app.post("/api/v1/agent/time-off-created")
async def time_off_created(request: StafferTimeOffRequest):
    """
    Handle time off creation events and trigger orchestrator agent
    """
    try:
        print(f"Received time off request: {request}")
        print(f"Request dict: {request.dict()}")

        # Create a test message for the orchestrator about the time off creation
        query = f"""
            Time off has been created for staffer {request.staffer_id} from {request.time_off_start_datetime} to {request.time_off_end_datetime} with {request.time_off_cumulative_hours} hours.
            Analyze potential impact on project schedules and resource allocation.
            If the time off occurs when a staffer is assigned to a project task, assign an available staffer on the project team to the task.
        """

        # Trigger orchestrator agent with the time off information
        asyncio.create_task(orchestrator_run(query))

        return {
            "status": "processing",
            "message": "Time off creation event received and sent to orchestrator",
            "time_off_id": request.time_off_id,
        }
    except Exception as e:
        print(f"Error in time_off_created endpoint: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Time off event processing failed: {str(e)}"
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


@app.get("/api/v1/agent/events")
async def subscribe_to_events():
    """
    Server-Sent Events (SSE) endpoint for real-time agent events.

    This endpoint establishes a long-lived connection that streams events from:
    - AI agent actions (staff reassignments, task updates)
    - System notifications (PTO conflicts, scheduling issues)
    - Chat messages

    The frontend maintains a persistent connection to this endpoint to receive
    real-time updates in the sidebar event stream.

    Returns:
        EventSourceResponse: SSE stream of agent and system events
    """

    async def event_generator():
        queue = asyncio.Queue()

        async def handle_event(event: BusinessEvent):
            await queue.put(event)

        event_bus.subscribe(handle_event)
        try:
            while True:
                try:
                    event = await queue.get()
                    if event:
                        data = {
                            "type": event.type.value,
                            "agent_id": event.agent_id.value,
                            "timestamp": event.timestamp.isoformat() + "Z",  # Explicitly mark as UTC
                            "message": event.message,
                        }
                        yield {
                            "event": "message",
                            "id": str(id(event)),
                            "retry": 1000,
                            "data": json.dumps(data),  # Properly serialize the data
                        }
                except Exception as e:
                    print(f"Error in event stream: {e}")
                    continue
        except asyncio.CancelledError:
            # Handle client disconnect
            pass
        finally:
            event_bus.unsubscribe(handle_event)

    return EventSourceResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
