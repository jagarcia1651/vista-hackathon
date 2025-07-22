# Shared PSA Domain Models

This directory contains the centralized domain models for the PSA Agent application, ensuring consistency between the Next.js frontend and Python agent backend.

## Structure

```
shared/schemas/
├── typescript/               # TypeScript type definitions
│   ├── base.ts              # Base types and enums
│   ├── address.ts           # Address entity
│   ├── agent.ts             # Agent entities and sessions
│   ├── client.ts            # Client entities
│   ├── holiday.ts           # Holiday entities
│   ├── project.ts           # Project entities
│   ├── quote.ts             # Quote entities
│   ├── staffer.ts           # Staffer/resource entities
│   ├── agents/              # Agent-specific request/response types
│   │   ├── project-management.ts
│   │   ├── resourcing.ts
│   │   └── quotes.ts
│   └── index.ts             # Main TypeScript exports
├── python/                  # Python Pydantic models
│   ├── base.py              # Base models and enums
│   ├── address.py           # Address models
│   ├── agent.py             # Agent models and sessions
│   ├── client.py            # Client models
│   └── __init__.py          # Main Python exports
└── validation/              # Schema validation utilities (future)
    ├── typescript.ts        # TS validation functions
    └── python.py            # Python validation functions
```

## Core Domain Entities

### Resource Management
- **Staffers**: Team members with skills, rates, and availability
- **Skills**: Available competencies and certifications
- **Seniorities**: Experience levels and hierarchy

### Project Management
- **Projects**: Main project entities with phases and tasks
- **Project Phases**: Project breakdown structure
- **Project Tasks**: Individual work items with assignments

### Client Management
- **Clients**: Client organizations and contacts
- **Client Artifacts**: Branding and styling assets

### Commercial
- **Quotes**: Pricing proposals and versions

### Infrastructure
- **Agents**: AI agent registry and configuration
- **Addresses**: Shared address data

## Usage

### TypeScript (Next.js)
```typescript
import { Project, Staffer, ProjectTask, ProjectStatus } from '@/shared/schemas/typescript'
// Or import specific entities
import { Project } from '@/shared/schemas/typescript/project'
import { CreateProjectRequest } from '@/shared/schemas/typescript/agents/project-management'
```

### Python (Agent Backend)
```python
from shared.schemas.python import Project, Staffer, ProjectTask, ProjectStatus
# Or import specific models
from shared.schemas.python.project import Project
from shared.schemas.python.agent import AgentRequest, AgentResponse
```

## File Organization Benefits

- **Easier Navigation**: Each entity in its own file
- **Reduced Conflicts**: Minimizes merge conflicts during development
- **Clear Dependencies**: Import relationships are explicit
- **Maintainability**: Changes to one entity don't affect others
- **Agent-Specific Types**: Organized by agent domain

## Schema Consistency

All types are derived from the Supabase public schema and should remain synchronized:
- TypeScript interfaces match database structure
- Python Pydantic models provide validation
- Enums are consistent across both languages
- Agent request/response types are strongly typed

## Single Tenant Mode

This implementation assumes single-tenant operation. All firm_id references are simplified away for this iteration.

## Agent Types Organization

Agent-specific types are organized by agent domain:
- **Project Management Agent**: Project creation, planning, analysis
- **Resourcing Agent**: Resource allocation, capacity planning  
- **Quotes Agent**: Quote generation, optimization, analysis

Each agent has strongly-typed request/response interfaces that reference the core domain entities. 