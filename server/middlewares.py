from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from os.path import join
from mimetypes import guess_type
import os

from settings import BASE_DIR

def getSubdomain(url: str):
    domain_parts = url.split(".")
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
    async def dispatch(self, request: Request, call_next):

        host = request.headers.get("host", "")
        path = request.url.path

        print(f"Host: {host}, Path: {path}")
        
        subdomain = getSubdomain(host)

        print(subdomain)
        
        if subdomain in ['admin', 'www', '']:
            content = getSPAContent(subdomain, path)
            mime_type, _ = guess_type(path)
            if not mime_type:
                mime_type = "text/html"
            return Response(content, media_type=mime_type)
        
        if subdomain == 'api':
            return await call_next(request)

        return await call_next(request)
