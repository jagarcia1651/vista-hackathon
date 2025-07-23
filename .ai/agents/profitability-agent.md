# Profitability Agent Requirements

## Overview

The Profitability Agent is a specialized agent that monitors and calculates project profitability in real-time as other agents make changes to projects. It integrates with the orchestrator system to track financial impact across all project-related activities.

## Purpose

-  Calculate and track project profitability across all agent actions
-  Monitor profitability changes in real-time as projects are modified
-  Provide historical profitability analysis and trends
-  Alert stakeholders when profitability thresholds are breached
-  Support financial decision-making with data-driven insights

## Integration with Existing Agents

### Orchestrator Integration

The profitability agent should be triggered by the orchestrator whenever:

-  **Project Management Agent** updates projects, tasks, or timelines
-  **Resource Management Agent** modifies staffing, assignments, or rates
-  **Quotes Agent** creates or updates project quotes and pricing

### Event-Driven Architecture

-  Monitor project changes via event bus integration
-  Calculate profitability immediately after any project-affecting change
-  Store profitability snapshots for historical comparison
-  Provide real-time profitability delta calculations

## Core Functionality

### 1. Profitability Calculation Service (`ProfitabilityService`)

#### Revenue Calculation

-  Extract project revenue from quotes and billing rates
-  Account for fixed-price vs. time-and-materials projects
-  Include change orders and scope modifications
-  Handle multi-phase billing scenarios

#### Cost Calculation

-  Calculate labor costs based on:
   -  Staffer hourly rates and seniority levels
   -  Actual vs. estimated hours worked
   -  Resource allocation and utilization rates
   -  Overtime and premium time costs
-  Include indirect costs:
   -  Project management overhead
   -  Administrative costs
   -  Technology and infrastructure costs

#### Profitability Metrics

-  **Gross Profit**: Revenue - Direct Costs
-  **Gross Profit Margin**: (Gross Profit / Revenue) × 100
-  **Net Profit**: Gross Profit - Indirect Costs
-  **Net Profit Margin**: (Net Profit / Revenue) × 100
-  **Contribution Margin**: Revenue - Variable Costs
-  **ROI**: (Net Profit / Total Investment) × 100

### 2. Real-Time Monitoring

#### Change Detection

-  Monitor database changes via triggers or event listeners
-  Track changes to:
   -  Project scope, timeline, and budget
   -  Task assignments and hour estimates
   -  Staffer rates and assignments
   -  Quote amounts and billing terms

#### Delta Calculations

-  **Since Last Action**: Compare current profitability to previous calculation
-  **Since Agent Activation**: Compare to baseline when agents first engaged
-  **Historical Trends**: Track profitability changes over project lifecycle

### 3. Database Schema Requirements

#### Profitability Snapshots Table

```sql
CREATE TABLE project_profitability_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id),
    baseline_id UUID NULL,

    triggered_by_agent VARCHAR(50), -- 'project_management', 'resource_management', 'quotes'
    triggered_by_action VARCHAR(100), -- specific action that triggered calculation

    total_profitability DECIMAL(12,2),

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. SQL Calculation Scripts

#### Core Profitability Query

```sql
-- Calculate real-time project profitability
SELECT
  SUM((staffer_billable - staffer_cost)::numeric)::money AS total_profitability
FROM (
  SELECT
    staffer_rates.staffer_id,
    (staffer_rates.bill_rate * SUM(project_tasks.estimated_hours)) AS staffer_billable,
    (staffer_rates.cost_rate * SUM(project_tasks.estimated_hours)) AS staffer_cost
  FROM staffer_rates
  LEFT JOIN staffer_assignments
    ON staffer_assignments.staffer_id = staffer_rates.staffer_id
  LEFT JOIN project_tasks
    ON project_tasks.project_task_id = staffer_assignments.project_task_id
  GROUP BY staffer_rates.staffer_id, staffer_rates.bill_rate, staffer_rates.cost_rate
) AS sub;
```

## Agent Tools and Capabilities

### Core Tools

```python
@tool
def calculate_project_profitability(project_id: str, trigger_agent: str, trigger_action: str) -> Dict[str, Any]

@tool
def get_profitability_trends(project_id: str, time_period: str = "30_days") -> Dict[str, Any]

@tool
def compare_profitability_delta(project_id: str, comparison_type: str = "last_action") -> Dict[str, Any]

@tool
def get_profitability_alerts(threshold_type: str = "margin_drop") -> Dict[str, Any]

@tool
def analyze_profitability_drivers(project_id: str) -> Dict[str, Any]
```

### Integration Tools

```python
@tool
def update_profitability_on_project_change(project_id: str, changed_fields: List[str]) -> Dict[str, Any]

@tool
def update_profitability_on_resource_change(assignment_id: str, change_type: str) -> Dict[str, Any]

```

## Event Integration

### Event Listeners

-  **Project Events**: Status changes, timeline updates, scope modifications
-  **Task Events**: Hour estimates, completion status, assignment changes
-  **Resource Events**: Staffing changes, rate updates, time tracking
-  **Quote Events**: Amount changes, billing modifications, approvals

### Event Processing Flow

1. Agent action triggers database change
2. Event bus publishes change notification
3. Profitability agent receives event
4. Agent calculates new profitability metrics
5. Agent stores snapshot with delta information
6. Agent checks for alert thresholds
7. Agent publishes profitability change event

## Reporting and Analytics

### Real-Time Dashboards

-  Current project profitability overview
-  Profitability trend charts
-  Agent action impact visualization
-  Alert status and threshold monitoring

### Historical Analysis

-  Profitability trajectory over project lifecycle
-  Impact analysis of specific agent actions
-  Comparative analysis across similar projects
-  ROI tracking and forecasting

### Alert System

-  Margin drop below threshold (e.g., < 20%)
-  Cost overrun warnings (e.g., > 110% of estimate)
-  Revenue risk alerts (e.g., scope creep without billing adjustment)
-  Profitability improvement opportunities

## Performance Requirements

### Calculation Speed

-  Real-time profitability calculation within 2 seconds
-  Historical analysis queries within 5 seconds
-  Batch calculations for multiple projects within 30 seconds

### Data Accuracy

-  99.9% accuracy in financial calculations
-  Real-time synchronization with project data
-  Audit trail for all profitability changes

### Scalability

-  Support 1000+ concurrent project calculations
-  Handle 10,000+ profitability snapshots per day
-  Maintain performance with 5+ years of historical data

## Implementation Phases

### Phase 1: Core Service

-  Implement ProfitabilityService with basic calculations
-  Create database schema and initial queries
-  Build fundamental profitability calculation tools

### Phase 2: Event Integration

-  Integrate with existing agent event system
-  Implement real-time change monitoring
-  Add delta calculation capabilities

### Phase 3: Advanced Analytics

-  Build trend analysis and forecasting
-  Implement alert system and thresholds
-  Create profitability impact attribution

### Phase 4: Optimization

-  Performance tuning and caching
-  Advanced reporting and dashboards
-  Machine learning for profitability predictions

## Success Metrics

### Business Impact

-  25% improvement in project profitability visibility
-  15% reduction in unprofitable project outcomes
-  30% faster financial decision-making cycles
-  90% reduction in manual profitability calculations

### Technical Performance

-  <2 second profitability calculation response time
-  99.9% system uptime and availability
-  Zero data accuracy issues in financial calculations
-  100% event processing without data loss
