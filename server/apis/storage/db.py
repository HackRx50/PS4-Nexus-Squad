from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

def get_session():
    engine = create_engine("sqlite:///db.sqlite")

    Base.metadata.create_all(bind=engine)

    Session = sessionmaker(bind=engine)
    session = Session()
    return session

