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
    execution_options={"isolation_level": "READ COMMITTED"},  # Change isolation level for consistency
    echo_pool=False,  # Disable pool logging for performance
    poolclass=QueuePool,  # Using QueuePool as specified
    pool_size=20,  # Increased pool size for handling more connections
    max_overflow=50,  # Allow more overflow connections for handling burst traffic
    pool_timeout=20,  # Lower pool timeout for quicker failures during connection issues
    pool_recycle=1800,  # Recycle connections every 30 minutes to prevent stale connections
    pool_pre_ping=True, # Enable pre-ping to avoid broken connections
)