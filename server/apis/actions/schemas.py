from pydantic import BaseModel

class PostActionSchema(BaseModel):
    title: str
    code: str
    language: str
    requirements: str

class UpdateActionSchema(BaseModel):
    title: str
    code: str
    language: str