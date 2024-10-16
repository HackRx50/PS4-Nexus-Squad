from pprint import pprint

from fastapi import APIRouter, File, UploadFile, Request, HTTPException
from fastapi import status

from apis.agents.utils import is_used_by_other

from storage.db import Session, engine
from storage.models import KnowledgeDocument
from storage.utils import find_agent_by_name, find_agent_by_id

from apis.nexabot.features import get_vector_store

from .utils import temp_save_file
from apis.nexabot.embeddings import save_embeddings

document_router = APIRouter(prefix="/documents")


@document_router.get("/")
async def getDocuments(request: Request):
    subdomain = request.state.subdomain
    with Session(engine) as session:
        documents = KnowledgeDocument.get_documents_by_agent_name(session=session,agent_name=subdomain)
        return {
            "documents": documents
        }

@document_router.post("/")
async def upload_document(request: Request, file: UploadFile = File()):
    try:
        subdomain = request.state.subdomain
        with Session(engine) as session:
            agent = find_agent_by_name(session=session, name=subdomain)
            if is_used_by_other(subdomain):
                file_path = await temp_save_file(file)
                ids = save_embeddings(filepath=file_path, agent_name=subdomain)
                document = KnowledgeDocument.create(name=file.filename, type=file.content_type, agent_id=agent.agid, ids=ids)
                pprint(document.name)
                return {"message": "Creation Successful", "data": document}
            else:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Agent not found")
    except HTTPException as he:
        print(he)
        raise he
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")


    
@document_router.delete("/{document_id}")
async def deleteDocument(document_id: str):
    try: 
        with Session(engine) as session:
            document = session.query(KnowledgeDocument).filter(KnowledgeDocument.did == document_id).first()
            agent = find_agent_by_id(document.agent)
            vector_store = get_vector_store(agent_name=agent.name)
            vector_store.delete(document.vector_ids)
            session.delete(document)
            session.commit()
        return {"message": f"Document with id: {document_id} deleted", "document_id": document_id}
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document doesn't exists")
