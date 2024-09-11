from sqlalchemy import Column, String, DATETIME, ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import cuid

from .db import get_session, Base


class AccessLevel(enum.Enum):
    PUBLIC = "PUBLIC"
    PRIVATE = "PRIVATE"

agent_user_association = Table(
    'agent_user_association',
    Base.metadata,
    Column('agent_id', String, ForeignKey('agents.agid')),
    Column('user_id', String, ForeignKey('users.uid'))
)

class User(Base):
    __tablename__ = "users"
    uid = Column("uid", String, primary_key=True, default=cuid.cuid)
    fullname = Column("fullname", String)
    email = Column("email", String, nullable=False, unique=True)
    created_at = Column("created_at", DATETIME, default=datetime.utcnow)
    updated_at = Column("updated_at", DATETIME, default=datetime.utcnow, onupdate=datetime.utcnow)

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

class Agent(Base):
    __tablename__ = "agents"
    agid = Column("agid", String, primary_key=True, default=cuid.cuid)
    name = Column("name", String, unique=True)
    access = Column("access", Enum(AccessLevel), nullable=False, default=AccessLevel.PUBLIC)
    owner = Column("owner", ForeignKey("users.uid"), default="cm0xu8fn70001nlpclah1myy9")

    allowed_users = relationship("User", secondary=agent_user_association, backref="allowed_agents")

    def __init__(self, name: str, owner, access: AccessLevel = AccessLevel.PRIVATE):
        self.name = name
        self.owner = owner
        self.access = access
        self.allowed_users

    def add_user_to_allowed_list(self, session, user):
        """Add a user to the allowed users list."""
        if self.access == AccessLevel.PUBLIC:
            raise ValueError("Cannot add users to a public agent.")
        
        if user in self.allowed_users:
            raise ValueError("User is already in the allowed list.")
        
        self.allowed_users.append(user)
        session.commit()
    

    def is_accessible_by(self, user):
        """Instance method to check if a user has access based on the access level."""
        if self.access == AccessLevel.PUBLIC:
            return True
        if self.access == AccessLevel.PRIVATE and user.uid in [u.uid for u in self.allowed_users]:
            return True
        return False

    def change_access_level(self, session, new_access_level):
        """Change the access level of the agent."""
        if new_access_level not in AccessLevel:
            raise ValueError("Invalid access level.")
        
        if self.access == AccessLevel.PUBLIC and new_access_level == AccessLevel.PRIVATE:
            # Handle transition from PUBLIC to PRIVATE
            self.access = new_access_level
            session.commit()
        elif self.access == AccessLevel.PRIVATE and new_access_level == AccessLevel.PUBLIC:
            self.access = new_access_level
            self.allowed_users = []
            session.commit()
        else:
            raise ValueError("No change in access level.")

    def get_actions(self, session):
        """Get all actions associated with this agent."""
        return session.query(Action).filter_by(agent=self.agid).all()

class Action(Base):
    __tablename__ = "actions"
    aid = Column("aid", String, primary_key=True, default=cuid.cuid)
    title = Column("title", String)
    description = Column("description", String)
    code = Column("code", String)
    language = Column("language", String)
    agent = Column("agent", ForeignKey("agents.agid"))
    owner = Column("owner", ForeignKey("users.uid"), default="cm0xu8fn70001nlpclah1myy9")
    created_at = Column("created_at", DATETIME, default=datetime.utcnow)
    updated_at = Column("updated_at", DATETIME, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, title, description, code, language, agent, owner, aid=None):
        self.title = title
        self.description = description
        self.code = code
        self.language = language
        self.agent = agent
        self.owner = owner
        if aid:
            self.aid = aid

    def get_summary(self):
        """Instance method to return a summary of the action."""
        return f"{self.title}: {self.description}"

    @classmethod
    def create(cls, title: str, description: str, code: str, language: str, agent_id: str, owner_id: str=None):
        session = get_session()
        action = Action(title, description,code, language, agent_id, owner_id)
        session.add(action)
        session.commit()
        session.close()
        return action
