import os
from sqlalchemy.pool import QueuePool
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from dotenv import load_dotenv
load_dotenv()

database_url = os.getenv("POSTGRESQL_URL")

if not database_url:
        raise Exception("POSTGRESQL_URL environment variable is not set.")
    

engine = create_engine(
    database_url,
    execution_options={"isolation_level": "AUTOCOMMIT"},
    echo_pool=True,
    poolclass=QueuePool,      
    pool_size=10,                
    max_overflow=20,             
    pool_timeout=30,
)

def get_session():
    session = Session(bind=engine)
    return session
