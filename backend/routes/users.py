from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import sys
import os

# Add parent directory to path to import schemas, database helpers, models, and security
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import crud
import schemas
import models
import security
from database import get_db

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("", response_model=List[schemas.UserResponse])
@router.get("/", response_model=List[schemas.UserResponse], include_in_schema=False)
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Retrieve list of user accounts (administrator access)."""
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Retrieve details for a specific user account by ID."""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.post("", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Create a new user account (administrator access)."""
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.patch("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Update existing user account attributes by ID."""
    if user_update.email is not None:
        existing_user = crud.get_user_by_email(db, email=user_update.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(status_code=400, detail="Email already in use by another user")

    db_user = crud.update_user(db, user_id=user_id, user_update=user_update)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Delete a user account by ID."""
    success = crud.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User successfully deleted"}
