from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import uuid
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import schemas
import models
from database import get_db

router = APIRouter(
    prefix="/uploads",
    tags=["uploads"]
)

# Store uploaded files in the configured uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

@router.post("/", response_model=schemas.UploadedFileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Ensure directory exists
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    # Generate a unique filename to avoid collision, keeping original extension
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Read and write content
    try:
        content = await file.read()
        file_size = len(content)
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save file: {str(e)}")

    # Save metadata to DB
    db_file = models.UploadedFile(
        filename=file.filename,
        file_path=file_path,
        mime_type=file.content_type or "application/octet-stream",
        size=file_size
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

@router.get("/{id}", response_model=schemas.UploadedFileResponse)
def get_upload_metadata(id: int, db: Session = Depends(get_db)):
    db_file = db.query(models.UploadedFile).filter(models.UploadedFile.id == id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="Uploaded file not found")
    return db_file

@router.get("/{id}/download")
def download_upload_file(id: int, db: Session = Depends(get_db)):
    db_file = db.query(models.UploadedFile).filter(models.UploadedFile.id == id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="Uploaded file not found")
    if not os.path.exists(db_file.file_path):
        raise HTTPException(status_code=404, detail="File on disk not found")
    return FileResponse(
        path=db_file.file_path,
        filename=db_file.filename,
        media_type=db_file.mime_type
    )
