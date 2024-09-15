from sqlalchemy import Table, Column, String, ForeignKey

from .base import Base

import enum

class AccessLevel(enum.Enum):
    PUBLIC = "PUBLIC"
    PRIVATE = "PRIVATE"

agent_user_association = Table(
    "agent_user_association",
    Base.metadata,
    Column("agent_id", String, ForeignKey("agents.agid")),
    Column("user_id", String),
)