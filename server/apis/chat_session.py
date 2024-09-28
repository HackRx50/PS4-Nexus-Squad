from apis.nexabot.features import SessionManager
from langchain_cohere import ChatCohere

from settings import MISTRAL_MODEL_TYPE

# mistral = ChatMistralAI(model_name=MISTRAL_MODEL_TYPE)
cohere = ChatCohere()
session_manager = SessionManager(llm=cohere)