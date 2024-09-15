from fastapi import Request, Response
from starlette.responses import JSONResponse

from starlette.middleware.base import BaseHTTPMiddleware
from mimetypes import guess_type
from os.path import join
import os

from storage.db import get_session
from storage.utils import find_agent_by_name
from settings import BASE_DIR

from utils import authenticate_with_token, checkApiKey

def getSubdomain(url: str):
    domain_parts = url.split(".")
    if len(domain_parts) == 2 and domain_parts[1].startswith("localhost"):
        return domain_parts[0]
    if len(domain_parts) > 2:
        return ".".join(domain_parts[:-2])
    else:
        return "www"

def getSPAContent(subdomain: str, path: str):
    spa_path = join(BASE_DIR, "deployments", subdomain) 
    print(spa_path, path)
    content = None
    if path == "/":
        path = "index.html"
    else:
        path = path[1:]
    print(join(spa_path, path), "exists:", os.path.exists(join(spa_path, path)))
    if os.path.exists(join(spa_path, path)):
        with open(join(spa_path, path), 'br') as file:
            content = file.read()
    else:
        with open(join(spa_path, "index.html"), 'br') as file:
            content = file.read()
    return content


class DomainStaticFilesMiddleware(BaseHTTPMiddleware):

    agents_cache = []

    def isAgentExists(self, name: str):
        if name not in self.agents_cache:
            session = get_session()
            agent = find_agent_by_name(session, name)
            session.close()
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
        

        # Serve Docs
        if subdomain == 'admin' and (path.startswith("/docs") or path.startswith("/openapi.json")):
            return await call_next(request)
        
        # Check API Key
        if path.startswith("/api"):
            api_key = request.headers.get("x-api-key")
            try:
                if api_key:
                    result = checkApiKey(api_key)
                    if not result:
                        return JSONResponse(status_code=401, content={"detail": "Invalid API Key"})
                else:
                    return JSONResponse(status_code=401, content={"detail": "No API Key Found"})
            except Exception as e:
                print(e)
                return JSONResponse(status_code=401, content={"detail": "Invalid API Key"})

            authorization_token = request.headers.get("Authorization")
            if not authorization_token:
                return JSONResponse(status_code=401, content={"detail": "No Authorization Found"})
            result = authenticate_with_token(authorization_token)
            if not result:
                return JSONResponse(status_code=401, content={"detail": "Invalid Authorization Token"})
            request.state.user_id = result.user_id
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


