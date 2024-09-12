from fastapi import APIRouter

from .actions import action_router
from .agents import agent_router
from .chat import chat_router
from .documents import document_router

router = APIRouter(prefix="/api/v1")

router.include_router(action_router)
router.include_router(agent_router)
router.include_router(chat_router)
router.include_router(document_router)

__all__ = ["router"]