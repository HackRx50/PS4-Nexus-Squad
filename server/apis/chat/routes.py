import atexit

from fastapi import APIRouter, Request
from apis.chat_session import session_manager

from .schemas import PostTalkChatSchema

chat_router = APIRouter(prefix="/chat")

@chat_router.get("/{session_id}")
def getChatSession(session_id: str, request: Request):
    user_id = request.state.user_id
    if not user_id:
        user_id = None
    agent_name = request.state.subdomain
    session = session_manager.get_chat_session(session_id, agent_name)
    session.messages = session_manager.load_session_messages(session)
    return session

@chat_router.post("/{session_id}")
def talk_session(session_id: str, data:PostTalkChatSchema, request: Request):
    agent_name = request.state.subdomain
    session, nexabot = session_manager.handle_session(session_id, agent_name)
    ai_message, result = session_manager.talk(session, nexabot, data.query)
    print(ai_message)
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
