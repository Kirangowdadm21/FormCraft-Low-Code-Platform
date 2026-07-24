from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
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
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user or administrator account."""
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=schemas.Token)
def login_user(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate user credentials and return JWT access token."""
    db_user = crud.get_user_by_email(db, email=credentials.email)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not security.verify_password(credentials.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    access_token = security.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login-form", response_model=schemas.Token, include_in_schema=False)
def login_user_form(credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 Form submission endpoint for native Swagger UI login."""
    db_user = crud.get_user_by_email(db, email=credentials.username)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not security.verify_password(credentials.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    access_token = security.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(security.get_current_user)):
    """Retrieve profile details of currently authenticated user."""
    return current_user

@router.post("/logout")
def logout_user(token: str = Depends(security.oauth2_scheme), db: Session = Depends(get_db)):
    """Revoke JWT access token on user logout."""
    payload = security.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        
    exp = payload.get("exp")
    if exp:
        expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)
    else:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=60)
        
    crud.revoke_token(db, token=token, expires_at=expires_at)
    return {"message": "Successfully logged out"}
