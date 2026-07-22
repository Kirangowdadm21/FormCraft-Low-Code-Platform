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
    prefix="/templates",
    tags=["templates"]
)

@router.post("/", response_model=schemas.TemplateResponse, status_code=status.HTTP_201_CREATED)
def create_new_template(template: schemas.TemplateCreate, db: Session = Depends(get_db)):
    return crud.create_template(db=db, template=template)

@router.get("/", response_model=List[schemas.TemplateResponse])
def list_all_templates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_templates(db=db, skip=skip, limit=limit)

@router.get("/{template_id}", response_model=schemas.TemplateResponse)
def read_template(template_id: int, db: Session = Depends(get_db)):
    db_template = crud.get_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return db_template

@router.patch("/{template_id}", response_model=schemas.TemplateResponse)
def patch_template(template_id: int, template_update: schemas.TemplateUpdate, db: Session = Depends(get_db)):
    db_template = crud.update_template(db, template_id=template_id, template_update=template_update)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return db_template

@router.delete("/{template_id}", status_code=status.HTTP_200_OK)
def delete_existing_template(template_id: int, db: Session = Depends(get_db)):
    success = crud.delete_template(db, template_id=template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"message": "Template successfully deleted"}

@router.post("/{template_id}/create-form", response_model=schemas.FormResponse, status_code=status.HTTP_201_CREATED)
def create_form_from_template_endpoint(
    template_id: int,
    owner_id: int,
    override: Optional[schemas.CreateFormFromTemplate] = None,
    db: Session = Depends(get_db)
):
    db_template = crud.get_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Check if user exists
    db_user = crud.get_user(db, user_id=owner_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Owner/User not found")
        
    db_form = crud.create_form_from_template(db=db, template_id=template_id, owner_id=owner_id, override=override)
    return db_form
