from apis.nexabot.features import SessionManager
from langchain_cohere import ChatCohere
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import AzureChatOpenAI
from langchain_mistralai import ChatMistralAI
import os

from settings import MISTRAL_MODEL_TYPE

# mistral = ChatMistralAI(model_name=MISTRAL_MODEL_TYPE)
cohere = ChatCohere(model="command-r-plus")

az_openai_endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
az_openai_key = os.environ.get("AZURE_OPENAI_API_KEY")
az_openai_version = os.environ.get("OPENAI_API_VERSION")

print(az_openai_endpoint, az_openai_key, az_openai_version)

# az_openai = AzureChatOpenAI(
#     deployment_name="gpt-35-turbo",
#     api_key=az_openai_key,
#     azure_endpoint=az_openai_endpoint,
#     api_version=az_openai_version,
#     model="gpt-35-turbo"
# )
session_manager = SessionManager(llm=cohere)