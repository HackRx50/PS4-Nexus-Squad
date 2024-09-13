from sqlalchemy import Column, String, DATETIME, ForeignKey, Enum, Table, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.orm.session import Session
from datetime import datetime
import enum
import cuid

from .db import get_session, Base


class AccessLevel(enum.Enum):
    PUBLIC = "PUBLIC"
    PRIVATE = "PRIVATE"


agent_user_association = Table(
    "agent_user_association",
    Base.metadata,
    Column("agent_id", String, ForeignKey("agents.agid")),
    Column("user_id", String, ForeignKey("users.uid")),
)


class User(Base):
    __tablename__ = "users"
    uid = Column("uid", String, primary_key=True, default=cuid.cuid)
    fullname = Column("fullname", String)
    email = Column("email", String, nullable=False, unique=True)
    created_at = Column("created_at", DATETIME, default=datetime.utcnow)
    updated_at = Column(
        "updated_at", DATETIME, default=datetime.utcnow, onupdate=datetime.utcnow
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


class Agent(Base):
    __tablename__ = "agents"
    agid = Column("agid", String, primary_key=True, default=cuid.cuid)
    name = Column("name", String, unique=True)
    access = Column(
        "access", Enum(AccessLevel), nullable=False, default=AccessLevel.PUBLIC
    )
    owner = Column(
        "owner", ForeignKey("users.uid"), default="cm0xu8fn70001nlpclah1myy9"
    )

    allowed_users = relationship(
        "User", secondary=agent_user_association, backref="allowed_agents"
    )

    def __init__(
        self, name: str, owner=None, access: AccessLevel = AccessLevel.PRIVATE
    ):
        self.name = name
        if not owner:
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
        if self.access == AccessLevel.PRIVATE and user.uid in [
            u.uid for u in self.allowed_users
        ]:
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

    def get_actions(self, session):
        """Get all actions associated with this agent."""
        return session.query(Action).filter_by(agent=self.agid).all()


class Action(Base):
    __tablename__ = "actions"
    aid = Column("aid", String, primary_key=True, default=cuid.cuid)
    title = Column("title", String)
    function_name = Column("function_name", String)
    description = Column("description", String)
    code = Column("code", String)
    language = Column("language", String)
    requirements = Column("requirements", String)
    agent = Column("agent", ForeignKey("agents.agid"))
    owner = Column(
        "owner", ForeignKey("users.uid"), default="cm0xu8fn70001nlpclah1myy9"
    )
    created_at = Column("created_at", DATETIME, default=datetime.utcnow)
    updated_at = Column(
        "updated_at", DATETIME, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __init__(
        self, title, function_name, description, code, language, agent, owner, aid=None
    ):
        self.title = title
        self.description = description
        self.function_name = function_name
        self.code = code
        self.language = language
        self.agent = agent
        self.owner = owner
        if aid:
            self.aid = aid

    @classmethod
    def get_actions_by_agent_name(cls, session: Session, agent_name: str):
        return (
            session.query(Action)
            .join(Agent, Action.agent == Agent.agid)
            .filter(Agent.name == agent_name)
            .all()
        )

    @classmethod
    def delete_by_id(cls, session: Session, action_id: str):
        action = session.query(Action).filter_by(aid=action_id).first()
        if action:
            session.delete(action)
            session.commit()
            return True
        else:
            return False

    @classmethod
    def create(
        cls,
        title: str,
        function_name: str,
        description: str,
        code: str,
        language: str,
        agent_id: str,
        owner_id: str = None,
    ):
        session = get_session()
        action = Action(
            title, function_name, description, code, language, agent_id, owner_id
        )
        session.add(action)
        session.commit()
        session.close()
        return action


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_document"
    did = Column("id", String, primary_key=True, default=cuid.cuid)
    name = Column("name", String)
    type = Column("type", String)
    agent = Column("agent", ForeignKey("agents.agid"))
    owner = Column(
        "owner", ForeignKey("users.uid"), default="cm0xu8fn70001nlpclah1myy9"
    )
    vector_ids = Column("vector_ids", JSON, default=[])
    created_at = Column("created_at", DATETIME, default=datetime.utcnow)
    updated_at = Column(
        "updated_at", DATETIME, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    @classmethod
    def get_document_by_id(cls, session: Session, document_id: str):
        return (
            session.query(KnowledgeDocument)
            .filter(KnowledgeDocument.did == document_id)
            .first()
        )

    @classmethod
    def get_documents_by_agent_id(cls, session: Session, agent_id: str):
        return (
            session.query(KnowledgeDocument, Agent)
            .filter(KnowledgeDocument.agent == agent_id)
            .all()
        )

    @classmethod
    def get_documents_by_agent_name(cls, session: Session, agent_name: str):
        return (
            session.query(KnowledgeDocument)
            .join(Agent, KnowledgeDocument.agent == Agent.agid)
            .filter(Agent.name == agent_name)
            .all()
        )
    
    @classmethod
    def delete_by_id(cls, session: Session, document_id: str):
        document = session.query(KnowledgeDocument).filter_by(did=document_id).first()
        if document:
            session.delete(document)
            session.commit()
            return True
        else:
            return False

    @classmethod
    def create(cls, name, type, agent_id, ids, owner_id=None):
        session = get_session()  # Open session

        try:
            document = KnowledgeDocument()
            document.name = name
            document.type = type
            document.agent = agent_id
            document.vector_ids = ids
            session.add(document)
            session.commit()
            session.refresh(document)
            return document
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    cid = Column("sid", String, primary_key=True, default=cuid.cuid)
    agent = Column("agent", ForeignKey("agents.agid"))
    owner = Column(
        "owner", ForeignKey("users.uid"), default="cm0xu8fn70001nlpclah1myy9"
    )
    messages = Column("messages", JSON, default=[])
    created_at = Column("created_at", DATETIME, default=datetime.utcnow)
    updated_at = Column(
        "updated_at", DATETIME, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    @classmethod
    def get_session_by_id(cls, session: Session, session_id: str):
        return session.query(ChatSession).filter(ChatSession.cid==session_id).first()


    @classmethod
    def create(cls, agent, messages: list = [], cid: str | None = None):
        session = get_session()
        try:
            c_session = ChatSession()
            if cid:
                c_session.cid = cid
            c_session.messages = messages
            c_session.agent = agent
            session.add(c_session)
            session.commit()
            session.refresh(c_session)
            return c_session
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
        

