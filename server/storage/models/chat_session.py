from sqlalchemy.sql import func
from sqlalchemy import Column, String, ForeignKey, JSON, TIMESTAMP
from sqlalchemy.orm import Session
import cuid
from storage.db import get_session

from .base import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    cid = Column("sid", String, primary_key=True, default=cuid.cuid)
    title = Column("title", String, default="New Chat")
    agent = Column("agent", ForeignKey("agents.agid"))
    owner = Column(
        "owner", String, default="cm0xu8fn70001nlpclah1myy9"
    )
    messages = Column("messages", JSON, default=[])
    created_at = Column("created_at", TIMESTAMP, default=func.now())
    updated_at = Column(
        "updated_at", TIMESTAMP, default=func.now(), onupdate=func.now()
    )

    @classmethod
    def get_session_by_id(cls, session: Session, session_id: str, user_id: str = None):
        if user_id:
            return session.query(ChatSession).filter(ChatSession.cid==session_id, ChatSession.owner==user_id).first()
        return session.query(ChatSession).filter(ChatSession.cid==session_id).first()


    @classmethod
    def create(cls, agent, messages: list = [], cid: str | None = None, user_id: str = None):
        session = get_session()
        try:
            c_session = ChatSession()
            if cid:
                c_session.cid = cid
            if user_id:
                c_session.owner = user_id
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
        

