from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="PSA Agent Backend",
    description="Professional Service Automation Agent Backend API",
    version="0.1.0",
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "psa-agent-backend"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "PSA Agent Backend API", "version": "0.1.0"}
