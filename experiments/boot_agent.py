from langgraph.prebuilt import create_react_agent
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import HumanMessage

import json
from dotenv import load_dotenv
load_dotenv()


llm = ChatMistralAI(model="mistral-large", temperature=0)

tools = []

data = None
with open('actions.json', 'r') as file:
    data = json.load(file)

def parse_id(id_string):
    return id_string.split('_', 1)[1] if '_' in id_string else id_string

for action in data['actions']:
    exec(action['code'])
    tools.append(globals()[parse_id(action.title)])


if __name__ == "__main__":
    agent = create_react_agent(llm, tools)
    agent.invoke({"messages": [HumanMessage(content="Print Hello world")]})

