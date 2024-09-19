from fastapi import APIRouter, Request, Response, HTTPException
from fastapi import status

from storage.db import Session, engine
from storage.models import Action
from storage.utils import find_agent_by_name, get_actions_by_agent_name

from apis.chat_session import session_manager

from .utils import create_action_file, store_actions
from .schemas import PostActionSchema, UpdateActionSchema

action_router = APIRouter(prefix="/actions")


@action_router.get("/")
def getActions(request: Request):
    subdomain = request.state.subdomain
    with Session(engine) as session: 
        actions = get_actions_by_agent_name(session, subdomain)
        return {
            "actions": actions
        }

@action_router.post("/")
def createAction(action_data: PostActionSchema, request: Request):
    with Session(engine) as session:
        module_name = create_action_file(action_data.code)
        print(action_data)
        subdomain = request.state.subdomain
        agent = find_agent_by_name(session, subdomain)
        print("AgentID:", agent.agid)
        actions = store_actions(module_name, action_data.title, action_data.language, agent.agid)
        
        if session_manager.has_nexabot(agent.agid):
            session_manager.get_nexabot_by_id(agent.agid).boot()
            
        return {
            "messages": "Total actions created {}".format(len(actions)),
            "count": len(actions)
        }


@action_router.delete("/{action_id}")
def deleteAction(action_id: str):
    with Session(engine) as session:
        try:
            result = Action.delete_by_id(session=session, action_id=action_id)
            if result:
                return {"message": "Action deleted successfully", "action_id": action_id}
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action doesn't exists")
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))