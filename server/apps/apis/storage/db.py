from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

def get_session():
    engine = create_engine("sqlite:///db.sqlite")

    Base.metadata.create_all(bind=engine)

    Session = sessionmaker(bind=engine)
    session = Session()
    return session

