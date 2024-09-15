from sqlalchemy.sql import func
from sqlalchemy import Column, String, TIMESTAMP
import cuid

from .base import Base
from .agent import Agent

class User(Base):
    __tablename__ = "users"
    uid = Column("uid", String, primary_key=True, default=cuid.cuid)
    fullname = Column("fullname", String)
    email = Column("email", String, nullable=False, unique=True)
    created_at = Column("created_at", TIMESTAMP, default=func.now())
    updated_at = Column(
        "updated_at", TIMESTAMP, default=func.now(), onupdate=func.now()
    )

    def __init__(self, fullname: str, email: str, uid=None):
        if uid:
            self.uid = uid
        self.fullname = fullname
        self.email = email

    def get_agents_owned(self, session):
        """Get all agents owned by this user."""
        return session.query(Agent).filter_by(owner=self.uid).all()

    @classmethod
    def find_by_uid(cls, session, id):
        """Class method to find a user by email."""
        return session.query(cls).filter_by(uid=id).first()

    @classmethod
    def find_by_email(cls, session, email):
        """Class method to find a user by email."""
        return session.query(cls).filter_by(email=email).first()

