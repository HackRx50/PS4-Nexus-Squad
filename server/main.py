from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv, find_dotenv
from os.path import join
import sys
import cuid

from apis.nexabot.features import SessionManager

load_dotenv(find_dotenv())

from settings import CORS_ALLOWED_ORIGINS, BASE_DIR
from apis import router
from middlewares import DomainStaticFilesMiddleware

app = FastAPI()

app.add_middleware(DomainStaticFilesMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS, 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"],
)

hosting_path = join("deployments", "www.nexaflow.co")

app.include_router(router)

if __name__=="__main__":
    if "chat" in sys.argv:
        try: 
            chat_session_id = cuid.cuid()
            sessionManager = SessionManager()
            sessionManager.interact_cli(chat_session_id, "head")
        except KeyboardInterrupt as e:
            sessionManager.save_session(chat_session_id)
    else:
        from uvicorn import run
        run("main:app", host="0.0.0.0", port=443, ssl_certfile="./certs/certificate.pem", ssl_keyfile="./certs/private-key.pem")
        # run("main:app", host="0.0.0.0", port=8000, reload=True)