from fastapi import APIRouter

chat_router = APIRouter(prefix="/chat")

@chat_router.get("/")
def getChatSession():
    return { "Let's Chat": "Let's Chat" }