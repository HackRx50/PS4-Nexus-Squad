from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from os.path import join


load_dotenv()

from settings import CORS_ALLOWED_ORIGINS, BASE_DIR
from apps.apis import router as APIRouter
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

app.include_router(APIRouter)

if __name__=="__main__":
    from uvicorn import run
    run("main:app", host="0.0.0.0", port=80, reload=True)