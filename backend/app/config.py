"""
Configuration for PSA Agent Backend
"""

import os
from typing import Optional

from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class AgentConfig:
    """Configuration for Strands Agents with AWS Bedrock API Key"""

    # AWS Bedrock API Key Configuration
    BEDROCK_API_KEY: Optional[str] = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
    AWS_DEFAULT_REGION: str = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

    # Bedrock Model Configuration
    BEDROCK_MODEL_ID: str = os.getenv(
        "BEDROCK_MODEL_ID", "us.anthropic.claude-3-haiku-20240307-v1:0"
    )
    TEMPERATURE: float = float(os.getenv("AGENT_TEMPERATURE", "0.1"))
    MAX_TOKENS: int = int(os.getenv("AGENT_MAX_TOKENS", "2000"))

    # Optional Bedrock Guardrails
    GUARDRAIL_ID: Optional[str] = os.getenv("GUARDRAIL_ID")
    GUARDRAIL_VERSION: Optional[str] = os.getenv("GUARDRAIL_VERSION")

    # Agent Behavior Settings
    ENABLE_MEMORY: bool = os.getenv("ENABLE_AGENT_MEMORY", "true").lower() == "true"
    ENABLE_LOGGING: bool = os.getenv("ENABLE_AGENT_LOGGING", "true").lower() == "true"

    # PSA Domain Configuration
    DEFAULT_PROJECT_PHASES: list = [
        "Discovery & Planning",
        "Design & Architecture",
        "Development & Implementation",
        "Testing & Quality Assurance",
        "Deployment & Launch",
        "Support & Optimization",
    ]

    DEFAULT_SKILL_CATEGORIES: list = [
        "Project Management",
        "Business Analysis",
        "Software Development",
        "Data Analysis",
        "UI/UX Design",
        "Quality Assurance",
        "DevOps",
        "Consulting",
    ]

    # Rate and Pricing Defaults
    DEFAULT_HOURLY_RATES: dict = {
        "Junior": 75,
        "Mid": 125,
        "Senior": 175,
        "Principal": 225,
        "Director": 275,
    }

    # Available Bedrock Models for PSA use cases
    AVAILABLE_MODELS: dict = {
        "claude-3-haiku": "us.anthropic.claude-3-haiku-20240307-v1:0",
        "claude-3-sonnet": "us.anthropic.claude-3-sonnet-20240229-v1:0",
        "claude-3-opus": "us.anthropic.claude-3-opus-20240229-v1:0",
        "nova-micro": "us.amazon.nova-micro-v1:0",
        "nova-lite": "us.amazon.nova-lite-v1:0",
        "nova-pro": "us.amazon.nova-pro-v1:0",
    }

    @classmethod
    def validate_config(cls) -> bool:
        """Validate that required Bedrock API key configuration is present"""
        if not cls.BEDROCK_API_KEY:
            print("Warning: AWS_BEARER_TOKEN_BEDROCK not set.")
            print("Agent functionality requires a Bedrock API key from AWS console.")
            print(
                "Generate one at: https://console.aws.amazon.com/bedrock/home?region=us-east-1#/api-keys"
            )
            return False
        return True


class DatabaseConfig:
    """Database configuration (for future use)"""

    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_KEY")


class AppConfig:
    """General application configuration"""

    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS settings
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(
        ","
    )

    # API Settings
    API_V1_PREFIX: str = "/api/v1"


# Initialize configuration
agent_config = AgentConfig()
db_config = DatabaseConfig()
app_config = AppConfig()

# Validate configuration on import
agent_config.validate_config()
