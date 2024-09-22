import atexit
import json
import os

from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import StreamingResponse
import httpx

from apis.chat_session import session_manager
from storage.models import ChatSession, User, UserAPIKey
from storage.db import Session, engine
from storage.utils import find_agent_by_name


chat_router = APIRouter(prefix="/chat")

async def generate_text(session_id: str, request: Request):
    data = await request.json()
    statement = data["query"]
    print("Statement:", statement)

    user_id = getattr(request.state, "user_id", None)
    print(user_id)

    async def stream_generator():
        title = ""
        try:
            url = os.getenv("GENERATE_TITLE_URL")

            data = {
                "model": "gemma2:2b",
                "stream": True,
                "prompt": f"Write the one line title for the query which matches the statement by reading which user can understand what can the title detail about: {statement}"
            }
            
            async with httpx.AsyncClient() as client:
                async with client.stream('POST', url, json=data) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                json_response = json.loads(line)
                                title += json_response.get("response", "")
                                yield json_response["response"]
                            except json.JSONDecodeError as e:
                                print(f"Could not parse JSON: {e}")
                                print(f"Raw content: {line}")
            ChatSession.set_title(session_id, title)
        except httpx.RequestError as e:
            print(f"An error occurred: {e}")
            yield "New Chat" + "\n"

    return StreamingResponse(stream_generator(), media_type="text/plain")

@chat_router.post("/new/{session_id}")
async def get_chat_session(session_id: str, request: Request):
    return await generate_text(session_id, request)


@chat_router.get("/{session_id}")
async def getChatSession(session_id: str, request: Request):
    user_id = None
    if hasattr(request.state, "user_id"):
        user_id = request.state.user_id
    agent_name = request.state.subdomain
    session = session_manager.get_chat_session(session_id, agent_name, user_id=user_id)
    session.messages = session_manager.load_session_messages(session)
    return session


@chat_router.get("/")
def getChatSessions(request: Request):
    agent_name = request.state.subdomain
    with Session(engine) as session:
        user_id = None
        try:
            agent = find_agent_by_name(session, agent_name)
            if hasattr(request.state, "user_id"):
                user_id = request.state.user_id
                from sqlalchemy.orm import load_only

                result = (
                    session.query(ChatSession)
                    .options(
                        load_only(
                            ChatSession.agent,
                            ChatSession.title,
                            ChatSession.owner,
                            ChatSession.created_at,
                            ChatSession.updated_at,
                        )
                    )
                    .filter_by(agent=agent.agid, owner=user_id)
                    .order_by(ChatSession.created_at.desc())
                    .all()
                )
                return result
        except:
            return HTTPException(status_code=404, detail="Something Went wrong")


@chat_router.post("/{session_id}")
async def talk_session(session_id: str, request: Request):
    try:
        agent_name = request.state.subdomain
        user_id = None
        data = await request.json()
        if hasattr(request.state, "user_id"):
            user_id = request.state.user_id
        if hasattr(request.state, "userKey"):
            userKey = request.state.userKey
            UserAPIKey.increase_use_count(user_id, userKey)
        session, nexabot = session_manager.handle_session(
            session_id, agent_name, user_id=user_id
        )
        if not data['query']:
            raise HTTPException(status_code=400, detail={ "detail": "Query is required" })
        process_stream = session_manager.talk(session, nexabot, data["query"])
        User.decrease_available_limit(user_id)
        return StreamingResponse(process_stream, media_type="text/plain")
    except:
        raise HTTPException(status_code=500, detail="Something Went wrong")
    finally:
        session_manager.save_session(session.cid)


@chat_router.delete("/{session_id}")
async def delete_session(session_id: str, request: Request):
    try:
        user_id = None
        if hasattr(request.state, "user_id"):
            user_id = request.state.user_id
        with Session(engine) as session:
            chat_session = (
                session.query(ChatSession).filter(ChatSession.cid == session_id).first()
            )
            if chat_session:
                if chat_session.owner == user_id:
                    session.delete(chat_session)
                    session.commit()
                    return {"detail": f"SessionID: {session_id} deleted successfully"}
                else:
                    print(f"User {user_id} not authorized to delete session {session_id}")
                    return HTTPException(
                        status_code=401,
                        detail={"detail": "User not authorized to delete session"},
                    )
            else:
                print(f"Session with id {session_id} not found in the database.")
                return HTTPException(
                    status_code=404,
                    detail={
                        "detail": f"Session with id {session_id} not found in the database."
                    },
                )
    except Exception as e:
        print(e)
        await session.rollback()
        print(f"Couldn't delete session with id {session_id}")
        return HTTPException(
            status_code=404,
            detail={"detail": f"Couldn't delete session with id {session_id}"},
        )


def on_exit():
    print("App is closing...")
    print("Saving Sessions...")
    for session in session_manager.chat_sessions:
        print(f"Saving Session: {session.cid}")
        if session.cid in session_manager.sessions_messages:
            session_manager.save_session(session.cid)


atexit.register(on_exit)
