from typing import List
from sqlalchemy.orm.session import Session

from .models import User, AccessLevel, Agent


def get_all_users(session: Session)-> List[User]:
    """Function to get all users from the database."""
    return session.query(User).all()


def find_agent_by_name(session: Session, name: str)->Agent | None:
    """Function to find an agent by name."""
    return session.query(Agent).filter_by(name=name).first()


def find_agent_by_id(session: Session, id: str) -> Agent | None:
    """Function to find an agent by name."""
    return session.query(Agent).filter_by(agid=id).first()


def find_agents_by_user(session: Session, user_id: str)->List[Agent]:
    """Find all agents owned by a specific user."""
    return session.query(Agent).filter_by(owner=user_id).all()


def check_user_access(agent: Agent, user: User)-> bool:
    """Function to check if a user has access to an agent."""
    if agent.access == AccessLevel.PUBLIC:
        return True
    if agent.access == AccessLevel.PRIVATE and user.uid in [
        u.uid for u in agent.allowed_users
    ]:
        return True
    return False
