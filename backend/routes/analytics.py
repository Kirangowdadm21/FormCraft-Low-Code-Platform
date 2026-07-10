from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import crud
from database import get_db

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)

@router.get("/form/{form_id}")
def read_form_analytics(form_id: int, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud.get_submission_analytics(db=db, form_id=form_id)
