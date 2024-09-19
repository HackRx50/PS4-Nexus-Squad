from sqlalchemy import func
from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, JSON
from sqlalchemy.exc import SQLAlchemyError

import cuid

from .base import Base
from .agent import Agent

from storage.db import engine, Session

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_document"
    did = Column("id", String, primary_key=True, default=cuid.cuid)
    name = Column("name", String)
    type = Column("type", String)
    agent = Column("agent", ForeignKey("agents.agid"))
    owner = Column(
        "owner", String, default="cm0xu8fn70001nlpclah1myy9"
    )
    vector_ids = Column("vector_ids", JSON, default=lambda: [])
    created_at = Column("created_at", TIMESTAMP, default=func.now())
    updated_at = Column(
        "updated_at", TIMESTAMP, default=func.now(), onupdate=func.now()
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
    def delete_by_id(cls, document_id: str):
        with Session(engine) as session:
            try:
                document = session.query(KnowledgeDocument).filter(KnowledgeDocument.did == document_id).first()

                if document:
                    session.delete(document)
                    session.commit()
                    return True
                else:
                    return False
            except SQLAlchemyError as e:
                session.rollback()  # Roll back the session in case of error
                # Log the error or handle it as needed
                print(f"An error occurred: {e}")
                return False

    @classmethod
    def create(cls, name, type, agent_id, ids, owner_id=None):
        with Session(engine) as session:
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
