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
    prefix="/fields",
    tags=["fields"]
)

@router.post("/", response_model=schemas.FieldResponse, status_code=status.HTTP_201_CREATED)
def create_new_field(field: schemas.FieldCreate, db: Session = Depends(get_db)):
    if field.formversion is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="formversion must be specified when creating a field directly."
        )
    return crud.create_field(db=db, field=field)

@router.get("/", response_model=List[schemas.FieldResponse])
def list_all_fields(formversion_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_fields(db=db, formversion_id=formversion_id, skip=skip, limit=limit)

@router.get("/{field_id}", response_model=schemas.FieldResponse)
def read_field(field_id: int, db: Session = Depends(get_db)):
    db_field = crud.get_field(db, field_id=field_id)
    if db_field is None:
        raise HTTPException(status_code=404, detail="Field not found")
    return db_field

@router.patch("/{field_id}", response_model=schemas.FieldResponse)
def patch_field(field_id: int, field_update: schemas.FieldUpdate, db: Session = Depends(get_db)):
    db_field = crud.update_field(db, field_id=field_id, field_update=field_update)
    if db_field is None:
        raise HTTPException(status_code=404, detail="Field not found")
    return db_field

@router.delete("/{field_id}", status_code=status.HTTP_200_OK)
def delete_existing_field(field_id: int, db: Session = Depends(get_db)):
    success = crud.delete_field(db, field_id=field_id)
    if not success:
        raise HTTPException(status_code=404, detail="Field not found")
    return {"message": "Field successfully deleted"}
