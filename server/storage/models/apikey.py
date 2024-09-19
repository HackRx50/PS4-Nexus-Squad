from datetime import timedelta, datetime
import os

from sqlalchemy import String, Column, TIMESTAMP, Numeric, ForeignKey
from sqlalchemy.sql import func
import cuid

from storage.db import Session, engine
from .base import Base

def timestamp_after_30_days():
    return datetime.now() + timedelta(days=30)


def gen_api_key():
    return os.urandom(32).hex()

class ApplicationAPIKey(Base):
    __tablename__="application_apikeys"
    aid = Column("aid", String, primary_key=True, default=cuid.cuid)
    key = Column("key", String, nullable=False, unique=True, default=gen_api_key)
    created_at = Column("created_at", TIMESTAMP, default=func.now())
    updated_at = Column("updated_at", TIMESTAMP, default=func.now(), onupdate=func.now())


class UserAPIKey(Base):
    __tablename__="user_api_key"
    uakid = Column("uakid", String, primary_key=True, default=cuid.cuid)
    key = Column("key", String, nullable=False, unique=True, default=gen_api_key)
    
    user_id = Column("user_id", String, nullable=False)
    agent = Column("agent", ForeignKey("agents.agid"), nullable=False)
    description = Column("description", String)
    
    use_count = Column("use_count", Numeric, default=0)
    created_at = Column("created_at", TIMESTAMP, default=func.now())
    updated_at = Column("updated_at", TIMESTAMP, default=func.now(), onupdate=func.now())
    expires_at = Column("expires_at", TIMESTAMP, default=timestamp_after_30_days)

    @classmethod
    def create(cls, user_id: str, agent_id: str, description: str = None):
        with Session(engine) as session:
            try:
                user_api_key = UserAPIKey()
                user_api_key.user_id = user_id
                user_api_key.agent = agent_id
                if description:
                    user_api_key.description = description
                session.add(user_api_key)
                session.commit()
                session.refresh(user_api_key)
                return user_api_key
            except Exception as e:
                session.rollback()
                raise e
            
    @classmethod
    def increase_use_count(cls, user_id: str, apikey: str):
        with Session(engine) as session:
            try:
                user_api_key = session.query(UserAPIKey).filter(UserAPIKey.user_id == user_id, UserAPIKey.key == apikey).first()
                user_api_key.use_count += 1
                session.add(user_api_key)
                session.commit()
                session.refresh(user_api_key)
                return user_api_key
            except Exception as e:
                session.rollback()
                raise e

