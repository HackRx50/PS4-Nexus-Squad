import re

from settings import AGENT_NOT_ALLOWED_NAME

from storage.db import get_session
from storage.models import Agent

def is_valid_subdomain(name):
    pattern = r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
    
    if re.match(pattern, name) and name not in AGENT_NOT_ALLOWED_NAME:
        return True
    return False

def is_used_by_other(name: str):
    session = get_session()
    q = session.query(Agent).filter(Agent.name == name).all()
    return len(q) > 0

def canUseName(name: str):
    return is_valid_subdomain(name) and not is_used_by_other(name)

