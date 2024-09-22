from sqlalchemy import Column, String, TIMESTAMP, func
import cuid

from storage.db import Session, engine
from .base import Base

class AIModel(Base):
    __tablename__ = "ai_models"
    mid = Column("mid", String, primary_key=True, default=cuid.cuid)
    name = Column("name", String, unique=True)
    model = Column("model", String)
    availbleLimits = Column("availbleLimits", String, default=800)
    created_at = Column("created_at", TIMESTAMP, default=func.now())
    updated_at = Column(
        "updated_at", TIMESTAMP, default=func.now(), onupdate=func.now()
    )

    def __init__(self, name, model, owner):
        self.name = name
        self.model = model
        self.owner = owner

    @classmethod
    def delete_by_id(cls, model_id: str):
        with Session(engine) as session:
            model = session.query(AIModel).filter_by(mid=model_id).first()
            if model:
                session.delete(model)
                session.commit()
                return True
            else:
                return False

    @classmethod
    def decrease_available_limits(cls, model_id: str):
        with Session(engine) as session:
            model = session.query(AIModel).filter_by(mid=model_id).first()
            if model:
                model.availbleLimits -= 1
                session.commit()
                return model
            else:
                return None

    @classmethod
    def isLimitsAvailable(cls, model_id: str):
        with Session(engine) as session:
            model = session.query(AIModel).filter_by(mid=model_id).first()
            if model:
                if model.availbleLimits > 0:
                    return True
                else:
                    return False
            else:
                return False


    @classmethod
    def create(cls, name: str, model: str, owner_id: str = None):
        with Session(engine) as session:
            ai_model = AIModel(name=name, model=model, owner=owner_id)
            session.add(ai_model)
            session.commit()
            return ai_model