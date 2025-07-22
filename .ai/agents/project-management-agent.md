# Project Management Agent

## Purpose
Specialized agent for handling project lifecycle management, planning, tracking, and optimization within the PSA system.

## Core Responsibilities

### Project Planning
- Create project plans from high-level requirements
- Break down work into tasks and milestones
- Estimate timelines based on scope and resource availability
- Identify project dependencies and critical path

### Project Tracking
- Monitor project progress against plan
- Identify schedule deviations and bottlenecks
- Suggest corrective actions for delayed projects
- Generate status reports and progress summaries

### Project Optimization
- Recommend scope adjustments to meet deadlines
- Suggest resource reallocation for better outcomes
- Identify opportunities to accelerate delivery
- Propose risk mitigation strategies

## Key Capabilities

### Input Processing
- Natural language project requirements
- Existing project data for updates/analysis
- Resource constraints and availability
- Client requirements and deadlines

### Output Generation
- Structured project plans (WBS format)
- Timeline estimates with confidence intervals
- Risk assessments and mitigation plans
- Progress reports and status summaries
- Recommendations for project improvements

## Integration Points

### With Other Agents
- **Resourcing Agent**: Gets team composition recommendations
- **Quotes Agent**: Provides project scope for cost estimation
- **Profitability Agent**: Shares project metrics for financial analysis

### With PSA System
- Creates/updates project records in database
- Generates timeline data for Gantt charts
- Provides data for project dashboards
- Triggers notifications for milestone completions

## Real-time Thinking Examples

```
"Analyzing project requirements..."
"Breaking down scope into work packages..."
"Checking resource availability for timeline estimation..."
"Identifying potential scheduling conflicts..."
"Calculating critical path dependencies..."
"Generating risk assessment based on project complexity..."
"Optimizing task sequence for fastest delivery..."
```

## Tool Integration (Strands SDK)

```python
@tool
def project_management_agent(request: str, project_data: dict = None) -> str:
    """
    Handle project management tasks including planning, tracking, and optimization.
    
    Args:
        request: Natural language description of project management need
        project_data: Optional existing project data for updates/analysis
        
    Returns:
        Structured project management response with plans, recommendations, or status
    """
```

## Example Scenarios

### New Project Creation
**Input**: "Create a project plan for a mobile app development project, 3-month timeline, team of 5 developers"
**Process**: Analyze requirements → Create WBS → Estimate timelines → Identify risks → Generate plan
**Output**: Detailed project plan with milestones, tasks, and timeline

### Project Health Check
**Input**: "Analyze the current status of Project ABC and provide recommendations"
**Process**: Review progress → Identify deviations → Assess risks → Generate recommendations
**Output**: Status report with corrective actions and optimization suggestions

### Timeline Acceleration
**Input**: "Client wants to move deadline up by 2 weeks, what are our options?"
**Process**: Analyze current plan → Identify acceleration opportunities → Calculate impacts → Provide options
**Output**: Multiple scenarios with resource/scope trade-offs 