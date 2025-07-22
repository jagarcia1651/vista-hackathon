# Runtime Architecture: Separated Next.js and Python Applications

## Overview
Two distinct runtime applications: a Next.js web application for the frontend and a Python application for the agent backend, communicating via HTTP API and shared Supabase instance.

## Architecture Diagram
```
┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
│           Next.js Runtime           │    │          Python Runtime             │
│  ┌─────────────────────────────────┐│    │  ┌─────────────────────────────────┐│
│  │        Frontend App             ││    │  │      Agent Orchestrator         ││
│  │  - React Components             ││    │  │  - Strands SDK Integration      ││
│  │  - Style Guide/UI               ││    │  │  - Agent Coordination           ││
│  │  - Real-time subscriptions      ││    │  │  - Request Queue Management     ││
│  └─────────────────────────────────┘│    │  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│    │  ┌─────────────────────────────────┐│
│  │       API Routes (Proxy)        ││◄──►│  │        FastAPI Server           ││
│  │  - /api/agents/*                ││    │  │  - Agent endpoints              ││
│  │  - Authentication middleware    ││    │  │  - Request validation           ││
│  │  - Request forwarding           ││    │  │  - Response formatting          ││
│  └─────────────────────────────────┘│    │  └─────────────────────────────────┘│
└─────────────────────────────────────┘    │  ┌─────────────────────────────────┐│
                    │                      │  │     Specialized Agents          ││
                    │                      │  │  - Project Management Agent    ││
                    ▼                      │  │  - Resourcing Agent             ││
┌─────────────────────────────────────┐    │  │  - Quotes Agent                 ││
│            Supabase                 │    │  └─────────────────────────────────┘│
│  - Authentication                   │◄───┴─────────────────────────────────────┘
│  - Database (PostgreSQL)            │
│  - Real-time subscriptions          │
│  - Row Level Security               │
└─────────────────────────────────────┘
```

## Runtime Separation

### Next.js Application Responsibilities
- **User Interface**: React components, routing, styling
- **Authentication**: Supabase Auth integration and session management
- **Real-time UI**: Subscribe to agent thinking logs and data updates
- **API Proxy**: Forward agent requests to Python runtime
- **Static Assets**: Serve static content and application shell

### Python Application Responsibilities
- **Agent Processing**: All Strands SDK agent implementations
- **Business Logic**: PSA domain logic and agent coordination
- **Queue Management**: FIFO request processing and concurrency control
- **Database Operations**: Direct Supabase client for agent data operations
- **Real-time Publishing**: Publish thinking logs and progress updates

## Communication Patterns

### Request Flow
```
User Action → Next.js UI → Next.js API Route → Python FastAPI → Agent Processing → Supabase
                    ↑                                                                    ↓
              Real-time Updates ←── Supabase Real-time ←── Agent Thinking Logs
```

### API Contract
```typescript
// Shared types between runtimes
interface AgentRequest {
  type: 'project_management' | 'resourcing' | 'quotes' | 'orchestrator'
  request: string
  context?: Record<string, any>
  session_id: string
  user_id: string
}

interface AgentResponse {
  session_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  result?: any
  error?: string
  agents_involved: string[]
  processing_time_ms: number
}
```

## Next.js Application Structure

```
nextjs-psa-app/
├── src/
│   ├── app/                          # Next.js 13+ app router
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── resources/
│   │   ├── quotes/
│   │   └── api/
│   │       └── agents/
│   │           ├── route.ts          # Main agent proxy endpoint
│   │           ├── project/route.ts  # Project agent proxy
│   │           ├── resource/route.ts # Resource agent proxy
│   │           └── quotes/route.ts   # Quotes agent proxy
│   ├── components/
│   │   ├── ui/                       # Base UI components
│   │   ├── dashboard/                # Dashboard components
│   │   ├── projects/                 # Project-specific components
│   │   ├── resources/                # Resource-specific components
│   │   ├── quotes/                   # Quote-specific components
│   │   └── agents/
│   │       ├── ThinkingLogs.tsx      # Real-time thinking display
│   │       ├── QueueStatus.tsx       # Queue position indicator
│   │       └── AgentResponse.tsx     # Agent result display
│   ├── lib/
│   │   ├── supabase.ts               # Supabase client setup
│   │   ├── api-client.ts             # Python runtime API client
│   │   └── design-system/            # Style guide components
│   ├── hooks/
│   │   ├── useAgent.ts               # Agent interaction hook
│   │   ├── useRealtime.ts            # Real-time subscriptions
│   │   └── useQueue.ts               # Queue status monitoring
│   └── types/
│       ├── agents.ts                 # Agent-related types
│       ├── api.ts                    # API request/response types
│       └── database.ts               # Database entity types
```

## Python Application Structure

```
python-agent-runtime/
├── src/
│   ├── main.py                       # FastAPI application entry point
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py                 # API endpoint definitions
│   │   ├── middleware.py             # Authentication, logging middleware
│   │   └── schemas.py                # Pydantic request/response schemas
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── orchestrator.py           # Main orchestrator agent
│   │   ├── project_management.py     # Project management agent
│   │   ├── resourcing.py             # Resourcing agent
│   │   ├── quotes.py                 # Quotes agent
│   │   └── base.py                   # Base agent class
│   ├── core/
│   │   ├── __init__.py
│   │   ├── queue.py                  # FIFO queue management
│   │   ├── concurrency.py            # Optimistic concurrency control
│   │   ├── logging.py                # Agent thinking log publisher
│   │   └── config.py                 # Configuration management
│   ├── database/
│   │   ├── __init__.py
│   │   ├── supabase_client.py        # Supabase client wrapper
│   │   ├── models.py                 # Database models/schemas
│   │   └── operations.py             # Database operation helpers
│   └── utils/
│       ├── __init__.py
│       ├── auth.py                   # Authentication utilities
│       └── validation.py             # Request validation
├── requirements.txt                  # Python dependencies
├── Dockerfile                        # Container configuration
└── docker-compose.yml               # Development environment
```

## API Integration Points

### Next.js API Routes (Proxy Layer)
```typescript
// src/app/api/agents/route.ts
import { createClient } from '@supabase/supabase-js'
import { AgentApiClient } from '@/lib/api-client'

export async function POST(request: Request) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  
  // Verify authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agentRequest = await request.json()
  
  // Forward to Python runtime
  const agentClient = new AgentApiClient(process.env.PYTHON_AGENT_URL!)
  const response = await agentClient.processRequest({
    ...agentRequest,
    user_id: session.user.id
  })
  
  return Response.json(response)
}
```

### Python FastAPI Endpoints
```python
# src/api/routes.py
from fastapi import FastAPI, Depends, HTTPException
from .schemas import AgentRequest, AgentResponse
from ..agents.orchestrator import orchestrator
from ..core.queue import request_queue
from ..core.auth import verify_token

app = FastAPI()

@app.post("/agents/process", response_model=AgentResponse)
async def process_agent_request(
    request: AgentRequest,
    user_id: str = Depends(verify_token)
):
    try:
        # Add to FIFO queue
        session = await request_queue.enqueue(
            user_id=user_id,
            request=request.request,
            agent_type=request.type,
            context=request.context
        )
        
        # Return immediately with session info
        return AgentResponse(
            session_id=session.id,
            status='queued',
            agents_involved=[],
            processing_time_ms=0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agents/status/{session_id}")
async def get_session_status(session_id: str):
    status = await request_queue.get_status(session_id)
    return status
```

## Real-time Event Flow

### Agent Thinking Logs
```python
# Python runtime publishes thinking logs
class AgentLogger:
    def __init__(self, session_id: str, supabase_client):
        self.session_id = session_id
        self.supabase = supabase_client
    
    def log_thinking(self, agent_name: str, message: str):
        self.supabase.table('agent_logs').insert({
            'session_id': self.session_id,
            'agent_name': agent_name,
            'message': message,
            'timestamp': datetime.utcnow().isoformat()
        }).execute()
```

```typescript
// Next.js subscribes to thinking logs
function useAgentThinking(sessionId: string) {
  const supabase = useSupabaseClient()
  const [logs, setLogs] = useState<AgentLog[]>([])
  
  useEffect(() => {
    const channel = supabase
      .channel(`agent_logs_${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_logs',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setLogs(prev => [...prev, payload.new as AgentLog])
      })
      .subscribe()
      
    return () => supabase.removeChannel(channel)
  }, [sessionId])
  
  return logs
}
```

## Deployment Architecture

### Development Environment
```yaml
# docker-compose.yml
version: '3.8'
services:
  nextjs-app:
    build: ./nextjs-psa-app
    ports:
      - "3000:3000"
    environment:
      - PYTHON_AGENT_URL=http://python-agents:8000
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - python-agents

  python-agents:
    build: ./python-agent-runtime
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
```

### Production Deployment
- **Next.js**: Deploy to Vercel/Netlify
- **Python Agents**: Deploy to AWS Lambda/Fargate/Railway
- **Supabase**: Managed PostgreSQL + Real-time
- **Communication**: HTTPS API calls between services

## Benefits of Separated Runtimes

### Scalability
- Scale agent processing independently from UI
- Different resource requirements for each runtime
- Easier to optimize performance per service

### Development
- Teams can work independently on each runtime
- Different deployment cycles
- Technology-specific optimizations

### Maintenance
- Clear separation of concerns
- Isolated failure domains
- Independent monitoring and logging 