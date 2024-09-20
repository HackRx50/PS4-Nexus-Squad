from fastapi import Request, Response, HTTPException
from starlette.responses import JSONResponse

from starlette.middleware.base import BaseHTTPMiddleware
from mimetypes import guess_type
from os.path import join
import os

from storage.models import User
from storage.db import Session, engine
from storage.utils import find_agent_by_name
from settings import BASE_DIR

from utils import authenticate_with_token, checkApiKey, getSPAContent, getSubdomain, checkUserAPIKey


class DomainStaticFilesMiddleware(BaseHTTPMiddleware):

    agents_cache = []

    def isAgentExists(self, name: str):
        with Session(engine) as session:
            if name not in self.agents_cache:
                agent = find_agent_by_name(session, name)
                if agent:
                    self.agents_cache.append(agent.name)
                    return True
                else:
                    return False
        return True

    async def dispatch(self, request: Request, call_next):

        host = request.headers.get("host", "")
        path = request.url.path

        print(f"Host: {host}, Path: {path}")
        
        subdomain = getSubdomain(host)
        request.state.subdomain = subdomain
        print(subdomain)
        
        user_api_key = request.headers.get("x-user-api-key")
        api_key = request.headers.get("x-api-key")

        # Serve Docs
        if subdomain == 'admin' and (path.startswith("/docs") or path.startswith("/openapi.json")):
            return await call_next(request)

        if path.startswith("/api/v1"):
            if path.startswith("/api/v1/chat") and user_api_key:
                try:
                    user_id = checkUserAPIKey(user_api_key, agent_name=subdomain)
                    request.state.user_id = user_id
                    request.state.userKey = user_api_key
                    return await call_next(request)
                except HTTPException as e:
                    return JSONResponse(e.detail, status_code=e.status_code)
                
            try:
                if api_key:
                    result = checkApiKey(api_key)
                    if not result:
                        return JSONResponse(status_code=401, content={"detail": "Invalid API Key"})
                else:
                    return JSONResponse(status_code=401, content={"detail": "No API Key Found"})
                
            except Exception as e:
                print(e)
                return JSONResponse(status_code=401, content={"detail": "Error validating api key"})

            authorization_token = request.headers.get("Authorization")
            if not authorization_token:
                return JSONResponse(status_code=401, content={"detail": "No Authorization Found", "redirect": "http://admin.localhost/login" })
            result = authenticate_with_token(authorization_token)
            if not result:
                return JSONResponse(status_code=401, content={"detail": "Invalid Authorization Token"})
            request.state.user_id = result.user_id
            if path.startswith("/api/v1/chat") and request.method == "POST" and result.user_id:
                limitsAvailable = User.check_limits(result.user_id)
                if not limitsAvailable:
                    return JSONResponse(status_code=403, content={"detail": "Limit Exceed"})

            return await call_next(request)


        if path.startswith("/api") and path.startswith("/docs") and path.startswith("/openapi.json"):
            return await call_next(request)

        if subdomain == 'admin':
            content = getSPAContent(subdomain, path)
            mime_type, _ = guess_type(path)
            if not mime_type:
                mime_type = "text/html"
            return Response(content, media_type=mime_type)
        
        
        if (subdomain == '' or subdomain == 'www' or self.isAgentExists(subdomain)) and not path.startswith("/api") and not path.startswith("/docs") and not path.startswith("/openapi.json"):
            content = getSPAContent('www', path)
            mime_type, _ = guess_type(path)
            if not mime_type:
                mime_type = "text/html"
            return Response(content, media_type=mime_type)
        elif path.startswith('/api') or path.startswith("/docs") or path.startswith("/openapi.json"):
            return await call_next(request)
        else:
            with open("404.html", "br") as file:
                return Response(file.read(), media_type="text/html")


