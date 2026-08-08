import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

# Import routers from routes directory
from routes import auth, users, forms, submissions, analytics, fields, rules, responses, uploads, export, templates, qrcodes, reports, translate
from database import get_db

app = FastAPI(
    title="Low-Code Workflow Automation Backend",
    description="Intelligent Data Collection Platform API",
    version="1.0.0"
)

# Enable CORS for frontend interface communication
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include subrouters
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(forms.router)
app.include_router(fields.router)
app.include_router(rules.router)
app.include_router(submissions.router)
app.include_router(submissions.public_router)
app.include_router(responses.router)
app.include_router(uploads.router)
app.include_router(analytics.router)
app.include_router(export.router)
app.include_router(templates.router)
app.include_router(qrcodes.router)
app.include_router(reports.router)
app.include_router(translate.router)




@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Low-Code Smart Form Builder API!",
        "docs": "/docs"
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Verifies backend API health and active database connection state."""
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )
