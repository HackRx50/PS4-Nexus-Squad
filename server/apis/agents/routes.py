from fastapi import APIRouter, Request, HTTPException

from storage.db import get_session
from storage.models import Agent, Action

from .schemas import PostAgentSchema
from .utils import canUseName

agent_router = APIRouter(prefix="/agents")

session = get_session()

@agent_router.get("/")
def getAgents(request: Request):
    user_id = request.state.user_id
    agents = session.query(Agent).filter(Agent.owner==user_id).all()
    return agents

@agent_router.get("/{agent_name}")
def getAgent(agent_name: str):
    agent = session.query(Agent).filter(Agent.name == agent_name).first()
    return agent


@agent_router.post("/")
def createAgent(data: PostAgentSchema, request: Request):
    user_id = request.state.user_id
    if canUseName(data.name):
        new_agent = Agent(data.name, owner=user_id)
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

