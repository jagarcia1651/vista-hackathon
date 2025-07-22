"""
Supabase Client Configuration for Backend
"""

import os
from typing import Optional

from dotenv import load_dotenv
from supabase import Client, create_client

# Load environment variables
load_dotenv()


def get_supabase_client() -> Optional[Client]:
    """
    Create and return a Supabase client instance

    Returns:
        Client: Configured Supabase client, or None if configuration is missing
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_key:
        print(
            "Warning: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables"
        )
        return None

    try:
        return create_client(supabase_url, supabase_key)
    except Exception as e:
        print(f"Error creating Supabase client: {str(e)}")
        return None


# Create a global client instance
supabase_client = get_supabase_client()
