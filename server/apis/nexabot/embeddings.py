import os
import time

from fastapi import HTTPException

from pinecone import Pinecone, ServerlessSpec
# from langchain_mistralai.embeddings import MistralAIEmbeddings
from langchain_cohere import CohereEmbeddings
from langchain_pinecone import PineconeVectorStore
import cuid

from typing import List

from langchain_community.docstore.document import Document

from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import (
    UnstructuredHTMLLoader,
    PyPDFLoader,
    JSONLoader,
    UnstructuredMarkdownLoader,
    AzureAIDocumentIntelligenceLoader,
    TextLoader,
)

from settings import PINECONE_INDEX_NAME, PINECONE_ACTION_INDEX_NAME, PINECONE_SESSION_DOCUMENT_INDEX_NAME


supported_extensions = [
    "txt",
    "md",
    "docx",
    "xlsx",
    "pptx",
    "pdf",
    "html",
    "csv",
    "json",
]


def load_documents(filepath: str):
    ext = filepath.split(".")[-1].lower()
    if ext == "txt":
        return load_text_documents(filepath)
    elif ext == "md":
        return load_md_documents(filepath)
    elif ext in ["docx", "xlsx", "pptx"]:
        return load_ms_office_documents(filepath)
    elif ext == "pdf":
        return load_pdf_documents(filepath)
    elif ext == "html":
        return load_html_documents(filepath)
    elif ext == "csv":
        return load_csv_documents(filepath)
    else:
        raise HTTPException(401, f"Unsupported file extension: {ext}")


def save_embeddings(filepath: str, agent_name: str):
    is_supported(filepath)
    vector_store = get_vector_store(agent_name=agent_name)
    documents = load_documents(filepath)
    cuids = generate_ids(len(documents))
    ids = vector_store.add_documents(documents=documents, ids=cuids)
    os.remove(filepath)
    return ids

def save_session_document_embeddings(filepath: str, session_id: str):
    is_supported(filepath)
    vector_store = get_session_document_vector_store(session_id=session_id)
    documents = load_documents(filepath)
    cuids = generate_ids(len(documents))
    ids = vector_store.add_documents(documents=documents, ids=cuids)
    os.remove(filepath)
    return ids


def save_action_description(description: str, agent_id: str):
    vector_store = get_action_vector_store(agent_name=agent_id)
    cuids = generate_ids(1)
    ids = vector_store.add_documents([Document(page_content=description)], ids=cuids)
    return ids

def get_session_document_vector_store(session_id: str) -> PineconeVectorStore:
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    if not pinecone_api_key:
        raise ValueError("PINECONE_API_KEY is not set")

    pc = Pinecone(api_key=pinecone_api_key)

    # embedding_model = MistralAIEmbeddings(model="mistral-embed")
    embedding_model = CohereEmbeddings(model="embed-english-v3.0")
    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

    if PINECONE_SESSION_DOCUMENT_INDEX_NAME not in existing_indexes:
        print("Index Not Found!")

        print("Creating Index...")
        pc.create_index(
            name=PINECONE_SESSION_DOCUMENT_INDEX_NAME,
            dimension=1024,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )

    while not pc.describe_index(PINECONE_SESSION_DOCUMENT_INDEX_NAME).status["ready"]:
        time.sleep(1)

    index = pc.Index(PINECONE_SESSION_DOCUMENT_INDEX_NAME)
    vector_store = PineconeVectorStore(
        index=index, embedding=embedding_model, namespace=session_id
    )
    return vector_store


def get_action_vector_store(agent_name: str) -> PineconeVectorStore:
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    if not pinecone_api_key:
        raise ValueError("PINECONE_API_KEY is not set")

    pc = Pinecone(api_key=pinecone_api_key)

    # embedding_model = MistralAIEmbeddings(model="mistral-embed")
    embedding_model = CohereEmbeddings(model="embed-english-v3.0")
    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

    if PINECONE_ACTION_INDEX_NAME not in existing_indexes:
        print("Index Not Found!")

        print("Creating Index...")
        pc.create_index(
            name=PINECONE_ACTION_INDEX_NAME,
            dimension=1024,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )

    while not pc.describe_index(PINECONE_ACTION_INDEX_NAME).status["ready"]:
        time.sleep(1)

    index = pc.Index(PINECONE_ACTION_INDEX_NAME)
    vector_store = PineconeVectorStore(
        index=index, embedding=embedding_model, namespace=agent_name
    )
    return vector_store


def get_vector_store(agent_name: str) -> PineconeVectorStore:
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    if not pinecone_api_key:
        raise ValueError("PINECONE_API_KEY is not set")

    pc = Pinecone(api_key=pinecone_api_key)

    # embedding_model = MistralAIEmbeddings(model="mistral-embed")
    embedding_model = CohereEmbeddings(model="embed-english-v3.0")
    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

    if PINECONE_INDEX_NAME not in existing_indexes:
        print("Index Not Found!")

        print("Creating Index...")
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=1024,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )

    while not pc.describe_index(PINECONE_INDEX_NAME).status["ready"]:
        time.sleep(1)

    index = pc.Index(PINECONE_INDEX_NAME)
    vector_store = PineconeVectorStore(
        index=index, embedding=embedding_model, namespace=agent_name
    )
    return vector_store


__all__ = ["save_embeddings", "get_vector_store"]


def load_text_documents(filepath: str):
    loader = TextLoader(filepath)
    documents = loader.load()
    return documents

def load_md_documents(filepath: str):
    loader = UnstructuredMarkdownLoader(filepath)
    documents = loader.load()
    return documents


def load_ms_office_documents(filepath: str):
    endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")
    key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_APIKEY")
    loader = AzureAIDocumentIntelligenceLoader(
        api_endpoint=endpoint,
        api_key=key,
        file_path=filepath,
        api_model="prebuilt-layout",
    )
    documents = loader.load()
    return documents


def load_pdf_documents(filepath: str):
    loader = PyPDFLoader(filepath)
    pages = loader.load_and_split()
    return pages


def load_html_documents(filepath: str):
    loader = UnstructuredHTMLLoader(filepath)
    documents = loader.load()
    return documents


def load_json_documents(filepath: str):
    # Incomplete Can't Use
    raise NotImplementedError()
    loader = JSONLoader(file_path=filepath, jq_schema=".content", text_content=False)
    documents = loader.load()
    return documents


def load_csv_documents(filepath: str):
    loader = CSVLoader(file_path=filepath)
    documents = loader.load_and_split()
    return documents


def generate_ids(ids_count: str):
    return [str(cuid.cuid()) for _ in range(ids_count)]


def is_supported(filename: str):
    ext = filename.split(".")[-1].lower()
    print(ext)
    if ext in supported_extensions:
        return True
    raise ValueError(f"Unsupported file extension: {ext}")
