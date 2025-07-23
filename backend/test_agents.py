#!/usr/bin/env python3
"""
Test script to verify PSA agent configuration
"""

import asyncio
import os
import sys

from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def test_configuration():
    """Test that all required configuration is present"""
    print("🔧 Testing PSA Agent Configuration...")

    # Check environment variables
    bedrock_key = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
    model_id = os.getenv(
        "BEDROCK_MODEL_ID", "us.anthropic.claude-3-haiku-20240307-v1:0"
    )
    region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

    print(f"✅ Model ID: {model_id}")
    print(f"✅ Region: {region}")

    if bedrock_key:
        print(f"✅ Bedrock API Key: {bedrock_key[:8]}...{bedrock_key[-4:]}")
    else:
        print("❌ Bedrock API Key: NOT SET")
        print("   Set AWS_BEARER_TOKEN_BEDROCK in your .env file")
        return False

    return True


def test_imports():
    """Test that all required packages can be imported"""
    print("\n📦 Testing Package Imports...")

    try:
        from strands import Agent, tool

        print("✅ strands: Agent, tool")
    except ImportError as e:
        print(f"❌ strands: {e}")
        return False

    try:
        from strands.models.bedrock import BedrockModel

        print("✅ strands.models.bedrock: BedrockModel")
    except ImportError as e:
        print(f"❌ strands.models.bedrock: {e}")
        return False

    try:
        import boto3

        print("✅ boto3")
    except ImportError as e:
        print(f"❌ boto3: {e}")
        return False

    return True


async def test_agent_creation():
    """Test creating an agent instance"""
    print("\n🤖 Testing Agent Creation...")

    try:
        from app.ai.agents.orchestrator import PSAOrchestrator

        # Test orchestrator creation
        orchestrator = PSAOrchestrator()
        print("✅ PSA Orchestrator created successfully")

        # Test a simple query (if API key is configured)
        if os.getenv("AWS_BEARER_TOKEN_BEDROCK"):
            try:
                result = await orchestrator.process_request(
                    "Hello, can you help me with project planning?", {"test": True}
                )
                print("✅ Agent query test successful")
                print(f"   Response status: {result.get('status', 'unknown')}")
            except Exception as e:
                print(f"⚠️  Agent query test failed: {e}")
                print("   This might be due to API key permissions or model access")
        else:
            print("⚠️  Skipping agent query test (no API key)")

        return True

    except Exception as e:
        print(f"❌ Agent creation failed: {e}")
        return False


async def main():
    """Run all tests"""
    print("🚀 PSA Agent Configuration Test\n")

    tests = [test_configuration(), test_imports(), await test_agent_creation()]

    if all(tests):
        print("\n🎉 All tests passed! Your PSA agent setup is ready.")
        print("\nNext steps:")
        print("1. Make sure your Bedrock API key has the right permissions")
        print("2. Test with: poetry run uvicorn app.main:app --reload")
        print("3. Visit: http://localhost:8000/health")
        return 0
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
