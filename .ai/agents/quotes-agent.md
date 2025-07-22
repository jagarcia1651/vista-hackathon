# Quotes Agent

## Purpose
Specialized agent for generating accurate project quotes, proposals, and cost estimates based on project scope, resource requirements, and market intelligence.

## Core Responsibilities

### Quote Generation
- Create detailed cost breakdowns for project proposals
- Factor in resource costs, overhead, and profit margins
- Generate multiple pricing scenarios (fixed, T&M, value-based)
- Include risk buffers and contingency planning

### Proposal Intelligence
- Analyze RFPs and client requirements
- Suggest competitive positioning strategies
- Recommend proposal structure and messaging
- Identify win probability factors

### Cost Estimation
- Estimate project costs based on historical data
- Calculate resource costs including benefits and overhead
- Factor in technology costs, licenses, and third-party services
- Provide confidence intervals for estimates

## Key Capabilities

### Input Processing
- Project scope and requirements documents
- Client budget constraints and preferences
- Historical project data for benchmarking
- Market rate information and competitive intelligence

### Output Generation
- Detailed cost breakdowns by phase/resource
- Multiple pricing scenarios with pros/cons
- Risk-adjusted estimates with contingencies
- Competitive analysis and positioning recommendations
- Proposal templates with compelling messaging

## Integration Points

### With Other Agents
- **Project Management Agent**: Gets project scope and timeline for costing
- **Resourcing Agent**: Receives resource requirements and rates
- **Profitability Agent**: Validates margin targets and profitability

### With PSA System
- Creates quote records in CRM system
- Generates proposal documents and presentations
- Tracks quote-to-close conversion rates
- Provides data for pricing analytics

## Real-time Thinking Examples

```
"Analyzing project scope and complexity..."
"Calculating resource requirements and costs..."
"Reviewing historical similar projects for benchmarking..."
"Assessing market rates and competitive positioning..."
"Factoring in risk buffers and contingencies..."
"Optimizing pricing strategy for win probability..."
"Generating multiple scenario options..."
```

## Tool Integration (Strands SDK)

```python
@tool
def quotes_agent(request: str, project_scope: dict = None) -> str:
    """
    Generate project quotes, proposals, and cost estimates.
    
    Args:
        request: Natural language description of quote/proposal need
        project_scope: Optional project scope and requirements data
        
    Returns:
        Detailed quote with cost breakdown, scenarios, and recommendations
    """
```

## Example Scenarios

### New Project Quote
**Input**: "Create a quote for a e-commerce website development project, 6-month timeline, includes mobile app"
**Process**: Analyze scope → Estimate resources → Calculate costs → Add margins → Generate scenarios
**Output**: Detailed quote with multiple pricing options and project breakdown

### Competitive Bid Analysis
**Input**: "We're competing against 3 other agencies for this project, budget is $200k"
**Process**: Analyze competitive landscape → Review scope → Optimize pricing → Position value proposition
**Output**: Competitive pricing strategy with value differentiation recommendations

### Quote Optimization
**Input**: "Client says our quote is 20% higher than competitor, what are our options?"
**Process**: Review cost structure → Identify optimization opportunities → Calculate impact → Generate alternatives
**Output**: Multiple scenarios including scope adjustments, timeline changes, and value engineering options

### Profitability Check
**Input**: "Validate the profitability of this $150k project quote"
**Process**: Analyze cost structure → Calculate margins → Assess risks → Compare to targets
**Output**: Profitability analysis with recommendations for margin improvement

## Quote Components

### Standard Quote Structure
- **Executive Summary**: Project overview and value proposition
- **Scope of Work**: Detailed deliverables and phases
- **Timeline**: Project schedule and milestones
- **Team Composition**: Resources and roles
- **Cost Breakdown**: Detailed pricing by phase/resource
- **Terms & Conditions**: Payment terms, change management
- **Next Steps**: Proposal process and decision timeline

### Pricing Models
- **Fixed Price**: Total project cost with defined scope
- **Time & Materials**: Hourly/daily rates with estimated hours
- **Value-Based**: Pricing based on business value delivered
- **Hybrid**: Combination of fixed and variable components 