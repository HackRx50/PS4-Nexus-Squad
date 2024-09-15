from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from starlette.requests import Request

from storage.db import get_session
from storage.models import User

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        uid = request.headers.get("uid")

        session = get_session()
        user = User.find_by_uid(session, uid)

        print("User Check AuthMiddleware: ", user.uid)
        
        if user.uid:
            request.state.user = user
            response = await call_next(request)
        else:
            response = JSONResponse(
                content={"detail": "UID parameter is missing"},
                status_code=403
            )
        
        return response
