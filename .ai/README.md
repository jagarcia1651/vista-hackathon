# PSA Application Architecture

## Overview
Professional Service Automation (PSA) application built with Next.js frontend, Strands SDK agents backend, and Supabase for auth/persistence.

## Core Architectural Principles

### 1. Vertical Slices Architecture
- Each feature is implemented as a complete vertical slice
- Slightly violates DRY to prevent collaboration collisions
- Each slice contains its own components, API routes, database schemas, and agents
- Enables parallel development without merge conflicts

### 2. Centralized Style Guide
- Single design system/style guide
- Developers only use utility classes, no custom styling
- Consistent UI/UX across all slices

### 3. Real-time Thinking Logs
- Agents stream their thinking process to UI
- Built with Supabase real-time channels
- Users see live AI decision-making process

## Technology Stack

### Frontend Runtime (Next.js Application)
- **Next.js** - Primary web application framework
- **Supabase Auth** - Authentication
- **Supabase Real-time** - Live thinking logs and updates
- **Centralized Style Guide** - Tailwind + custom design system
- **Next.js API Routes** - Proxy/gateway to Python agent runtime

### Backend Runtime (Python Agent Application)  
- **Python** - Standalone agent runtime
- **Strands SDK** - Agents-as-tools pattern implementation
- **FastAPI/Flask** - HTTP API server for agent endpoints
- **Supabase Client** - Database and real-time event publishing
- **Agent Orchestrator** - Central coordination service

## Agent Architecture

### Planned Agents (5 total)
1. **Project Management Agent** ⭐ *Phase 1*
2. **Resourcing Agent** ⭐ *Phase 1*  
3. **Quotes Agent** ⭐ *Phase 1*
4. **Brand Marketing Agent** *Phase 2*
5. **Profitability Agent** *Phase 2*

### Phase 1 Implementation Focus
Starting with 3 core agents that form the foundation of PSA workflows:
- Project Management Agent
- Resourcing Agent  
- Quotes Agent

### Agents-as-Tools Pattern
```
User Request → Orchestrator Agent → Specialized Tool Agents → Response
```

Each agent is wrapped as a tool using Strands SDK's `@tool` decorator, allowing the orchestrator to delegate specific PSA tasks to the most appropriate specialist.

## Vertical Slice Structure

Each feature slice will contain:
```
/features/[slice-name]/
  /components/          # React components for this slice
  /api/                 # Next.js API routes
  /agents/              # Strands SDK agent implementations
  /types/               # TypeScript types
  /hooks/               # React hooks
  /utils/               # Utility functions
  /database/            # Supabase schema/migrations
```

## Development Approach

### No Multi-tenancy (Demo Scope)
- Single organization/tenant for demo purposes
- Simplifies data model and authentication

### No External Integrations (Initial Scope)
- Self-contained PSA system
- Focus on core agent intelligence and workflows

### Real-time Event Requirements
- Thinking logs from agents
- Project status updates
- Resource allocation changes
- Quote status changes

## Next Steps
1. Define detailed agent specifications
2. Design centralized style guide
3. Create vertical slice templates
4. Implement Phase 1 agents 