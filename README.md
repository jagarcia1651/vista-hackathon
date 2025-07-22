# PSA Agent - Professional Service Automation

A full-stack application for professional service automation built with Next.js, FastAPI, and Supabase.

## 🚀 Features

- **Complete Authentication System** with Supabase
- **Multi-Agent AI System** with Strands orchestration
- **Specialized AI Agents** for project management, resourcing, and quotes
- **Intelligent Workflow Automation** across PSA domains
- **Responsive Design** following PSA design system
- **Route Protection** with middleware
- **Professional Landing Page** 
- **Dashboard Interface** for authenticated users
- **Modern Tech Stack** with Next.js 15 and React 19

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Supabase** for authentication
- **Custom Design System** components

### Backend
- **FastAPI** with Python 3.11
- **Strands Agents** for multi-agent orchestration
- **AWS Bedrock** for LLM model access via API key
- **Uvicorn** ASGI server
- **Poetry** for dependency management

### Agent Architecture
- **Multi-Agent System** using Strands "agents as tools" pattern
- **AWS Bedrock Integration** using API key authentication
- **Specialized Agents** for Project Management, Resourcing, and Quotes
- **Orchestrator Agent** for coordinating cross-domain workflows
- **Shared Domain Models** for type safety across frontend and backend

## 📋 Prerequisites

- Node.js 18+ 
- Python 3.11+
- Docker and Docker Compose
- Supabase account

## 🔧 Environment Variables

### Frontend Configuration

Create a `.env.local` file in the `frontend` directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend Agent Configuration

Create a `.env` file in the `backend` directory with the following variables:

```bash
# PSA Agent Backend Configuration

# =============================================================================
# AWS BEDROCK API KEY CONFIGURATION (REQUIRED)
# =============================================================================

# Bedrock API Key (Bearer Token) - Generate from AWS Console
# Go to: https://console.aws.amazon.com/bedrock/home?region=us-east-1#/api-keys/long-term/create
# Copy the generated API key starting with "ABSK0nVkcm0ja0..."
AWS_BEARER_TOKEN_BEDROCK=your_bedrock_api_key_here

# AWS Region where your Bedrock API key was generated
AWS_DEFAULT_REGION=us-east-1

# =============================================================================
# BEDROCK MODEL CONFIGURATION
# =============================================================================

# Bedrock Model ID - choose from available models:
# Claude 3: us.anthropic.claude-3-haiku-20240307-v1:0 (default, cost-effective)
#          us.anthropic.claude-3-sonnet-20240229-v1:0 (balanced)
#          us.anthropic.claude-3-opus-20240229-v1:0 (most capable)
# Nova: us.amazon.nova-micro-v1:0 (fastest, cheapest)
#       us.amazon.nova-lite-v1:0 (balanced)
#       us.amazon.nova-pro-v1:0 (most capable)
BEDROCK_MODEL_ID=us.anthropic.claude-3-haiku-20240307-v1:0

# Temperature for agent responses (0.0-1.0, lower = more deterministic)
AGENT_TEMPERATURE=0.1

# Maximum tokens for agent responses
AGENT_MAX_TOKENS=2000

# =============================================================================
# BEDROCK GUARDRAILS (OPTIONAL)
# =============================================================================

# Optional: Add Bedrock Guardrails for content filtering
# GUARDRAIL_ID=your_guardrail_id
# GUARDRAIL_VERSION=1

# =============================================================================
# AGENT BEHAVIOR SETTINGS
# =============================================================================

# Enable agent memory across conversations
ENABLE_AGENT_MEMORY=true

# Enable detailed agent logging
ENABLE_AGENT_LOGGING=true

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================

# Debug mode
DEBUG=false

# Server host and port
HOST=0.0.0.0
PORT=8000

# CORS allowed origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# =============================================================================
# DATABASE CONFIGURATION (OPTIONAL)
# =============================================================================

# Database URL for persistent storage
DATABASE_URL=postgresql://user:password@localhost:5432/psa_agents

# Supabase configuration (if using Supabase)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# =============================================================================
# EXAMPLE SETUP INSTRUCTIONS
# =============================================================================

# 1. Copy this content to a .env file: cp .env.example .env
# 2. Generate a Bedrock API key from AWS Console (link above)
# 3. Replace "your_bedrock_api_key_here" with your actual API key
# 4. Choose your preferred model and region
# 5. Run the application: poetry run uvicorn app.main:app --reload
```

### Getting Required Credentials

#### Supabase Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Keys > anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### AWS Bedrock API Key Setup
1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/home?region=us-east-1#/api-keys/long-term/create)
2. Generate a long-term API key for Bedrock
3. Copy the generated API key (starts with "ABSK...") → `AWS_BEARER_TOKEN_BEDROCK`
4. Set your region → `AWS_DEFAULT_REGION`

**Note**: The Bedrock API key provides access to AWS Bedrock models without requiring AWS credentials. Make sure to keep this key secure and don't commit it to version control.

## 🚀 Getting Started

