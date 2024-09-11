from django.http import JsonResponse, HttpRequest
from .utils.boot_agent import BootAgent
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
import json
import dotenv

dotenv.load_dotenv()
mistral = ChatMistralAI(model_name="mistral-large-latest")

agents = {
    "default": BootAgent("Default", llm=mistral)
}

def boot_agent(request, agent_id):
    global agents
    if request.method == "GET":
        print(agents)
        if agent_id in agents:
            agent = BootAgent(agent_id, llm=mistral)
            agents[agent_id] = agent
            print(agents)
        return JsonResponse({"agent_id": agent_id})
    

def conversation(request: HttpRequest, agent_id):
    global agents
    print(agents, agent_id)
    print(agent_id not in agents)
    if request.method == "POST":
        print(agents)
        body = json.loads(request.body)
        query = body.get("query")
        if 'default' not in agents:
            return JsonResponse({"error": "Agent not found"}, status=404)
        agent = agents['default']
        response = agent.invoke({ "messages": [HumanMessage(content=query)]})
        messages = []
        print(response)
        for message in response["messages"]:
            if isinstance(message, HumanMessage):
                print(message.content)
                messages.append({"role": "user", "content": message.content, "isUser": True})
            elif isinstance(message, AIMessage):
                if message.content:
                    messages.append({"role": "assistant", "content": message.content, "isUser": False})
        return JsonResponse({"messages": messages})