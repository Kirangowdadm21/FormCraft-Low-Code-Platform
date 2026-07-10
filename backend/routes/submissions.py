from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import crud
import schemas
from database import get_db

router = APIRouter(
    prefix="/submissions",
    tags=["submissions"]
)

@router.post("/", response_model=schemas.SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_response(submission: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    # Server-side validation of field requirements can happen here before creation
    return crud.create_submission(db=db, submission=submission)

@router.get("/", response_model=List[schemas.SubmissionResponse])
def get_form_submissions(form_version_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_submissions(db=db, form_version_id=form_version_id, skip=skip, limit=limit)
