from sqlalchemy.sql import func
from sqlalchemy import Column, String, TIMESTAMP, Numeric, Boolean
import cuid

from storage.db import Session, engine

from .base import Base
from .agent import Agent

class User(Base):
    __tablename__ = "users"
    uid = Column("uid", String, primary_key=True)
    displayName = Column("displayName", String, default="default")
    email = Column("email", String, nullable=False, unique=True)
    emailVerified = Column("emailVerified", Boolean, default=False, nullable=False)
    photoURL = Column("photoURL", String, default=False)
    availableLimits = Column("available_limits", Numeric, default=50)
    created_at = Column("created_at", TIMESTAMP, default=func.now())
    updated_at = Column(
        "updated_at", TIMESTAMP, default=func.now(), onupdate=func.now()
    )

    @classmethod
    def create(cls, uid: str, email: str, emailVerified: bool,  displayName: str = None):
        with Session(engine) as session:
            user = User()
            user.uid = uid
            user.email = email
            if displayName:
                user.displayName = displayName
            if emailVerified == emailVerified:
                user.emailVerified = emailVerified
            session.add(user)
            session.commit()
            session.refresh(user)
            return user
        
    @classmethod
    def decrease_available_limit(cls, user_id: str):
        with Session(engine) as session:
            user = session.query(cls).filter_by(uid=user_id).first()
            if user:
                user.availableLimits -= 1 
                session.commit()

    @classmethod
    def setEmailVerified(cls, user_id: str, verified: bool):
        with Session(engine) as session:
            user = session.query(cls).filter_by(uid=user_id).first()
            if user:
                user.emailVerified = verified
                session.commit()

    @classmethod
    def check_limits(cls, user_id: str):
        with Session(engine) as session:
            user = session.query(cls).filter_by(uid=user_id).first()
            if user:
                return user.availableLimits > 0 
            return False
        
        


    def __init__(self):
        pass

    def get_agents_owned(self, session):
        """Get all agents owned by this user."""
        return session.query(Agent).filter_by(owner=self.uid).all()

    @classmethod
    def find_by_uid(cls, uid: str):
        """Class method to find a user by email."""
        with Session(engine) as session:
            return session.query(cls).filter_by(uid=uid).first()

    @classmethod
    def find_by_email(cls, session, email):
        """Class method to find a user by email."""
        return session.query(cls).filter_by(email=email).first()

