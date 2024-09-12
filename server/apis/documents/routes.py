from fastapi import APIRouter, File, UploadFile

document_router = APIRouter(prefix="/documents")

@document_router.post("/")
def upload_document(file: UploadFile = File()):
    pass