### Option 1: Docker Development (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vista-hackathon
   ```

2. **Set up environment variables**
   ```bash
   cd frontend
   cp .env.example .env.local  # Create and configure your .env.local
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Agent Endpoints: http://localhost:8000/api/v1/agent/*

### Option 2: Local Development

1. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   pip install poetry
   poetry install
   ```

3. **Start development servers**
   ```bash
   # Terminal 1 - Frontend
   cd frontend
   npm run dev

   # Terminal 2 - Backend (make sure to set up .env file first)
   cd backend
   cp .env.example .env  # Configure with your Bedrock API key
   poetry install
   poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## 🎯 Authentication Flow

### User Journey
1. **Landing Page** - Unauthenticated users see marketing page with sign-up CTA
2. **Sign Up** - Users create account with email/password
3. **Email Verification** - Supabase sends confirmation email
4. **Sign In** - Users authenticate with credentials
5. **Dashboard** - Authenticated users access protected dashboard
6. **Sign Out** - Users can sign out and return to sign-in page

### Route Protection
- ✅ **Public Routes**: `/`, `/signin`, `/signup`
- 🔒 **Protected Routes**: `/dashboard/*`
- 🚫 **Auth Page Access**: Authenticated users redirected from sign-in/sign-up to dashboard
- 🚫 **Dashboard Access**: Unauthenticated users redirected to sign-in

## 🎨 Design System

The application follows a centralized PSA design system with:

- **Professional Color Palette** (Blues, Grays, Status Colors)
- **Consistent Typography** scale and hierarchy
- **Reusable Components** (Cards, Buttons, Inputs, Forms)
- **Responsive Design** patterns
- **Zero Custom CSS** requirement for developers

### Key Components
- `Button` - Primary, secondary, outline, ghost variants
- `Input` - Form inputs with validation states
- `Card` - Content containers with headers/footers
- `Navigation` - Responsive nav with auth controls

## 📁 Project Structure

```
vista-hackathon/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Design system components
│   │   │   ├── auth/        # Authentication forms
│   │   │   └── layout/      # Layout components
│   │   ├── contexts/        # React contexts (Auth)
│   │   └── utils/           # Utilities and Supabase client
│   ├── public/             # Static assets
│   └── package.json        # Dependencies
├── backend/                # FastAPI backend with Strands Agents
│   ├── app/
│   │   ├── agents/         # Multi-agent system
│   │   │   ├── orchestrator.py      # Main orchestrator agent
│   │   │   ├── project_management.py # Project planning agent
│   │   │   ├── resourcing.py        # Resource allocation agent
│   │   │   └── quotes.py            # Quote generation agent
│   │   ├── config.py       # Agent configuration
│   │   └── main.py         # FastAPI application with agent endpoints
│   ├── .env.example        # Environment variables template
│   └── pyproject.toml      # Python dependencies
├── shared/                 # Shared type definitions
│   └── schemas/            # TypeScript & Python domain models
│       ├── typescript/     # Frontend types
│       └── python/         # Backend Pydantic models
└── docker-compose.yml      # Container orchestration
```

## 🤖 Agent Architecture

The backend implements a **Strands "agents as tools"** multi-agent architecture:

### Specialized Agents
- **Project Management Agent**: Planning, timeline estimation, risk assessment
- **Resourcing Agent**: Resource allocation, capacity planning, skill matching  
- **Quotes Agent**: Pricing strategies, cost estimation, competitive analysis

### Orchestrator Pattern
- **PSA Orchestrator**: Coordinates multiple agents for complex workflows
- **Cross-domain Intelligence**: Handles scenarios requiring multiple agents
- **Unified API**: Single endpoints that leverage multiple specialized agents

### Available Endpoints
- `POST /api/v1/agent/query` - General agent query (orchestrator determines agents)
- `POST /api/v1/agent/project-plan` - Integrated project planning with resources
- `POST /api/v1/agent/quote` - Comprehensive quote generation  
- `POST /api/v1/agent/capacity-analysis` - Portfolio capacity analysis
- `GET /api/v1/config/agents` - Agent configuration and status

## 🔐 Security Features

- **JWT Token Management** via Supabase
- **Secure Cookie Storage** for session persistence
- **Route-level Protection** with Next.js middleware
- **CORS Configuration** for API security
- **Environment Variable Protection** for sensitive data

## 🚀 Deployment

The application is containerized and ready for deployment on:

- **Vercel** (Frontend)
- **Railway/Heroku** (Backend)
- **Docker** environments
- **Kubernetes** clusters

## 📝 Development Notes

- Uses **Supabase Auth** instead of custom authentication
- Follows **PSA Design System** requirements
- Implements **proper TypeScript** usage throughout
- Uses **modern React patterns** (hooks, context, server components)
- Configured for **hot reloading** in development

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Use the PSA design system components
3. Add TypeScript types for new features
4. Test authentication flows thoroughly
5. Update documentation for new features

## 📄 License

This project is part of the Vista Hackathon. 