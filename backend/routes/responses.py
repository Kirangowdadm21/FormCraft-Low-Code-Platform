from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import schemas
import models
from database import get_db

router = APIRouter(
    prefix="/responses",
    tags=["responses"]
)

@router.get("/", response_model=List[schemas.ResponseValueResponse])
def get_responses(
    submission_id: Optional[int] = None,
    field_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.ResponseValue)
    if submission_id is not None:
        query = query.filter(models.ResponseValue.submission_id == submission_id)
    if field_id is not None:
        query = query.filter(models.ResponseValue.field_id == field_id)
    return query.offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ResponseValueResponse)
def read_response(id: int, db: Session = Depends(get_db)):
    db_resp = db.query(models.ResponseValue).filter(models.ResponseValue.id == id).first()
    if not db_resp:
        raise HTTPException(status_code=404, detail="Response value not found")
    return db_resp

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_response(id: int, db: Session = Depends(get_db)):
    db_resp = db.query(models.ResponseValue).filter(models.ResponseValue.id == id).first()
    if not db_resp:
        raise HTTPException(status_code=404, detail="Response value not found")
    db.delete(db_resp)
    db.commit()
    return {"message": "Response value successfully deleted"}
