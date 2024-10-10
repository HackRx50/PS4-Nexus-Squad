from sqlalchemy.sql import func

from sqlalchemy.orm import Session
from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, JSON
import cuid

from storage.db import engine

from .base import Base


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
        "owner", String, default="cm0xu8fn70001nlpclah1myy9"
    )
    vector_ids = Column("vector_ids", JSON, default=lambda: [])
    created_at = Column("created_at", TIMESTAMP, default=func.now())
    updated_at = Column(
        "updated_at", TIMESTAMP, default=func.now(), onupdate=func.now()
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
        vector_ids: str,
        owner_id: str = None,
    ):
        with Session(engine) as session:
            action = Action(
                title, function_name, description, code, language, agent_id, owner_id
            )
            action.vector_ids = vector_ids
            session.add(action)
            session.commit()
            return action

