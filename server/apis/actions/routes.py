from fastapi import APIRouter, Request, Response, HTTPException
from fastapi import status

from apis.storage.db import get_session
from apis.storage.models import Action
from apis.storage.utils import find_agent_by_name

from apis.chat_session import session_manager

from .utils import create_action_file, store_actions
from .schemas import PostActionSchema, UpdateActionSchema

action_router = APIRouter(prefix="/actions")

session = get_session()

@action_router.get("/")
def getActions(request: Request):
    subdomain = request.state.subdomain
    actions = Action.get_actions_by_agent_name(session, subdomain)
    return {
        "actions": actions
    }

@action_router.post("/")
def createAction(action_data: PostActionSchema, request: Request):
    module_name = create_action_file(action_data.code)
    subdomain = request.state.subdomain
    agent = find_agent_by_name(session, subdomain)
    print("AgentID:", agent.agid)
    actions = store_actions(module_name, action_data.title, action_data.language, agent.agid)

    return {
        "messages": "Total actions created {}".format(len(actions)),
        "count": len(actions)
    }


@action_router.delete("/{action_id}")
def deleteAction(action_id: str):
    result = Action.delete_by_id(action_id=action_id)
    if result:
        return Response(status_code=204, content=f"Document with id: {action_id} deleted")
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action doesn't exists")
