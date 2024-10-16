from typing import List
import json

from langchain_community.tools import tool
from langgraph.prebuilt import create_react_agent
from langgraph.graph.graph import CompiledGraph
from langchain_cohere import ChatCohere

# from langchain_mistralai.chat_models import ChatMistralAI

from langchain_core.messages import AIMessage, ToolMessage, HumanMessage, SystemMessage

from settings import MISTRAL_MODEL_TYPE, ENVIRONMENT

from storage.db import Session, engine
from storage.models import ChatSession, Action, Agent
from storage.utils import (
    find_agent_by_id,
    find_agent_by_name,
    get_actions_by_agent_name,
)

from .embeddings import get_vector_store
from settings import SYSTEM_MESSAGE_CONTENT

from .guardrails import adjust_prompt_after_error



def get_vector_tool(agent_name: str):
    @tool
    def search_vector_store(query: str):
        """
        Search the database for the given query
        """
        vector_store = get_vector_store(agent_name)
        return vector_store.similarity_search(query, k=4)
    return search_vector_store


class NexaBot:
    id: str
    tools = []
    agent_name: str
    chatBot: CompiledGraph = None
    llm = None
    def boot(self, db_session: Session) -> bool:
        try:
            print("Booting agent...")
            actions: List[Action] = get_actions_by_agent_name(
                db_session, self.agent_name
            )
            tools_ns = {}
            for action in actions:
                print(action)
                try:
                    exec(action.code, globals(), tools_ns)
                    if not action.function_name:
                        action.function_name = parse_id(action.title)
                    self.tools.append(tool(tools_ns[action.function_name]))
                except Exception as e:
                    print(e)
                    print("Cound't set tool:", action.title, action.function_name)
            print("Tools setup complete.")

            print("Setting Up Knowledge Search tool...")
            vector_search_tool = get_vector_tool(self.agent_name)
            self.tools.append(vector_search_tool)
            print("\n\nBooting LLM...")
            llm = ChatCohere(model_name=MISTRAL_MODEL_TYPE)
            # llm = ChatMistralAI(model_name=MISTRAL_MODEL_TYPE)

            if not self.llm:
                self.llm = llm
                
            self.chatBot = create_react_agent(self.llm, self.tools)
            
            print("LLM booting Successfull")
            db_session.commit()
            return True
        except:
            return False

    def stream(self, messages: List):
        return self.chatBot.stream({"messages": [SystemMessage(content=SYSTEM_MESSAGE_CONTENT), *messages]})

    @classmethod
    def create(self, agent_id: str, llm=None):
        agent = find_agent_by_id(agent_id)
        if not agent:
            return None
        else:
            with Session(engine) as session:
                nexabot = NexaBot()
                nexabot.agent_name = agent.name
                nexabot.id = agent.agid
                if llm:
                    nexabot.llm = llm
                nexabot.boot(session)
                return nexabot


