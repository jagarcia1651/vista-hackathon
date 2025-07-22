#!/bin/bash

# PSA Agent Complete Deployment Script for Fly.io
# This script deploys both backend and frontend services

set -e

echo "🌟 PSA Agent - Complete Deployment to Fly.io"
echo "=============================================="

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly.io CLI not found. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Please run: fly auth login"
    exit 1
fi

echo "✅ Fly.io CLI detected and authenticated"
echo ""

# Deploy backend first
echo "1️⃣ Deploying Backend Service..."
echo "--------------------------------"
./deploy-backend.sh

echo ""
echo "2️⃣ Deploying Frontend Service..."
echo "---------------------------------"
./deploy-frontend.sh

echo ""
echo "🎉 Complete Deployment Finished!"
echo "================================"
echo ""
echo "🔗 Your services are available at:"
echo "   Backend:  https://psa-agent-backend.fly.dev"
echo "   Frontend: https://psa-agent-frontend.fly.dev"
echo ""
echo "⚙️ Configure your secrets:"
echo "   Backend secrets:"
echo "   fly secrets set AWS_BEARER_TOKEN_BEDROCK=your_key -a psa-agent-backend"
echo "   fly secrets set BEDROCK_MODEL_ID=us.anthropic.claude-3-haiku-20240307-v1:0 -a psa-agent-backend"
echo "   fly secrets set AWS_DEFAULT_REGION=us-east-1 -a psa-agent-backend"
echo ""
echo "   Frontend secrets:"
echo "   fly secrets set NEXT_PUBLIC_API_URL=https://psa-agent-backend.fly.dev -a psa-agent-frontend"
echo ""
echo "📊 Monitor your services:"
echo "   fly logs -a psa-agent-backend"
echo "   fly logs -a psa-agent-frontend" 