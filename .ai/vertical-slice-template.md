# Vertical Slice Template (Separated Runtimes)

## Overview
Template for implementing features across both Next.js frontend and Python agent runtime. Each slice maintains separation between the two runtimes while providing end-to-end functionality.

## Slice Structure Across Runtimes

### Next.js Frontend Slice
```
nextjs-psa-app/src/app/[slice-name]/
├── page.tsx                        # Main page component
├── components/
│   ├── [SliceName]Dashboard.tsx
│   ├── [SliceName]Form.tsx
│   ├── [SliceName]List.tsx
│   ├── [SliceName]Detail.tsx
│   └── AgentInteraction.tsx        # Agent request/response UI
├── hooks/
│   ├── use[SliceName].ts           # Data fetching hooks
│   ├── useAgent[SliceName].ts      # Agent interaction hooks
│   └── useRealtime[SliceName].ts   # Real-time event hooks
├── types/
│   ├── index.ts                    # TypeScript interfaces
│   └── api.ts                      # API request/response types
└── utils/
    ├── validation.ts               # Form validation schemas
    ├── formatting.ts               # Data formatting utilities
    └── constants.ts                # Slice-specific constants
```

### Next.js API Proxy Routes
```
nextjs-psa-app/src/app/api/[slice-name]/
├── route.ts                        # Main proxy endpoint
├── status/route.ts                 # Session status endpoint
└── webhooks/route.ts               # Real-time event handlers (if needed)
```

### Python Agent Runtime Slice
```
python-agent-runtime/src/agents/[slice-name]/
├── __init__.py
├── agent.py                        # Main Strands SDK agent implementation
├── tools.py                        # Agent-specific tools
├── prompts.py                      # System prompts and templates
└── schemas.py                      # Pydantic models for this agent
```

### Shared Database Schema
```
supabase/migrations/[slice-name]/
├── 001_create_tables.sql           # Core tables for slice
├── 002_create_indexes.sql          # Performance indexes
├── 003_add_rls_policies.sql        # Row Level Security
└── seed_data.sql                   # Sample data for development
```

## Implementation Guidelines

### 1. Self-Contained Components
- All UI components live within the slice
- No cross-slice component dependencies
- Use centralized style guide utilities only
- Duplicate common patterns rather than abstract

### 2. API Boundaries
- Each slice has its own API routes
- No shared API utilities (duplicate if needed)
- Agent integration isolated to slice
- Real-time events scoped to slice

### 3. Database Schema
- Slice-specific tables with clear naming
- Foreign keys to shared entities (users, organizations)
- Independent migrations per slice
- No cross-slice database dependencies

### 4. Agent Integration
- One primary agent per slice
- Agent code lives in slice directory
- Shared orchestrator calls slice agents
- Real-time logging scoped to slice

### 5. Type Safety
- All types defined within slice
- No shared type dependencies
- API contracts clearly defined
- Real-time event types included

## Real-time Integration Pattern

### Supabase Real-time Setup
```typescript
// hooks/useRealtime[SliceName].ts
export function useRealtime[SliceName](sessionId: string) {
  const supabase = useSupabaseClient()
  const [logs, setLogs] = useState<AgentLog[]>([])
  
  useEffect(() => {
    const channel = supabase
      .channel(`[slice-name]_logs_${sessionId}`)
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
  
  return { logs }
}
```

### Agent Thinking Logs Component
```typescript
// components/ThinkingLogs.tsx
interface ThinkingLogsProps {
  sessionId: string
  isActive: boolean
}

export function ThinkingLogs({ sessionId, isActive }: ThinkingLogsProps) {
  const { logs } = useRealtime[SliceName](sessionId)
  
  return (
    <div className="thinking-logs">
      {logs.map(log => (
        <div key={log.id} className="log-entry">
          <span className="timestamp">{log.timestamp}</span>
          <span className="message">{log.message}</span>
        </div>
      ))}
      {isActive && <LoadingIndicator />}
    </div>
  )
}
```

### Next.js API Proxy Integration
```typescript
// nextjs-psa-app/src/app/api/[slice-name]/route.ts
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
    type: '[slice-name]',
    request: agentRequest.request,
    context: agentRequest.context,
    user_id: session.user.id
  })
  
  return Response.json(response)
}
```

### Python Agent Implementation
```python
# python-agent-runtime/src/agents/[slice-name]/agent.py
from strands import Agent, tool
from ..base import BaseAgent

@tool
def [slice_name]_agent(request: str, context: dict = None) -> str:
    """
    Handle [slice-name] specific tasks.
    
    Args:
        request: Natural language description of task
        context: Optional context data
        
    Returns:
        Processed response for [slice-name] operations
    """
    agent = Agent(
        system_prompt=get_[slice_name]_prompt(),
        tools=get_[slice_name]_tools()
    )
    
    result = agent.process(request, context)
    return result
```

## Development Workflow (Separated Runtimes)

### 1. Create Slice Directories
```bash
# Next.js frontend slice
mkdir -p nextjs-psa-app/src/app/[slice-name]/{components,hooks,types,utils}
mkdir -p nextjs-psa-app/src/app/api/[slice-name]

# Python agent slice  
mkdir -p python-agent-runtime/src/agents/[slice-name]

# Database migrations
mkdir -p supabase/migrations/[slice-name]
```

### 2. Implement Database Schema
- Create tables in `supabase/migrations/[slice-name]/001_create_tables.sql`
- Add indexes in `supabase/migrations/[slice-name]/002_create_indexes.sql`
- Setup RLS in `supabase/migrations/[slice-name]/003_add_rls_policies.sql`
- Create seed data in `supabase/migrations/[slice-name]/seed_data.sql`

### 3. Build Python Agent
- Implement Strands SDK agent in `python-agent-runtime/src/agents/[slice-name]/agent.py`
- Define tools in `python-agent-runtime/src/agents/[slice-name]/tools.py`
- Add prompts in `python-agent-runtime/src/agents/[slice-name]/prompts.py`
- Register agent with orchestrator

### 4. Create Next.js API Proxy
- Implement proxy routes in `nextjs-psa-app/src/app/api/[slice-name]/route.ts`
- Add authentication middleware
- Setup request forwarding to Python runtime
- Handle error responses

### 5. Build UI Components
- Create React components using design system
- Implement real-time agent interaction components
- Add form handling and validation
- Setup real-time subscriptions for agent logs

### 6. Integration Testing
- Test Next.js → Python runtime communication
- Validate real-time event flow
- Test end-to-end slice workflows
- Verify authentication and authorization

## Testing Strategy

### Unit Tests
- Test each slice component independently
- Mock external dependencies
- Validate agent tool functions

### Integration Tests
- Test slice API endpoints
- Validate agent responses
- Test real-time event flow

### E2E Tests
- Test complete slice workflows
- Validate UI interactions
- Test agent thinking log display

## Collaboration Guidelines

### Preventing Conflicts
- Each developer owns one or more slices
- No shared code modifications
- Clear slice boundaries
- Independent deployment per slice

### Communication
- Document slice interfaces clearly
- Share agent specifications
- Coordinate style guide updates
- Regular integration testing 