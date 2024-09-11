from .models import User, AccessLevel, Agent

def get_all_users(session):
    """Function to get all users from the database."""
    return session.query(User).all()

def find_agent_by_name(session, name):
    """Function to find an agent by name."""
    return session.query(Agent).filter_by(name=name).first()

def find_agent_by_name(session, id):
    """Function to find an agent by name."""
    return session.query(Agent).filter_by(agid=id).first()

def find_agents_by_user(session, user_id):
    """Find all agents owned by a specific user."""
    return session.query(Agent).filter_by(owner=user_id).all()

def check_user_access(agent, user):
    """Function to check if a user has access to an agent."""
    if agent.access == AccessLevel.PUBLIC:
        return True
    if agent.access == AccessLevel.PRIVATE and user.uid in [u.uid for u in agent.allowed_users]:
        return True
    return False