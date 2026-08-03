from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import crud
import schemas
import models
import uuid
import datetime
from datetime import timezone
from database import get_db

router = APIRouter(
    prefix="/submissions",
    tags=["submissions"]
)

public_router = APIRouter(
    tags=["public"]
)

@router.post("/", response_model=schemas.SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_response(submission: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    # Verify form version exists
    version = db.query(models.FormVersion).filter(models.FormVersion.id == submission.form_version).first()
    if not version:
        raise HTTPException(status_code=404, detail="Form version not found")
    return crud.create_submission(db=db, submission=submission)

@router.get("/", response_model=List[schemas.SubmissionResponse])
def get_form_submissions(form_version_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_submissions(db=db, form_version_id=form_version_id, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas.SubmissionResponse)
def read_submission(id: int, db: Session = Depends(get_db)):
    db_sub = db.query(models.Submission).filter(models.Submission.id == id).first()
    if not db_sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return db_sub

@public_router.post("/public/forms/{token}/submit", response_model=schemas.SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_public_form(token: str, submission_data: schemas.SubmissionCreatePublic, db: Session = Depends(get_db)):
    try:
        form_id = int(token)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid form token format")

    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")

    if db_form.status != "published" or db_form.current_version is None:
        raise HTTPException(status_code=400, detail="Form is not published or is not public")

    version = db.query(models.FormVersion).filter(
        models.FormVersion.formid == form_id,
        models.FormVersion.version_number == db_form.current_version
    ).first()

    if not version:
        raise HTTPException(status_code=404, detail="Form version not found")

    # Validate required fields
    version_fields = {f.id: f for f in version.fields}
    provided_fields = {r.field_id for r in submission_data.responses}

    for field_id, field in version_fields.items():
        if field.required and field_id not in provided_fields:
            raise HTTPException(status_code=400, detail=f"Required field '{field.label}' (ID: {field_id}) is missing.")

    # Create submission record
    sub_uuid = str(uuid.uuid4())
    db_sub = models.Submission(
        form_version=version.id,
        submission_id=sub_uuid,
        submitted_by=None,
        status="submitted",
        submitted_at=datetime.datetime.now(timezone.utc)
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)

    # Store responses
    for resp in submission_data.responses:
        if resp.field_id not in version_fields:
            raise HTTPException(status_code=400, detail=f"Field ID {resp.field_id} does not belong to this form version")
        
        db_resp = models.ResponseValue(
            submission_id=db_sub.id,
            field_id=resp.field_id,
            value=resp.value,
            uploaded_file=resp.uploaded_file
        )
        db.add(db_resp)
    
    db.commit()
    db.refresh(db_sub)
    return db_sub

