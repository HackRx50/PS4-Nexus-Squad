from apis.nexabot.features import SessionManager
from langchain_mistralai import ChatMistralAI
from settings import MISTRAL_MODEL_TYPE

mistral = ChatMistralAI(model_name=MISTRAL_MODEL_TYPE)

session_manager = SessionManager(llm=mistral)