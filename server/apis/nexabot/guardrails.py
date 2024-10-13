from .embeddings import get_action_vector_store, get_vector_store
from langchain_core.messages import AIMessage, ToolMessage, HumanMessage, SystemMessage
from .utils import execution_time

from langchain_cohere import ChatCohere
from langchain_mistralai import ChatMistralAI

from langchain_community.docstore.document import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain.output_parsers.json import SimpleJsonOutputParser

@execution_time
def can_perform(query: str, agent_name: str):
    vc_store = get_action_vector_store(agent_name)
    results = vc_store.similarity_search(query, k=1)
    return results

@execution_time
def check_approval(query: str, doc: Document, old_messages: str, agent_name: str):
    llm = ChatCohere()

    previous_messages = ""

    for message in old_messages:
        if isinstance(message, HumanMessage):
            previous_messages += "User: \"" + message.content + "\" \n" 
        elif isinstance(message, AIMessage):   
            previous_messages += "AI: \"" + message.content + "\" \n"
        elif isinstance(message, ToolMessage):   
            previous_messages += ""
        elif isinstance(message, SystemMessage):   
            previous_messages += ""
        elif message['type'] == "human":
            previous_messages += "User: \"" + message["content"] + "\" \n"    
        elif message["type"] == "ai":
            previous_messages += "AI: \"" + message["content"] + "\" \n"

    print("Previous Messsages:", previous_messages)

    # extactDetailPrompt = ChatPromptTemplate.from_template(
    #     """"
    #     respond with a valid JSON containing "details_found" containing the details available if arguments are available
    #     """
    # )
    
    promptAction1 = ChatPromptTemplate.from_template(
        """
        Description: {page_content}

        Evaluate the following query against the above description:
        {query}

        Response instructions:
        1. If the query matches the description perfectly (including all arguments):
        Return a JSON with only one key:
        {{"status": "Approved"}}

        2. If the query matches the description but is missing some argument details:
        Return a JSON with two keys:
        {{"status": "Disapproved",
            "message": "Please provide [list the missing argument details]"}}

        3. If the query does not match the description at all:
        Return a JSON with two keys:
        {{"status": "Disapproved",
            "message": "No relevant details found for this query"}}

        Ensure your response is a valid JSON object with the appropriate keys as described above.
        """
    )
    chain  = promptAction1 | llm | SimpleJsonOutputParser()

    result = chain.invoke({ "query": query, "old_messages": previous_messages, "page_content": doc.page_content })

    return result

def escape_quotes_and_braces(input_string):
    import re
    escaped_string = re.sub(r'(["\'{}])', r'\\\1', input_string)
    return escaped_string

def remove_quotes_and_braces(input_string):
    import re
    cleaned_string = re.sub(r'[\'"{}]', '', input_string)
    return cleaned_string

@execution_time
def can_answer_from_docs(query: str, agent_name: str):
    print(agent_name)

    vc_store = get_vector_store(agent_name)
    search_result = vc_store.similarity_search_with_score(query, k=8)

    pages = ""

    for index, page in enumerate(search_result):
        pages += f"""
            Page {index}:

            {remove_quotes_and_braces(page[0].page_content)}   

            -----------------------------------------------------------------------------     
        """

    print(pages)
    llm = ChatCohere()

    promptAction1 = ChatPromptTemplate.from_template(
        f"""
        If the query can be answered from the below pages of different document, respond with a valid JSON containing just one key: "status" with the value "Approved" and not any other data or key.
        If the query does not match the description, respond with a valid JSON containing two keys: "status" with the value "Disapproved" and "message" with required arguments or disapproval of the request if the query doesn't satisfy the description.
        
        Query: {{query}}

        Pages:

        {pages}
        """
    )

    chain  = promptAction1 | llm | SimpleJsonOutputParser()

    # result = chain.invoke({ "query": query })
    result = {}

    for docs in search_result:
        print("Similarity Result:", docs[1])
        if docs[1] > 0.2:
            result["status"] = "Approved"
            return result

    result['status'] = "Disapproved"
    return result



def adjust_prompt_after_error(messages):
    cohere = ChatCohere(model="command-r-plus")
    
    promptAction1 = ChatPromptTemplate.from_template(
        """
        Context:
        {messages}

        Based on the context above, generate a new user query as if it were asked by the user. The query should be related to the information from the most recent messages. 
        If possible try to use the same wordings use in the messages for things, users and places and other nouns.

        Return your response as a JSON object with a single key "prompt" containing the generated query.

        Example output format:
        {{"prompt": "Generated user query here"}}
        """
    )

    chain  = promptAction1 | cohere | SimpleJsonOutputParser()

    previous_messages = ""

    for message in messages[-7:]:
        if isinstance(message, HumanMessage):
            previous_messages += "User: \"" + message.content + "\" \n" 
        elif isinstance(message, AIMessage):   
            previous_messages += "AI: \"" + message.content + "\" \n"
        elif isinstance(message, ToolMessage):   
            previous_messages += ""
        elif isinstance(message, SystemMessage):   
            previous_messages += ""
        elif message['type'] == "human":
            previous_messages += "User: \"" + message["content"] + "\" \n"    
        elif message["type"] == "ai":
            previous_messages += "AI: \"" + message["content"] + "\" \n"

    return chain.invoke({ "messages": previous_messages })
