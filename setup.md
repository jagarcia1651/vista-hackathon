# Quick Setup Guide

## 🚀 Get Started in 3 Steps

### 1. Environment Setup
```bash
cd frontend
cp env.example .env.local
```
Then edit `.env.local` with your Supabase credentials.

### 2. Get Supabase Credentials
1. Go to [supabase.com](https://supabase.com) and create a project
2. In your project dashboard, go to Settings > API
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Run the Application

**Option A: Docker (Recommended)**
```bash
docker-compose up --build
```

**Option B: Local Development**
```bash
# Terminal 1 - Frontend
cd frontend
npm install
npm run dev

# Terminal 2 - Backend
cd backend
pip install poetry
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🎯 Test the Authentication Flow

1. Visit http://localhost:3000
2. Click "Get started" to sign up
3. Create an account with your email
4. Check your email for verification
5. Sign in and access the dashboard

## 🐛 Troubleshooting

**Docker Issues:**
- If you see permission errors, try: `docker-compose down && docker-compose up --build`
- On Windows, make sure Docker Desktop is running

**Build Issues:**
- Clear cache: Delete `.next` folder and restart
- Check environment variables are properly set

**Auth Issues:**
- Verify Supabase credentials in `.env.local`
- Check email for verification link
- Ensure Supabase project has email auth enabled 