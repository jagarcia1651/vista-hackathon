# PSA Agent - Professional Service Automation

A full-stack application for professional service automation built with Next.js, FastAPI, and Supabase.

## 🚀 Features

- **Complete Authentication System** with Supabase
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
- **Uvicorn** ASGI server
- **Poetry** for dependency management

## 📋 Prerequisites

- Node.js 18+ 
- Python 3.11+
- Docker and Docker Compose
- Supabase account

## 🔧 Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Keys > anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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

   # Terminal 2 - Backend  
   cd backend
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
│   │   └── lib/            # Utilities and Supabase client
│   ├── public/             # Static assets
│   └── package.json        # Dependencies
├── backend/                # FastAPI backend
│   ├── app/               # Python application
│   └── pyproject.toml     # Python dependencies
└── docker-compose.yml     # Container orchestration
```

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