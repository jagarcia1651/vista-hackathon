# Concurrency Model: FIFO with Optimistic Concurrency

## Overview
First-In-First-Out (FIFO) request processing with optimistic concurrency control for data updates, ensuring consistent user experience while maintaining system performance.

## Request Processing Model

### FIFO Queue Architecture
```
User Requests → FIFO Queue → Agent Processing → Optimistic Updates → UI Sync
```

### Request Flow
1. **User submits request** through Next.js UI
2. **Request enters FIFO queue** with unique session ID
3. **Orchestrator processes** when queue position reached
4. **Agents collaborate** to fulfill request
5. **Optimistic updates** applied to UI immediately
6. **Final results** reconciled with actual data

## Queue Management

### Request Queue Structure
```typescript
interface RequestQueue {
  requests: QueuedRequest[]
  processing: ProcessingRequest | null
  completed: CompletedRequest[]
}

interface QueuedRequest {
  id: string
  user_id: string
  request: string
  priority: 'normal' | 'high' | 'urgent'
  queued_at: timestamp
  estimated_processing_time?: number
}

interface ProcessingRequest extends QueuedRequest {
  started_at: timestamp
  agents_involved: string[]
  current_agent?: string
  progress_percentage: number
}
```

### Queue Prioritization
- **Normal**: Standard user requests (FIFO order)
- **High**: Critical business operations (jump queue)
- **Urgent**: System maintenance/emergency fixes (immediate processing)

## Optimistic Concurrency Implementation

### Data Update Strategy
```typescript
interface OptimisticUpdate {
  id: string
  table: string
  record_id: string
  old_value: any
  new_value: any
  version: number
  status: 'pending' | 'confirmed' | 'conflict'
  timestamp: timestamp
}
```

### Update Flow
1. **UI shows optimistic update** immediately
2. **Background agent processes** actual change
3. **Version check** on database write
4. **Conflict resolution** if versions don't match
5. **UI sync** with final authoritative state

### Conflict Resolution Strategies

#### Last Writer Wins (Default)
```sql
UPDATE projects 
SET data = $new_data, version = version + 1
WHERE id = $id AND version = $expected_version
```

#### Merge Strategy (for collaborative data)
```typescript
function resolveConflict(
  current: any, 
  optimistic: any, 
  server: any
): any {
  // Custom merge logic based on data type
  if (isResourceAllocation(current)) {
    return mergeResourceAllocations(current, optimistic, server)
  }
  // Default to server state for conflicts
  return server
}
```

#### User Choice (for critical conflicts)
```typescript
interface ConflictResolution {
  type: 'user_choice'
  options: {
    keep_local: any
    use_server: any
    merge: any
  }
  deadline: timestamp
}
```

## Real-time Synchronization

### Supabase Real-time Integration
```typescript
// Subscribe to data changes for optimistic update reconciliation
const channel = supabase
  .channel('data_sync')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'projects'
  }, (payload) => {
    reconcileOptimisticUpdates(payload)
  })
  .subscribe()
```

### Conflict Notification System
```typescript
interface ConflictNotification {
  id: string
  user_id: string
  conflict_type: 'version_mismatch' | 'concurrent_edit' | 'agent_override'
  affected_data: string
  resolution_options: string[]
  auto_resolve_in: number // seconds
}
```

## Agent Processing Coordination

### Session Management
```typescript
interface AgentSession {
  id: string
  queue_position: number
  user_id: string
  request: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  agents_involved: string[]
  started_at?: timestamp
  estimated_completion?: timestamp
  progress_updates: ProgressUpdate[]
}

interface ProgressUpdate {
  agent_name: string
  message: string
  percentage: number
  timestamp: timestamp
}
```

### Cross-Agent Coordination
```python
class AgentCoordinator:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.agents_active = set()
        
    async def invoke_agent(self, agent_name: str, request: str):
        # Check for concurrent agent usage
        if agent_name in self.agents_active:
            await self.wait_for_agent_completion(agent_name)
            
        self.agents_active.add(agent_name)
        try:
            result = await agent.process(request)
            return result
        finally:
            self.agents_active.remove(agent_name)
```

## User Experience During Concurrency

### Queue Position Feedback
```typescript
interface QueueStatus {
  position: number
  estimated_wait_time: number
  ahead_of_you: number
  average_processing_time: number
}

// UI Component
function QueuePositionIndicator({ status }: { status: QueueStatus }) {
  return (
    <div className="queue-status">
      <span>Position {status.position} in queue</span>
      <span>Estimated wait: {status.estimated_wait_time}s</span>
      <ProgressBar value={calculateProgress(status)} />
    </div>
  )
}
```

### Optimistic Update Indicators
```typescript
function OptimisticIndicator({ updateStatus }: { updateStatus: string }) {
  const indicators = {
    pending: { icon: "🔄", text: "Updating...", color: "blue" },
    confirmed: { icon: "✅", text: "Saved", color: "green" },
    conflict: { icon: "⚠️", text: "Conflict detected", color: "orange" }
  }
  
  const indicator = indicators[updateStatus]
  return (
    <span className={`optimistic-indicator text-${indicator.color}`}>
      {indicator.icon} {indicator.text}
    </span>
  )
}
```

### Real-time Progress Updates
```typescript
function AgentProgressTracker({ sessionId }: { sessionId: string }) {
  const { progress } = useRealtimeProgress(sessionId)
  
  return (
    <div className="agent-progress">
      {progress.map(update => (
        <div key={update.id} className="progress-item">
          <span className="agent-name">{update.agent_name}</span>
          <span className="message">{update.message}</span>
          <ProgressBar value={update.percentage} />
        </div>
      ))}
    </div>
  )
}
```

## Database Schema for Concurrency

### Request Queue Tables
```sql
CREATE TABLE request_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  request TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'queued',
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_processing_time INTEGER,
  agents_involved TEXT[],
  result JSONB
);

CREATE TABLE optimistic_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  version INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
```

### Version Control for Core Tables
```sql
ALTER TABLE projects ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE resources ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE quotes ADD COLUMN version INTEGER DEFAULT 1;

-- Trigger to increment version on updates
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_version_trigger
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION increment_version();
```

## Performance Considerations

### Queue Processing Optimization
- **Batch processing** for similar requests
- **Agent pooling** to handle concurrent requests
- **Caching** for frequently accessed data
- **Connection pooling** for database efficiency

### Memory Management
- **Queue size limits** to prevent memory overflow
- **Request timeouts** to clear stale requests
- **Progress cleanup** for completed sessions
- **Optimistic update pruning** after reconciliation

### Monitoring & Alerting
- Queue depth monitoring
- Processing time alerts
- Conflict rate tracking
- User experience metrics 