from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import crud
import schemas
import models
import security
from database import get_db

router = APIRouter(
    prefix="/forms",
    tags=["forms"]
)

@router.post("/", response_model=schemas.FormResponse, status_code=status.HTTP_201_CREATED)
def create_new_form(
    form: schemas.FormCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    return crud.create_form(db=db, form=form, owner_id=current_user.id)

@router.get("/", response_model=List[schemas.FormResponse])
def list_all_forms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    forms = crud.get_forms(db=db, skip=skip, limit=limit)
    return [schemas.FormResponse.from_orm_with_count(f) for f in forms]

# NOTE: /public/{form_id} MUST be declared before /{form_id} to avoid route shadowing
@router.get("/public/{form_id}", response_model=schemas.PublicFormResponse)
def get_public_form(form_id: int, db: Session = Depends(get_db)):
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

    sorted_fields = db.query(models.Field).filter(
        models.Field.formversion == version.id
    ).order_by(models.Field.display_order.asc(), models.Field.id.asc()).all()

    field_ids = [f.id for f in sorted_fields]
    rules = []
    if field_ids:
        rules = db.query(models.ConditionalRule).filter(
            (models.ConditionalRule.trigger_field.in_(field_ids)) |
            (models.ConditionalRule.targeted_field.in_(field_ids))
        ).all()

    return {
        "id": db_form.id,
        "title": db_form.title,
        "description": db_form.description,
        "current_version": db_form.current_version,
        "fields": sorted_fields,
        "rules": rules
    }

@router.get("/{form_id}", response_model=schemas.FormResponse)
def read_form(form_id: int, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return schemas.FormResponse.from_orm_with_count(db_form)

@router.post("/{form_id}/versions", response_model=schemas.FormVersionResponse, status_code=status.HTTP_201_CREATED)
def add_new_version(
    form_id: int,
    version: schemas.FormVersionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_form = crud.get_form(db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud.create_form_version(db=db, form_id=form_id, version=version)

@router.patch("/{form_id}", response_model=schemas.FormResponse)
def patch_form(
    form_id: int,
    form_update: schemas.FormUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_form = crud.update_form(db, form_id=form_id, form_update=form_update)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@router.delete("/{form_id}", status_code=status.HTTP_200_OK)
def delete_existing_form(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    success = crud.delete_form(db, form_id=form_id)
    if not success:
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Form successfully deleted"}

@router.post("/{form_id}/publish", status_code=status.HTTP_200_OK)
def publish_existing_form(
    form_id: int,
    version_number: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_form = crud.publish_form(db=db, form_id=form_id, version_number=version_number)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return {
        "message": "Form successfully published",
        "publish_url": f"/forms/public/{form_id}",
        "status": db_form.status,
        "current_version": db_form.current_version
    }

@router.get("/{form_id}/versions", response_model=List[schemas.FormVersionResponse])
def get_versions(form_id: int, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud.get_form_versions(db=db, form_id=form_id)

@router.post("/{form_id}/archive", response_model=schemas.FormResponse)
def archive_existing_form(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_form = crud.archive_form(db=db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@router.post("/{form_id}/unarchive", response_model=schemas.FormResponse)
def unarchive_existing_form(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_form = crud.unarchive_form(db=db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form