class SessionManager:
    active_bots: List[NexaBot] = []
    chat_sessions: List[ChatSession] = []

    sessions_messages = {}

    def __init__(self, llm=None) -> None:
        self.llm = llm

    def get_chat_session(self, session_id: str, agent_name: str, user_id: str = None):
        for session in self.chat_sessions:
            if session_id == session.cid:
                return session
        with Session(engine) as db_session:
            session = ChatSession.get_session_by_id(db_session, session_id, user_id)
            if session:
                self.chat_sessions.append(session)
                return session
            else:
                agent = find_agent_by_name(db_session, agent_name)
                if not agent:
                    raise ValueError("Agent Not Found")
                session = ChatSession.create(
                    agent=agent.agid, cid=session_id, user_id=user_id
                )
                self.chat_sessions.append(session)
                return session

    def has_nexabot(self, id: str):
        for bot in self.active_bots:
            if bot.id == id:
                return True
        return False

    def get_nexabot_by_id(self, id: str):
        for bot in self.active_bots:
            if bot.id == id:
                return bot

    def get_nexabot(self, session: ChatSession):
        for bot in self.active_bots:
            if bot.id == session.agent:
                return bot
        nexabot = NexaBot.create(agent_id=session.agent, llm=self.llm)
        if nexabot:
            self.active_bots.append(nexabot)
        return nexabot

    def interact_cli(self, session_id: str, agent_name: str):
        with Session(engine) as db_session:
            session, nexabot = self.handle_session(session_id, agent_name)
            query = input("> ")
            while query != "exit":
                if not query.strip():
                    query = input("> ")
                    continue
                message, result = self.talk(session, nexabot, query)
                print(message)
                query = input("> ")
            try:
                self.save_session(session_id)
                print(f"Saving session: {session_id}")
            except Exception as e:
                print("Couldn't Save the session")
                self.db_session.rollback()

    def talk(self, session: ChatSession, nexabot: NexaBot, message: str):
        session_messages = self.sessions_messages.get(session.cid, [])
        session_messages.append(HumanMessage(content=message))

        def save_session(cid):
            def save():
                return self.save_session(cid)
            return save

        if ENVIRONMENT == "production":
            result = nexabot.stream(session_messages)
            def process_stream(stream, messages, callback, original_message: str):
                try:
                    resp = adjust_prompt_after_error(session_messages)
                    print("Adjusted Resp:", resp)
                    prompt = resp['prompt']
                    print("Adjusted Prompt: ", prompt)

                    if prompt:
                        session_messages.pop()
                        session_messages.append(HumanMessage(content=prompt))
                        result = nexabot.stream(session_messages)
                        session_messages.pop()
                        session_messages.append(HumanMessage(content=original_message))
                    for chunk in stream:
                        print(chunk)
                        if 'agent' in chunk:
                            for message in chunk['agent']['messages']:
                                messages.append(message)
                                yield json.dumps({ "type": "ai", "content": message.content, "success": True })
                        if 'tools' in chunk:
                            for message in chunk['tools']['messages']:
                                messages.append(message)
                                yield message.json()
                except Exception as e:
                    print(f"An error occurred: {e}") 
                    try:
                        resp = adjust_prompt_after_error(session_messages)
                        print("Adjusted Resp After Error: ", prompt)
                        prompt = resp['prompt']
                        print("Adjusted Prompt After Error: ", prompt)
                        if prompt:
                            session_messages.pop()
                            session_messages.append(HumanMessage(content=prompt))
                            result = nexabot.stream(session_messages)
                            session_messages.pop()
                            session_messages.append(HumanMessage(content=original_message))
                            for chunk in result:
                                if 'agent' in chunk:
                                    for message in chunk['agent']['messages']:
                                        messages.append(message)
                                        yield json.dumps({ "type": "ai", "content": message.content, "success": True })
                                if 'tools' in chunk:
                                    for message in chunk['tools']['messages']:
                                        messages.append(message)
                                        yield message.json()
                    except Exception as e:
                        yield json.dumps({ "type": "ai", "content": f"An error occured {e}", "success": False })
                finally:
                    callback()
                    
            return process_stream(result, session_messages, save_session(session.cid), original_message=message)
        else:
            from apis.sample import sampleInvoke
            session_messages.pop()
            result = sampleInvoke()
            last_three_response = [HumanMessage(content=message), *result]
            for message in last_three_response:
                session_messages.append(message)
            return "Test Message", last_three_response

    def save_session(self, session_id: str):
        with Session(engine) as db_session:
            try:
                chat_session = (
                    db_session.query(ChatSession)
                    .filter(ChatSession.cid == session_id)
                    .first()
                )
                if session_id in self.sessions_messages:
                    if chat_session:
                        chat_session.messages = self.transpile_session_messages(
                            session_id
                        )
                        db_session.commit()
                    else:
                        print(
                            f"Session with id {session_id} not found in the database."
                        )
            except Exception as e:
                print(e)
                db_session.rollback()
                print(f"Couldn't save session with id {session_id}")

    def transpile_session_messages(self, session_id: str):
        if session_id in self.sessions_messages:
            transpiled_messages = []
            for message in self.sessions_messages[session_id]:
                if isinstance(message, dict):
                    transpiled_messages.append(message)
                else:
                    transpiled_messages.append(json.loads(message.json()))
            return transpiled_messages

    def load_session_messages(self, session: ChatSession):
        if session.cid not in self.sessions_messages: 
            session_messages = []
            for message in session.messages:
                message
                if message["type"] == "human":
                    session_messages.append(HumanMessage.parse_obj(message))
                elif message["type"] == "ai":
                    session_messages.append(AIMessage.parse_obj(message))
                elif message["type"] == "tool":
                    session_messages.append(ToolMessage.parse_obj(message))
            self.sessions_messages[session.cid] = session_messages
            return session_messages
        else:
            return self.sessions_messages[session.cid]

    def handle_session(self, session_id: str, agent_name: str, user_id: str = None):
        session: ChatSession = self.get_chat_session(
            session_id, agent_name, user_id=user_id
        )
        nexabot = self.get_nexabot(session)
        self.load_session_messages(session)
        return session, nexabot

    def reload_chat_session(self, session_id:str, agent_name: str, user_id: str = None):
        with Session(engine) as db_session:
            session = ChatSession.get_session_by_id(db_session, session_id, user_id)
            for index, value in enumerate(self.chat_sessions):
                if value.cid == session_id:
                    del self.chat_sessions[index]
                    break
            if session:
                self.chat_sessions.append(session)
                return session
            else:
                agent = find_agent_by_name(db_session, agent_name)
                if not agent:
                    raise ValueError("Agent Not Found")
                session = ChatSession.create(
                    agent=agent.agid, cid=session_id, user_id=user_id
                )
                self.chat_sessions.append(session)
                return session


def parse_id(id_string):
    return id_string.split("_", 1)[1] if "_" in id_string else id_string


