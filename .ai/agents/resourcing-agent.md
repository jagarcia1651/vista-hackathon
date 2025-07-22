# Resourcing Agent

## Purpose
Specialized agent for optimizing human resource allocation, capacity planning, and team composition across projects within the PSA system.

## Core Responsibilities

### Resource Allocation
- Assign optimal team members to projects based on skills and availability
- Balance workloads across the organization
- Identify resource conflicts and suggest resolutions
- Optimize utilization rates while preventing burnout

### Capacity Planning
- Forecast resource needs for upcoming projects
- Identify when to hire contractors or new employees
- Plan for seasonal demand fluctuations
- Suggest training needs to fill skill gaps

### Team Optimization
- Recommend ideal team compositions for project types
- Identify high-performing team combinations
- Suggest mentoring pairings for skill development
- Balance junior/senior resource ratios

## Key Capabilities

### Input Processing
- Project resource requirements and skill needs
- Employee profiles, skills, and availability
- Current project assignments and workloads
- Performance metrics and utilization rates

### Output Generation
- Optimal resource allocation recommendations
- Team composition suggestions with reasoning
- Capacity reports and utilization forecasts
- Resource conflict resolution strategies
- Hiring and training recommendations

## Integration Points

### With Other Agents
- **Project Management Agent**: Receives resource requirements from project plans
- **Quotes Agent**: Provides resource cost estimates for proposals
- **Profitability Agent**: Shares utilization data for financial analysis

### With PSA System
- Updates resource assignments in project database
- Generates capacity planning reports
- Provides data for resource utilization dashboards
- Triggers notifications for resource conflicts

## Real-time Thinking Examples

```
"Analyzing skill requirements for new project..."
"Checking current team availability and utilization..."
"Identifying potential resource conflicts in Q2..."
"Calculating optimal team composition based on project complexity..."
"Evaluating skill gaps and training needs..."
"Balancing workloads to prevent team burnout..."
"Finding best mentor-mentee pairings for skill development..."
```

## Tool Integration (Strands SDK)

```python
@tool
def resourcing_agent(request: str, resource_data: dict = None) -> str:
    """
    Handle resource allocation, capacity planning, and team optimization tasks.
    
    Args:
        request: Natural language description of resourcing need
        resource_data: Optional current resource allocation data
        
    Returns:
        Resource allocation recommendations and capacity planning insights
    """
```

## Example Scenarios

### New Project Staffing
**Input**: "I need a team for a React/Node.js project starting next month, 4-month duration"
**Process**: Analyze skill requirements → Check availability → Consider team dynamics → Generate recommendations
**Output**: Recommended team with specific individuals, roles, and allocation percentages

### Resource Conflict Resolution
**Input**: "We have 3 projects starting the same week and they all want Sarah as lead developer"
**Process**: Analyze project priorities → Evaluate alternative resources → Calculate impact scenarios → Suggest solutions
**Output**: Multiple resolution options with trade-offs and alternative resource suggestions

### Capacity Planning
**Input**: "What will our resource capacity look like for Q3 based on current pipeline?"
**Process**: Analyze pipeline → Calculate resource needs → Compare to availability → Identify gaps
**Output**: Capacity forecast with hiring recommendations and potential bottlenecks

### Team Optimization
**Input**: "Our mobile development team keeps missing deadlines, how can we improve?"
**Process**: Analyze team composition → Review performance metrics → Identify skill gaps → Suggest improvements
**Output**: Team restructuring recommendations with skill development plans 