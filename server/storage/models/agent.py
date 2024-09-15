from sqlalchemy import Column, String, Enum, TIMESTAMP, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import cuid

from .base import Base
from .utils_models import AccessLevel

class Agent(Base):
    __tablename__ = "agents"
    agid = Column("agid", String, primary_key=True, default=cuid.cuid)
    name = Column("name", String, unique=True)
    access = Column(
        "access", Enum(AccessLevel), nullable=False, default=AccessLevel.PUBLIC
    )
    owner = Column(
        "owner", String, default="cm0xu8fn70001nlpclah1myy9"
    )
    created_at = Column("created_at", TIMESTAMP, server_default=func.now())
    updated_at = Column("updated_at", TIMESTAMP, server_default=func.now(), onupdate=func.now())
    allowed_users = Column("allowed_users", JSON, nullable=True, default=list)

    def __init__(
        self, name: str, owner=None, access: AccessLevel = AccessLevel.PRIVATE
    ):
        self.name = name
        if owner is not None:
            self.owner = owner
        self.access = access

    def add_user_to_allowed_list(self, session, user_id):
        """Add a user to the allowed users list."""
        if self.access == AccessLevel.PUBLIC:
            raise ValueError("Cannot add users to a public agent.")

        if user_id in self.allowed_users:
            raise ValueError("User is already in the allowed list.")

        self.allowed_users.append(user_id)
        session.commit()

    def is_accessible_by(self, user_id):
        """Instance method to check if a user has access based on the access level."""
        if self.access == AccessLevel.PUBLIC:
            return True
        if self.access == AccessLevel.PRIVATE and user_id in self.allowed_users:
            return True
        return False

    def change_access_level(self, session, new_access_level):
        """Change the access level of the agent."""
        if new_access_level not in AccessLevel:
            raise ValueError("Invalid access level.")

        if (
            self.access == AccessLevel.PUBLIC
            and new_access_level == AccessLevel.PRIVATE
        ):
            # Handle transition from PUBLIC to PRIVATE
            self.access = new_access_level
            session.commit()
        elif (
            self.access == AccessLevel.PRIVATE
            and new_access_level == AccessLevel.PUBLIC
        ):
            self.access = new_access_level
            self.allowed_users = []
            session.commit()
        else:
            raise ValueError("No change in access level.")
