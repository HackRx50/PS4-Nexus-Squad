from fastapi import APIRouter, Request, HTTPException

from storage.db import Session, engine
from storage.models import Agent, AccessLevel

from .schemas import PostAgentSchema, CheckAgentSchema, ChangeAgentSchema
from .utils import canUseName

agent_router = APIRouter(prefix="/agents")


@agent_router.get("/")
def getAgents(request: Request):
    user_id = request.state.user_id
    with Session(engine) as session:
        agents = session.query(Agent).filter(Agent.owner==user_id).order_by(Agent.created_at.desc()).all()
        return agents


@agent_router.get("/{agent_name}")
def getAgent(agent_name: str, request: Request):
    user_id = request.state.user_id
    with Session(engine) as session:
        agent = session.query(Agent).filter(Agent.name == agent_name).first()
        if agent:
            if agent.access == AccessLevel.PUBLIC or agent.owner == user_id:
                return { "message": "Agent Fetch Success", "agent": agent }
        raise HTTPException(status_code=404, detail={ "message": "Agent Not Found", "agent": None })


@agent_router.post("/switch")
async def switch_access(request: Request):
    data = await request.json()
    print(data)
    user_id = request.state.user_id
    with Session(engine) as session:
        agent = session.query(Agent).filter(Agent.owner == user_id, Agent.agid ==data["agent_id"]).first()
        if agent: 
            if agent.change_access_level(session, data["accessLevel"]):
                return { "message": "Successfully Changed Agent to public", "status": True }
            else:
                raise HTTPException(403, detail={"detail": "Unable to change the access."})
        else: 
            raise HTTPException(404, detail={"detail": "Agent not found"})


@agent_router.post("/")
def createAgent(data: PostAgentSchema, request: Request):
    user_id = request.state.user_id
    print(data)
    if canUseName(data.name):
        new_agent = Agent.create(data.name, owner=user_id, access=data.type, description=data.description)
        return { "message": "Agent Created Successfully", "agent": new_agent}
    raise HTTPException(401, "Already Used By other person")


@agent_router.post("/check-name")
def canCreateWithNameRoute(data: CheckAgentSchema, request: Request):
    if canUseName(data.name):
        return { "data": {"result": True} }
    else:
        return { "data": {"result": False} }

