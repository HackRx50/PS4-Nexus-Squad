from fastapi import APIRouter, Request

from apis.storage.db import get_session
from apis.storage.models import Action
from apis.storage.utils import find_agent_by_id

from .utils import create_action_file, store_actions
from .schemas import PostActionSchema, UpdateActionSchema

action_router = APIRouter(prefix="/actions")

session = get_session()

@action_router.get("/")
def getActions(request: Request):
    actions = session.query(Action).filter(Action.owner == "cm0xu8fn70001nlpclah1myy9").all()
    return {
        "actions": actions
    }

@action_router.post("/")
def createAction(action_data: PostActionSchema, request: Request):
    module_name = create_action_file(action_data.code)
    print("Subdomain: ", request.state.subdomain)
    agent = find_agent_by_id(session, action_data.agent_id)
    print("AgentID:", agent.agid)
    actions = store_actions(module_name, action_data.title, action_data.language, agent.agid)

    return {
        "messages": "Total actions created {}".format(len(actions)),
        "count": len(actions)
    }

@action_router.put("/{agent_id}")
def updateAction(agent_id: str, action_data: UpdateActionSchema):
    module_name = create_action_file(action_data.code)
    agent = find_agent_by_id(session, action_data.agent_id)
    print("AgentID:", agent.agid)
    actions

