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
    prefix="/rules",
    tags=["rules"]
)

@router.post("/", response_model=schemas.ConditionalRuleResponse, status_code=status.HTTP_201_CREATED)
def create_new_rule(rule: schemas.ConditionalRuleCreate, db: Session = Depends(get_db)):
    # Verify that trigger field and targeted field exist
    trigger = crud.get_field(db, field_id=rule.trigger_field)
    if not trigger:
        raise HTTPException(status_code=400, detail="Trigger field does not exist")
    target = crud.get_field(db, field_id=rule.targeted_field)
    if not target:
        raise HTTPException(status_code=400, detail="Targeted field does not exist")
        
    return crud.create_conditional_rule(db=db, rule=rule)

@router.get("/", response_model=List[schemas.ConditionalRuleResponse])
def list_all_rules(trigger_field: Optional[int] = None, targeted_field: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_conditional_rules(db=db, trigger_field=trigger_field, targeted_field=targeted_field, skip=skip, limit=limit)

@router.get("/{rule_id}", response_model=schemas.ConditionalRuleResponse)
def read_rule(rule_id: int, db: Session = Depends(get_db)):
    db_rule = crud.get_conditional_rule(db, rule_id=rule_id)
    if db_rule is None:
        raise HTTPException(status_code=404, detail="Rule not found")
    return db_rule

@router.patch("/{rule_id}", response_model=schemas.ConditionalRuleResponse)
def patch_rule(rule_id: int, rule_update: schemas.ConditionalRuleUpdate, db: Session = Depends(get_db)):
    # Verify fields if they are updated
    if rule_update.trigger_field is not None:
        trigger = crud.get_field(db, field_id=rule_update.trigger_field)
        if not trigger:
            raise HTTPException(status_code=400, detail="Trigger field does not exist")
            
    if rule_update.targeted_field is not None:
        target = crud.get_field(db, field_id=rule_update.targeted_field)
        if not target:
            raise HTTPException(status_code=400, detail="Targeted field does not exist")
            
    db_rule = crud.update_conditional_rule(db=db, rule_id=rule_id, rule_update=rule_update)
    if db_rule is None:
        raise HTTPException(status_code=404, detail="Rule not found")
    return db_rule

@router.delete("/{rule_id}", status_code=status.HTTP_200_OK)
def delete_existing_rule(rule_id: int, db: Session = Depends(get_db)):
    success = crud.delete_conditional_rule(db, rule_id=rule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"message": "Rule successfully deleted"}
