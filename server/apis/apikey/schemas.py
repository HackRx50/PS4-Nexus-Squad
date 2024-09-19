from pydantic import BaseModel

class GenerateAPIKeySchema(BaseModel):
    agent_id: str
    description: str | None

