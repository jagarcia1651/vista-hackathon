# PSA Agent - Fly.io Deployment Guide

## 🚀 Quick Start

### Prerequisites
1. **Fly.io CLI installed** - Restart your terminal after installation
2. **Fly.io account** - Create one at [fly.io](https://fly.io)
3. **AWS Bedrock API Key** - Get from AWS Console
4. **Supabase credentials** - From your Supabase project

### 1. Authenticate with Fly.io

```bash
fly auth login
```

### 2. Deploy Both Services

```bash
# Make scripts executable (Unix/Mac)
chmod +x deploy-all.sh deploy-backend.sh deploy-frontend.sh

# Deploy everything
./deploy-all.sh
```

**For Windows users:**
```bash
# Deploy backend
cd backend && fly launch && fly deploy

# Deploy frontend 
cd ../frontend && fly launch && fly deploy
```

## 🔐 Secrets Configuration

### Backend Secrets (Required)

```bash
# AWS Bedrock Configuration
fly secrets set AWS_BEARER_TOKEN_BEDROCK="your_bedrock_api_key" -a psa-agent-backend
fly secrets set BEDROCK_MODEL_ID="us.anthropic.claude-3-haiku-20240307-v1:0" -a psa-agent-backend
fly secrets set AWS_DEFAULT_REGION="us-east-1" -a psa-agent-backend

# Agent Configuration
fly secrets set AGENT_TEMPERATURE="0.1" -a psa-agent-backend
fly secrets set AGENT_MAX_TOKENS="2000" -a psa-agent-backend
fly secrets set ENABLE_AGENT_MEMORY="true" -a psa-agent-backend
fly secrets set ENABLE_AGENT_LOGGING="true" -a psa-agent-backend

# CORS Configuration
fly secrets set ALLOWED_ORIGINS="https://psa-agent-frontend.fly.dev" -a psa-agent-backend
```

### Frontend Secrets (Required)

```bash
# Supabase Configuration
fly secrets set NEXT_PUBLIC_SUPABASE_URL="your_supabase_url" -a psa-agent-frontend
fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key" -a psa-agent-frontend

# Backend API URL
fly secrets set NEXT_PUBLIC_API_URL="https://psa-agent-backend.fly.dev" -a psa-agent-frontend
```

### 🔑 Getting Your Credentials

#### AWS Bedrock API Key
1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/home?region=us-east-1#/api-keys/long-term/create)
2. Create a long-term API key
3. Copy the key (starts with "ABSK...")

#### Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📊 Monitoring & Management

### Check Deployment Status
```bash
# Check app status
fly status -a psa-agent-backend
fly status -a psa-agent-frontend

# View logs
fly logs -a psa-agent-backend
fly logs -a psa-agent-frontend

# Follow live logs
fly logs -f -a psa-agent-backend
```

### App URLs
- **Backend API**: https://psa-agent-backend.fly.dev
- **Frontend App**: https://psa-agent-frontend.fly.dev
- **API Docs**: https://psa-agent-backend.fly.dev/docs

### Scale Your Apps
```bash
# Scale backend for higher load
fly scale count 2 -a psa-agent-backend
fly scale memory 1024 -a psa-agent-backend

# Scale frontend
fly scale count 2 -a psa-agent-frontend
```

## 🔧 Troubleshooting

### Common Issues

**1. "fly: command not found"**
- Restart your terminal after installing Fly CLI
- Check PATH with `echo $PATH`

**2. Build failures**
- Check Docker is working: `docker --version`
- Verify secrets are set: `fly secrets list -a app-name`

**3. Authentication errors**
- Verify API keys are correct
- Check AWS region matches your Bedrock setup

**4. CORS errors**
- Ensure `ALLOWED_ORIGINS` includes your frontend URL
- Update `NEXT_PUBLIC_API_URL` to point to backend

### Debug Commands
```bash
# SSH into your app
fly ssh console -a psa-agent-backend

# Check environment variables
fly ssh console -a psa-agent-backend -C "env | grep AWS"

# Restart app
fly apps restart psa-agent-backend
```

## 💰 Cost Management

### Fly.io Free Tier
- 3 shared-cpu-1x VMs (256MB RAM)
- 3GB persistent storage
- $5 monthly credit for new users

### Monitor Usage
```bash
# Check billing
fly billing

# Set spending limits
fly billing set-limit 10  # $10 limit
```

## 🔄 Updates & Redeployment

### Update Backend
```bash
cd backend
fly deploy -a psa-agent-backend
```

### Update Frontend
```bash
cd frontend
fly deploy -a psa-agent-frontend
```

### Update Secrets
```bash
# Update a secret
fly secrets set KEY=new_value -a app-name

# Import from .env file
fly secrets import < .env -a app-name
```

## 🌐 Custom Domains (Optional)

```bash
# Add custom domain
fly certs create yourdomain.com -a psa-agent-frontend

# Check certificate status
fly certs list -a psa-agent-frontend
```

## 📋 Deployment Checklist

- [ ] Fly.io CLI installed and authenticated
- [ ] AWS Bedrock API key obtained
- [ ] Supabase project configured
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] All secrets configured
- [ ] Health checks passing
- [ ] API accessible from frontend
- [ ] Authentication flow working

## 🆘 Support

- **Fly.io Docs**: https://fly.io/docs/
- **Fly.io Community**: https://community.fly.io/
- **Project Issues**: Create an issue in your repository

---

**Happy Deploying! 🚀** 