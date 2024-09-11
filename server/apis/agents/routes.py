from fastapi import APIRouter, Request

from apis.storage.db import get_session
from apis.storage.models import Agent

from .schemas import PostAgentSchema
from .utils import canUseName

agent_router = APIRouter(prefix="/agents")

session = get_session()

@agent_router.get("/")
def getAgents(request: Request):
    user_id = request.headers.get("uid")
    actions = session.query(Agent).filter(Agent.owner == user_id).all()
    return actions

@agent_router.get("/{agent_id}")
def getAgent(agent_id: str):
    agent = session.query(Agent).filter(Agent.agid == agent_id).first()
    return agent

@agent_router.post("/")
def createAgent(data: PostAgentSchema, request: Request):
    user_id = request.headers.get("uid")
    new_agent = Agent(data.name, user_id)
    session.add(new_agent)
    session.commit()
    return { "message": "Agent Created Successfully", "agent_id": new_agent.agid}

@agent_router.post("/check-name")
def canCreateWithNameRoute(data: PostAgentSchema, request: Request):
    user_id = request.headers.get("uid")
    if canUseName(data.name):
        return { "data": {"result": True} }
    else:
        return { "data": {"result": False} }

