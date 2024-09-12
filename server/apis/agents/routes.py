from fastapi import APIRouter, Request, HTTPException

from apis.storage.db import get_session
from apis.storage.models import Agent, Action

from .schemas import PostAgentSchema
from .utils import canUseName

agent_router = APIRouter(prefix="/agents")

session = get_session()

@agent_router.get("/")
def getAgents(request: Request):
    actions = session.query(Agent).all()
    return actions

@agent_router.get("/{agent_id}")
def getAgent(agent_id: str):
    agent = session.query(Agent).filter(Agent.agid == agent_id).first()
    return agent

@agent_router.get("/{agent_id}/actions")
def getActionByAgentId(agent_id: str):
    agent = session.query(Action).filter(Action.agent==agent_id).all()
    return agent

@agent_router.post("/")
def createAgent(data: PostAgentSchema, request: Request):
    if canUseName(data.name):
        new_agent = Agent(data.name)
        session.add(new_agent)
        session.commit()
        return { "message": "Agent Created Successfully", "agent_id": new_agent.agid}
    raise HTTPException(401, "Already Used By other person")

@agent_router.post("/check-name")
def canCreateWithNameRoute(data: PostAgentSchema, request: Request):
    if canUseName(data.name):
        return { "data": {"result": True} }
    else:
        return { "data": {"result": False} }

