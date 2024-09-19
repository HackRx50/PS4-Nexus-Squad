from fastapi import APIRouter, Request, HTTPException
from fastapi.encoders import jsonable_encoder
import json

from storage.models import UserAPIKey
from storage.db import Session, engine

from .schemas import GenerateAPIKeySchema
from .utils import encrypt_message

apikey_router = APIRouter(prefix="/api_key")

@apikey_router.post("/")
def generate_api_key(data: GenerateAPIKeySchema,  request: Request):
    user_id = request.state.user_id
    api_key = UserAPIKey.create(user_id=user_id, agent_id=data.agent_id, description=data.description)
    api_key_str = json.dumps(jsonable_encoder(api_key))
    print(api_key_str)
    return encrypt_message(api_key_str)

@apikey_router.get("/")
def generate_api_key(request: Request):
    user_id = request.state.user_id
    with Session(engine) as session:
        api_keys = session.query(UserAPIKey).filter(UserAPIKey.user_id==user_id).order_by(UserAPIKey.created_at.desc()).all()
        api_keys_str = json.dumps(jsonable_encoder(api_keys))
        print(api_keys_str)
    return encrypt_message(api_keys_str)


@apikey_router.delete("/{api_key_id}")
def delete_api_key(api_key_id: str, request: Request):
    user_id = request.state.user_id
    with Session(engine) as session:
        api_key = session.query(UserAPIKey).filter(UserAPIKey.uakid==api_key_id, UserAPIKey.user_id==user_id).first()
        if api_key:
            session.delete(api_key)
            session.commit()
            return {"message": "API key deleted successfully."}
        else:
            raise HTTPException(status_code=404, detail={"detail": "API key not found."})


