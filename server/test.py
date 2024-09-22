from langgraph.prebuilt import create_react_agent
from langchain_cohere import ChatCohere
from langchain_community.tools import tool
from dotenv import load_dotenv
load_dotenv()
from langchain_core.messages import HumanMessage, SystemMessage
import asyncio
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse

from pprint import pprint

cohere = ChatCohere()

tools = []


def get_geocoding(city: str) -> list:
    """
    Retrieve latitude and longitude of a city via API.

    Args:
        city (str): City name.

    Returns:
        list: A list of geocoding data containing 'name', 'latitude', 'longitude', and 'country'.
              Example:
              [
                  {
                      "name": "City Name",
                      "latitude": 12.34,
                      "longitude": 56.78,
                      "country": "Country Name"
                  }
              ]
              
              Prints error message and status code if the request fails.
    """

    import requests
    api_url = 'https://api.api-ninjas.com/v1/geocoding?city={}'.format(city)
    response = requests.get(api_url, headers={'X-Api-Key': "xcLLDR96ebzrnjNcKFyf4WT5qHsOakdYdzTBLkYu"})
    if response.status_code == requests.codes.ok:
        return response.json()
    else:
        print("Error:", response.status_code, response.text)

tools = [tool(get_geocoding)]


agent = create_react_agent(model=cohere, tools=tools)

systemMessageContent = """
    You are Nexabot, a helpful AI Assistant. Your task is to help users execute tasks and query data for relevant information, converting it into an easily understandable format.

    Guidelines for Answering Questions:

    Tool Usage:

    If no tools are available for the query, always use the search tool to find relevant information.
    If no relevant information is found in the search results, inform the user by saying, "No results were found for the queried information."
    Do not mention the source, metadata, or display a list of documents to the user.
    Prioritize Other Tools:

    If other tools besides the search tool are available, use them as the primary method to answer the query.
    Response Style:

    Always simplify complex information into easy-to-understand language.
    Only provide information that is directly relevant to the user's query.
    Do not share unnecessary details about internal processes or tool outputs.
    Fallback:

    If you are unable to generate a suitable response, inform the user with: "I'm unable to find the relevant information at the moment."
"""

def process_stream(stream):
    try:
        for chunk in stream:
            if 'agent' in chunk:
                for message in chunk['agent']['messages']:
                    yield message.json()
            if 'tools' in chunk:
                for message in chunk['tools']['messages']:
                    yield message.json()
    except Exception as e:
        print(f"An error occurred: {e}")

app = FastAPI()

@app.get("/stream")
def get_message():
    stream = agent.stream({"messages": [SystemMessage(content=systemMessageContent), HumanMessage(content="What is the geocoding of indore")]})
    return StreamingResponse(process_stream(stream), media_type="text/plain")


# if __name__=="__main__":
#     asyncio.run(main())