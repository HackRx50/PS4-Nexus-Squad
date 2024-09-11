from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool
from api.models import Action


def parse_id(id_string):
    return id_string.split('_', 1)[1] if '_' in id_string else id_string

class BootAgent:
    def __init__(self, agent_id, agent=None, tools=None, llm=None):
        self.agent_id = agent_id
        self.agent = agent
        self.tools = tools
        self.llm = llm
        self.__boot()

    def __boot(self):
        if self.agent is None:
            print("Booting agent...")
            actions = Action.objects.all()
            print("Setting up tools...")
            tools = []
            tools_ns = {}
            for action in actions:
                exec(action.code, globals(), tools_ns)
                function_name = parse_id(action.title)
                tools.append(tool(tools_ns[function_name]))
            print("Tools setup complete")
            self.tools = tools
            print("Booting LLM...")
            self.agent = create_react_agent(self.llm, self.tools)
            print("Agent booted successfully")
            print(self.tools)
    
    def invoke(self, input):
        return self.agent.invoke(input)
