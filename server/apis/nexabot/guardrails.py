from .embeddings import get_action_vector_store, get_vector_store
from .utils import execution_time

from langchain_cohere import ChatCohere

from langchain_community.docstore.document import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain.output_parsers.json import SimpleJsonOutputParser

@execution_time
def can_perform(query: str, agent_name: str):
    vc_store = get_action_vector_store(agent_name)
    results = vc_store.similarity_search(query, k=1)
    return results

@execution_time
def check_approval(query: str, doc: Document):
    llm = ChatCohere()

    promptAction1 = ChatPromptTemplate.from_template(
        f'''
        Description: {doc.page_content}
        
        If the query matches the description, respond with a valid JSON containing just one key: "status" with the value "Approved" and not any other data or key.
        If the query does not match the description, respond with a valid JSON containing two keys: "status" with the value "Disapproved" and "message" with a short reason for disapproval.
        {{query}}
        '''
    )

    chain  = promptAction1 | llm | SimpleJsonOutputParser()

    result = chain.invoke({ "query": query })

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
    search_result = vc_store.similarity_search_with_relevance_scores(query, k=8)

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
        If the query does not match the description, respond with a valid JSON containing two keys: "status" with the value "Disapproved".
        
        Query: {{query}}

        Pages:

        {pages}
        """
    )

    chain  = promptAction1 | llm | SimpleJsonOutputParser()

    result = chain.invoke({ "query": query })

    return result

