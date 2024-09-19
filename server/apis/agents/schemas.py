from pydantic import BaseModel
from storage.models import AccessLevel

class CheckAgentSchema(BaseModel):
    name: str


class PostAgentSchema(BaseModel):
    name: str
    type: AccessLevel
    description: str

class ChangeAgentSchema(BaseModel):
    agent_id: str
    accessLevel: AccessLevel
