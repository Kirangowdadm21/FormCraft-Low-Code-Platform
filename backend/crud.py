from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import uuid
import datetime
import models
import schemas
import security


# ==========================================
# USER CRUD
# ==========================================
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.hash_password(user.password)
    db_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def is_token_revoked(db: Session, token: str) -> bool:
    return db.query(models.RevokedToken).filter(models.RevokedToken.token == token).first() is not None

def revoke_token(db: Session, token: str, expires_at: datetime.datetime):
    db_token = models.RevokedToken(token=token, expires_at=expires_at)
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token


# ==========================================
# FORM CRUD
# ==========================================
def get_form(db: Session, form_id: int):
    return db.query(models.Form).filter(models.Form.id == form_id).first()

def get_forms(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Form).offset(skip).limit(limit).all()

def create_form(db: Session, form: schemas.FormCreate, owner_id: int):
    db_form = models.Form(
        title=form.title,
        description=form.description,
        status=form.status,
        owner_id=owner_id
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    
    if form.initial_version:
        create_form_version(db, db_form.id, form.initial_version)
        
    return db_form

def create_form_version(db: Session, form_id: int, version: schemas.FormVersionCreate):
    # Get last version number
    last_version = db.query(func.max(models.FormVersion.version_number)).filter(models.FormVersion.formid == form_id).scalar()
    next_ver = 1 if last_version is None else last_version + 1
    
    db_version = models.FormVersion(
        formid=form_id,
        version_number=next_ver,
        ispublished=version.ispublished,
        publishedat=datetime.datetime.utcnow() if version.ispublished else None
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    
    # Create fields
    for field_data in version.fields:
        db_field = models.Field(
            formversion=db_version.id,
            label=field_data.label,
            field_name=field_data.field_name,
            field_type=field_data.field_type,
            placeholder=field_data.placeholder,
            required=field_data.required,
            display_order=field_data.display_order,
            validation_conf=field_data.validation_conf
        )
        db.add(db_field)
        db.commit()
        db.refresh(db_field)
        
        # Create field options if any
        if field_data.options:
            for option_data in field_data.options:
                db_option = models.FieldOption(
                    field_id=db_field.id,
                    optiontext=option_data.optiontext,
                    value=option_data.value,
                    display_order=option_data.display_order
                )
                db.add(db_option)
    
    db.commit()
    
    # If published, update current_version on form
    if version.ispublished:
        form = db.query(models.Form).filter(models.Form.id == form_id).first()
        form.current_version = next_ver
        form.status = "published"
        db.commit()
        
    return db_version

# ==========================================
# SUBMISSION CRUD
# ==========================================
def create_submission(db: Session, submission: schemas.SubmissionCreate):
    sub_uuid = str(uuid.uuid4())
    db_sub = models.Submission(
        form_version=submission.form_version,
        submission_id=sub_uuid,
        submitted_by=submission.submitted_by,
        status="submitted",
        submitted_at=datetime.datetime.utcnow()
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    
    # Store response values
    for resp in submission.responses:
        db_resp = models.ResponseValue(
            submission_id=db_sub.id,
            field_id=resp.field_id,
            value=resp.value,
            uploaded_file=resp.uploaded_file
        )
        db.add(db_resp)
        
    db.commit()
    db.refresh(db_sub)
    return db_sub

def get_submissions(db: Session, form_version_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Submission)
    if form_version_id:
        query = query.filter(models.Submission.form_version == form_version_id)
    return query.offset(skip).limit(limit).all()

# ==========================================
# ANALYTICS CRUD
# ==========================================
def get_submission_analytics(db: Session, form_id: int):
    # Total submissions across all versions
    total_subs = db.query(models.Submission)\
        .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
        .filter(models.FormVersion.formid == form_id)\
        .count()
        
    # Started vs Completed
    started_count = db.query(models.Submission)\
        .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
        .filter(models.FormVersion.formid == form_id, models.Submission.status == "started")\
        .count()
        
    submitted_count = db.query(models.Submission)\
        .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
        .filter(models.FormVersion.formid == form_id, models.Submission.status == "submitted")\
        .count()

    return {
        "form_id": form_id,
        "total_submissions": total_subs,
        "started": started_count,
        "completed": submitted_count,
        "completion_rate": (submitted_count / (started_count + submitted_count) * 100) if (started_count + submitted_count) > 0 else 0
    }

def update_form(db: Session, form_id: int, form_update: schemas.FormUpdate):
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not db_form:
        return None
    for key, value in form_update.model_dump(exclude_unset=True).items():
        setattr(db_form, key, value)
    db.commit()
    db.refresh(db_form)
    return db_form

def delete_form(db: Session, form_id: int) -> bool:
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not db_form:
        return False
    db.delete(db_form)
    db.commit()
    return True

# ==========================================
# FIELD CRUD
# ==========================================
def get_field(db: Session, field_id: int):
    return db.query(models.Field).filter(models.Field.id == field_id).first()

def get_fields(db: Session, formversion_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Field)
    if formversion_id is not None:
        query = query.filter(models.Field.formversion == formversion_id)
    return query.offset(skip).limit(limit).all()

def create_field(db: Session, field: schemas.FieldCreate):
    db_field = models.Field(
        formversion=field.formversion,
        label=field.label,
        field_name=field.field_name,
        field_type=field.field_type,
        placeholder=field.placeholder,
        required=field.required,
        display_order=field.display_order,
        validation_conf=field.validation_conf
    )
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    
    if field.options:
        for option_data in field.options:
            db_option = models.FieldOption(
                field_id=db_field.id,
                optiontext=option_data.optiontext,
                value=option_data.value,
                display_order=option_data.display_order
            )
            db.add(db_option)
        db.commit()
        db.refresh(db_field)
        
    return db_field

def update_field(db: Session, field_id: int, field_update: schemas.FieldUpdate):
    db_field = db.query(models.Field).filter(models.Field.id == field_id).first()
    if not db_field:
        return None
    
    update_data = field_update.model_dump(exclude_unset=True)
    options_data = update_data.pop("options", None)
    
    for key, value in update_data.items():
        setattr(db_field, key, value)
        
    if options_data is not None:
        db_field.options.clear()
        for option in options_data:
            db_option = models.FieldOption(
                optiontext=option.get("optiontext") if isinstance(option, dict) else option.optiontext,
                value=option.get("value") if isinstance(option, dict) else option.value,
                display_order=option.get("display_order", 0) if isinstance(option, dict) else option.display_order
            )
            db_field.options.append(db_option)
            
    db.commit()
    db.refresh(db_field)
    return db_field

def delete_field(db: Session, field_id: int) -> bool:
    db_field = db.query(models.Field).filter(models.Field.id == field_id).first()
    if not db_field:
        return False
    db.delete(db_field)
    db.commit()
    return True

def archive_form(db: Session, form_id: int):
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not db_form:
        return None
    db_form.status = "archived"
    db.commit()
    db.refresh(db_form)
    return db_form

def publish_form(db: Session, form_id: int, version_number: Optional[int] = None):
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not db_form:
        return None
    
    if version_number:
        version = db.query(models.FormVersion).filter(
            models.FormVersion.formid == form_id,
            models.FormVersion.version_number == version_number
        ).first()
    else:
        version = db.query(models.FormVersion).filter(
            models.FormVersion.formid == form_id
        ).order_by(models.FormVersion.version_number.desc()).first()
        
    if not version:
        version = models.FormVersion(
            formid=form_id,
            version_number=1,
            ispublished=True,
            publishedat=datetime.datetime.utcnow()
        )
        db.add(version)
        db.commit()
        db.refresh(version)
    else:
        version.ispublished = True
        version.publishedat = datetime.datetime.utcnow()
        
    db_form.current_version = version.version_number
    db_form.status = "published"
    db.commit()
    db.refresh(db_form)
    return db_form

def get_form_versions(db: Session, form_id: int):
    return db.query(models.FormVersion).filter(models.FormVersion.formid == form_id).order_by(models.FormVersion.version_number.asc()).all()

# ==========================================
# CONDITIONAL RULES CRUD
# ==========================================
def create_conditional_rule(db: Session, rule: schemas.ConditionalRuleCreate):
    db_rule = models.ConditionalRule(
        trigger_field=rule.trigger_field,
        operator=rule.operator,
        comparison=rule.comparison,
        targeted_field=rule.targeted_field,
        action=rule.action,
        logical_group=rule.logical_group
    )
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

def get_conditional_rule(db: Session, rule_id: int):
    return db.query(models.ConditionalRule).filter(models.ConditionalRule.id == rule_id).first()

def get_conditional_rules(db: Session, trigger_field: Optional[int] = None, targeted_field: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.ConditionalRule)
    if trigger_field is not None:
        query = query.filter(models.ConditionalRule.trigger_field == trigger_field)
    if targeted_field is not None:
        query = query.filter(models.ConditionalRule.targeted_field == targeted_field)
    return query.offset(skip).limit(limit).all()

def update_conditional_rule(db: Session, rule_id: int, rule_update: schemas.ConditionalRuleUpdate):
    db_rule = db.query(models.ConditionalRule).filter(models.ConditionalRule.id == rule_id).first()
    if not db_rule:
        return None
    for key, value in rule_update.model_dump(exclude_unset=True).items():
        setattr(db_rule, key, value)
    db.commit()
    db.refresh(db_rule)
    return db_rule

def delete_conditional_rule(db: Session, rule_id: int) -> bool:
    db_rule = db.query(models.ConditionalRule).filter(models.ConditionalRule.id == rule_id).first()
    if not db_rule:
        return False
    db.delete(db_rule)
    db.commit()
    return True


