from pydantic import BaseModel

class PostTalkChatSchema(BaseModel):
    query: str
