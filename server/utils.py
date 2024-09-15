import os
from pprint import pprint

import firebase_admin
from firebase_admin import credentials, auth

from settings import BASE_DIR
from storage.models import ApplicationAPIKey
from storage.db import get_session

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
        return TokenVerificationResult(decoded_token)
    except auth.InvalidIdTokenError:
        print("Invalid token")
        return None
    except auth.ExpiredIdTokenError:
        print("Token has expired")
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
    session = get_session()
    try:
        api_key = session.query(ApplicationAPIKey).filter(ApplicationAPIKey.key == api_key).first()
        if not api_key:
            raise ValueError("API key is invalid")
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False
    finally:
        session.close()