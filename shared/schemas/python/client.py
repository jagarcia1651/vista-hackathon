"""
Client Entity Models
"""

from typing import Any, List, Optional

from .base import BaseEntity, ClientContactStatus


class Client(BaseEntity):
    """Client entity model"""

    client_id: str
    client_name: str
    main_phone: Optional[str] = None
    main_email: Optional[str] = None
    billing_phone: Optional[str] = None
    billing_email: Optional[str] = None
    street_address_id: Optional[str] = None
    billing_address_id: Optional[str] = None
    primary_contact_id: Optional[str] = None
    billing_contact_id: Optional[str] = None


class ClientContact(BaseEntity):
    """Client contact entity model"""

    client_contact_id: str
    client_id: str
    email: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    street_address_id: Optional[str] = None
    client_contact_status: str


class ClientArtifact(BaseEntity):
    """Client artifact entity model"""

    client_artifact_id: str
    client_id: str
    client_artifact_name: str
    client_artifact_type: str
    client_artifact_source: str
    hex_code: Optional[str] = None
    font_config: Optional[str] = None


# Business logic models
class ClientWithContacts(Client):
    """Client with related contacts"""

    contacts: List[ClientContact]
    active_projects: List[Any] = []  # Forward reference
    total_project_value: float
