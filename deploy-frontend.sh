#!/bin/bash

# PSA Agent Frontend Deployment Script for Fly.io

set -e

echo "🚀 Deploying PSA Agent Frontend to Fly.io..."

# Navigate to frontend directory
cd frontend

# Check if app exists, if not create it
if ! fly apps list | grep -q "psa-agent-frontend"; then
    echo "📦 Creating new Fly.io app: psa-agent-frontend"
    fly apps create psa-agent-frontend
else
    echo "✅ App psa-agent-frontend already exists"
fi

# Set build arguments for Next.js environment variables
echo "🔧 Setting build arguments for Next.js..."

# Deploy with build args
echo "🏗️ Building and deploying frontend..."
fly deploy \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

echo "✅ Frontend deployment complete!"
echo "🔗 Your frontend is available at: https://psa-agent-frontend.fly.dev"
echo ""
echo "📋 Next steps:"
echo "1. Set your secrets with: fly secrets set KEY=VALUE -a psa-agent-frontend"
echo "2. Check logs with: fly logs -a psa-agent-frontend"
echo "3. Check status with: fly status -a psa-agent-frontend" 