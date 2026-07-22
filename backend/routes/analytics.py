from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import crud
import schemas
import models
from database import get_db

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)

@router.get("/dashboard", response_model=schemas.DashboardAnalytics)
def get_dashboard_analytics(db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_forms = db.query(models.Form).count()
    published_forms = db.query(models.Form).filter(models.Form.status == "published").count()
    archived_forms = db.query(models.Form).filter(models.Form.status == "archived").count()
    draft_forms = db.query(models.Form).filter(models.Form.status == "draft").count()
    
    total_submissions = db.query(models.Submission).count()
    started_submissions = db.query(models.Submission).filter(models.Submission.status == "started").count()
    submitted_submissions = db.query(models.Submission).filter(models.Submission.status == "submitted").count()
    
    completion_rate = (submitted_submissions / total_submissions * 100.0) if total_submissions > 0 else 0.0
    
    return {
        "total_users": total_users,
        "total_forms": total_forms,
        "published_forms": published_forms,
        "archived_forms": archived_forms,
        "draft_forms": draft_forms,
        "total_submissions": total_submissions,
        "started_submissions": started_submissions,
        "submitted_submissions": submitted_submissions,
        "completion_rate": completion_rate
    }

@router.get("/forms/{id}", response_model=schemas.FormAnalytics)
def get_form_analytics(id: int, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    version_count = db.query(models.FormVersion).filter(models.FormVersion.formid == id).count()
    
    total_submissions = db.query(models.Submission)\
        .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
        .filter(models.FormVersion.formid == id)\
        .count()
        
    started_submissions = db.query(models.Submission)\
        .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
        .filter(models.FormVersion.formid == id, models.Submission.status == "started")\
        .count()
        
    completed_submissions = db.query(models.Submission)\
        .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
        .filter(models.FormVersion.formid == id, models.Submission.status == "submitted")\
        .count()
        
    completion_rate = (completed_submissions / total_submissions * 100.0) if total_submissions > 0 else 0.0
    
    return {
        "form_id": id,
        "title": form.title,
        "status": form.status,
        "version_count": version_count,
        "total_submissions": total_submissions,
        "started_submissions": started_submissions,
        "completed_submissions": completed_submissions,
        "completion_rate": completion_rate
    }

@router.get("/trend", response_model=List[schemas.SubmissionTrendItem])
def get_submission_trend(interval: str = "daily", form_id: Optional[int] = None, db: Session = Depends(get_db)):
    if interval not in ("daily", "monthly"):
        raise HTTPException(status_code=400, detail="Interval must be 'daily' or 'monthly'")
        
    query = db.query(models.Submission)
    if form_id is not None:
        query = query.join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
                     .filter(models.FormVersion.formid == form_id)
                     
    submissions = query.all()
    
    from collections import defaultdict
    trend_dict = defaultdict(int)
    
    for sub in submissions:
        dt = sub.started_at
        if not dt:
            continue
        if interval == "monthly":
            key = dt.strftime("%Y-%m")
        else:
            key = dt.strftime("%Y-%m-%d")
        trend_dict[key] += 1
        
    trend_data = []
    for k in sorted(trend_dict.keys()):
        if interval == "daily":
            trend_data.append({"date": k, "count": trend_dict[k]})
        else:
            trend_data.append({"month": k, "count": trend_dict[k]})
            
    return trend_data

@router.get("/form/{form_id}")
def read_form_analytics(form_id: int, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud.get_submission_analytics(db=db, form_id=form_id)

