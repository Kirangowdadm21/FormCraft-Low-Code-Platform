import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment configuration from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/smart_forms")

# Create engine
engine = create_engine(DATABASE_URL)

# SessionLocal for database operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative SQLAlchemy models
Base = declarative_base()

def get_db():
    """Dependency helper to yield DB sessions to route handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
