from fastapi import APIRouter, Request, HTTPException
from fastapi.encoders import jsonable_encoder
import json

from apis.apikey.utils import encrypt_message
from storage.models import User


user_router = APIRouter(prefix="/user")

@user_router.get("/")
def getUser(request: Request):
    try:
        user_id = request.state.user_id
        print(user_id)
        user = User.find_by_uid(user_id)
        print(user)
        user_json = jsonable_encoder(user)
        return encrypt_message(json.dumps({ "message": "User Found" , "user": user_json }))
    except Exception as e:
        raise HTTPException(status_code=501, detail={"detail": str(e)})