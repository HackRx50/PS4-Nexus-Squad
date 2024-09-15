import atexit

from fastapi import APIRouter, Request, HTTPException
from apis.chat_session import session_manager
from storage.models import ChatSession
from storage.db import get_session
from storage.utils import find_agent_by_name

from .schemas import PostTalkChatSchema

chat_router = APIRouter(prefix="/chat")

@chat_router.get("/{session_id}")
def getChatSession(session_id: str, request: Request):
    user_id = None
    if hasattr(request.state, 'user_id'):
        user_id = request.state.user_id
    agent_name = request.state.subdomain
    session = session_manager.get_chat_session(session_id, agent_name, user_id=user_id)
    session.messages = session_manager.load_session_messages(session)
    return session

@chat_router.get("/")
def getChatSessions(request: Request):
    agent_name = request.state.subdomain
    session = get_session()
    user_id = None
    try:
        agent = find_agent_by_name(session, agent_name)
        if hasattr(request.state, 'user_id'):
            user_id = request.state.user_id
            result = session.query(ChatSession).filter_by(agent=agent.agid, owner=user_id).all()
            return result
    except:
        return HTTPException(status_code=404, detail="Something Went wrong")
    finally:
        session.close()


@chat_router.post("/{session_id}")
def talk_session(session_id: str, data: PostTalkChatSchema, request: Request):
    agent_name = request.state.subdomain
    user_id = None
    if hasattr(request.state, 'user_id'):
        user_id = request.state.user_id
    session, nexabot = session_manager.handle_session(session_id, agent_name, user_id=user_id)
    ai_message, response = session_manager.talk(session, nexabot, data.query)
    result = [message.__dict__ for message in response]
    session_manager.save_session(session.cid)
    return result

def on_exit():
    print("App is closing...")
    print("Saving Sessions...")
    for session in session_manager.chat_sessions:
        print(f"Saving Session: {session.cid}")
        if session.cid in session_manager.sessions_messages:
            session_manager.save_session(session.cid)

atexit.register(on_exit)
