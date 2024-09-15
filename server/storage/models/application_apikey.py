from sqlalchemy import String, Column, TIMESTAMP
from sqlalchemy.sql import func

import cuid

from .base import Base

class ApplicationAPIKey(Base):
    __tablename__="application_apikeys"
    aid = Column("aid", String, primary_key=True, default=cuid.cuid)
    key = Column("key", String, nullable=False, unique=True)
    created_at = Column("created_at", TIMESTAMP, default=func.now())
    updated_at = Column("updated_at", TIMESTAMP, default=func.now(), onupdate=func.now())