import os
import time
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from langchain_mistralai.embeddings import MistralAIEmbeddings

load_dotenv()

pinecone_api_key = os.getenv("PINECONE_API_KEY")

if not pinecone_api_key:
    raise ValueError("PINECONE_API_KEY is not set")

pc = Pinecone(api_key=pinecone_api_key)

index_name = "langchain-test-index" 

existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

if index_name not in existing_indexes:
    pc.create_index(
        name=index_name,
        dimension=1024,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    while not pc.describe_index(index_name).status["ready"]:
        time.sleep(1)

index = pc.Index(index_name)



# geo encoding 

def get_geocoding(city):
    """
    Get the latitude and longitude geocoding of a city and country

    Args:
        city (str): The city name

    Returns:
        list: The latitude and longitude of the related city name
    """


    import requests
    api_url = 'https://api.api-ninjas.com/v1/geocoding?city={}'.format(city)
    response = requests.get(api_url + city, headers={'X-Api-Key': "meaUO1Ucu4ZTlk7qtQMibA==cpyHoWVnOLLm6QW2"})
    if response.status_code == requests.codes.ok:
        return response.json()
    else:
        print("Error:", response.status_code, response.text)
