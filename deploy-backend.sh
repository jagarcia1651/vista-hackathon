#!/bin/bash

# PSA Agent Backend Deployment Script for Fly.io

set -e

echo "🚀 Deploying PSA Agent Backend to Fly.io..."

# Navigate to backend directory
cd backend

# Check if app exists, if not create it
if ! fly apps list | grep -q "psa-agent-backend"; then
    echo "📦 Creating new Fly.io app: psa-agent-backend"
    fly apps create psa-agent-backend
else
    echo "✅ App psa-agent-backend already exists"
fi

# Deploy the application
echo "🏗️ Building and deploying backend..."
fly deploy

echo "✅ Backend deployment complete!"
echo "🔗 Your backend is available at: https://psa-agent-backend.fly.dev"
echo ""
echo "📋 Next steps:"
echo "1. Set your secrets with: fly secrets set KEY=VALUE -a psa-agent-backend"
echo "2. Check logs with: fly logs -a psa-agent-backend"
echo "3. Check status with: fly status -a psa-agent-backend" 