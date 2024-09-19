from os.path import join
import os
from pprint import pprint
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException

from settings import BASE_DIR
from storage.models import ApplicationAPIKey, UserAPIKey, User
from storage.db import Session, engine
from storage.utils import find_agent_by_id

cred = credentials.Certificate(BASE_DIR + "/admin-key.json")

class TokenVerificationResult:
    def __init__(self, result: dict):
        self.result = result
        self.aud = result.get("aud")
        self.auth_time = result.get("auth_time")
        self.email = result.get("email")
        self.email_verified = result.get("email_verified")
        self.exp = result.get("exp")
        self.firebase = result.get("firebase")
        self.identities = self.firebase.get("identities")
        self.sign_in_provider = self.firebase.get("sign_in_provider")
        self.iat = result.get("iat")
        self.iss = result.get("iss")
        self.sub = result.get("sub")
        self.uid = result.get("uid")
        self.user_id = result.get("user_id")

firebase_admin.initialize_app(cred)

def authenticate_with_token(authorization_string: str):
    """
    Authenticate a user with a Firebase JSON token.
    
    Args:
        token (str): The Firebase JSON token.
    
    Returns:
        dict: The decoded token if authentication is successful.
    """
    try:
        bearer, token = authorization_string.split(" ")
        if bearer != os.getenv("BEARER"):
            print("Invalid bearer")
            return None
        decoded_token = auth.verify_id_token(token)
        result = TokenVerificationResult(decoded_token)
        user = User.find_by_uid(uid=result.uid)
        if not user:
            user = User.create(result.uid, email=result.email,emailVerified=result.email_verified)
        elif user.emailVerified != result.email_verified:
            User.setEmailVerified(user.uid, result.email_verified)
        return result
    except auth.ExpiredIdTokenError:
        print("Token has expired")
        return None
    except auth.InvalidIdTokenError:
        print("Invalid token")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    
def checkApiKey(api_key: str):
    """
    Check if an API key is valid.
    
    Args:
        api_key (str): The API key.
    
    Returns:
        bool: True if the API key is valid, False otherwise.
    """
    with Session(engine) as session:
        try:
            api_key = session.query(ApplicationAPIKey).filter(ApplicationAPIKey.key == api_key).first()
            if not api_key:
                raise ValueError("API key is invalid")
            return True
        except Exception as e:
            print(f"An error occurred: {e}")
            return False



def checkUserAPIKey(apikey: str, agent_name: str):
    with Session(engine) as session:
        api_key = session.query(UserAPIKey).filter(UserAPIKey.key == apikey).first()
        if api_key:
            agent = find_agent_by_id(api_key.agent)
            if not agent:
                raise HTTPException(status_code=404, detail={"detail": "Nexabot Not Found"})
            elif agent.name != agent_name:
                raise HTTPException(status_code=403, detail={"detail": "Nexabot Unavailable"})          
            limitsAvailable = User.check_limits(api_key.user_id)
            if limitsAvailable:
                return api_key.user_id
            raise HTTPException(status_code=403, detail={"detail": "Limit Exceed"})
        else:
            raise HTTPException(status_code=404, detail={"detail": "API key not found"})

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
