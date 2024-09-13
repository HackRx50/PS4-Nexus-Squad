from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
engine = create_engine("sqlite:///db.sqlite")
Base.metadata.create_all(bind=engine)

def get_session():
    Base.metadata.create_all(bind=engine)

    Session = sessionmaker(bind=engine)

    session = Session()
    return session

