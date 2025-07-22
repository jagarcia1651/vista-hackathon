"""
Address Entity Models
"""

from typing import Optional

from .base import BaseEntity


class Address(BaseEntity):
    """Address entity model"""

    address_id: str
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state_region: str
    postal_code: int
    country: str
