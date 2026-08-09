from pydantic import BaseModel, EmailStr, Field as PydanticField
from typing import List, Optional, Any
from datetime import datetime

# ==========================================
# USER SCHEMAS
# ==========================================
class UserBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: EmailStr
    role: str = "user"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# AUTH SCHEMAS
# ==========================================
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# ==========================================
# FIELD OPTIONS SCHEMAS
# ==========================================
class FieldOptionBase(BaseModel):
    optiontext: str
    value: str
    display_order: int = 0

class FieldOptionCreate(FieldOptionBase):
    pass

class FieldOptionResponse(FieldOptionBase):
    id: int
    field_id: int

    class Config:
        from_attributes = True

# ==========================================
# FIELD SCHEMAS
# ==========================================
class FieldBase(BaseModel):
    label: str
    field_name: str
    field_type: str
    placeholder: Optional[str] = None
    required: bool = False
    display_order: int = 0
    validation_conf: Optional[dict] = None

class FieldCreate(FieldBase):
    formversion: Optional[int] = None
    options: Optional[List[FieldOptionCreate]] = None

class FieldUpdate(BaseModel):
    formversion: Optional[int] = None
    label: Optional[str] = None
    field_name: Optional[str] = None
    field_type: Optional[str] = None
    placeholder: Optional[str] = None
    required: Optional[bool] = None
    display_order: Optional[int] = None
    validation_conf: Optional[dict] = None
    options: Optional[List[FieldOptionCreate]] = None


class FieldResponse(FieldBase):
    id: int
    formversion: int
    createdat: datetime
    updatedat: datetime
    options: List[FieldOptionResponse] = []

    class Config:
        from_attributes = True

# ==========================================
# CONDITIONAL RULES SCHEMAS
# ==========================================
class ConditionalRuleBase(BaseModel):
    trigger_field: int
    operator: str
    comparison: Optional[str] = None
    targeted_field: int
    action: str
    logical_group: Optional[str] = None

class ConditionalRuleCreate(ConditionalRuleBase):
    pass

class ConditionalRuleResponse(ConditionalRuleBase):
    id: int

    class Config:
        from_attributes = True

class ConditionalRuleUpdate(BaseModel):
    trigger_field: Optional[int] = None
    operator: Optional[str] = None
    comparison: Optional[str] = None
    targeted_field: Optional[int] = None
    action: Optional[str] = None
    logical_group: Optional[str] = None


# ==========================================
# FORM VERSION SCHEMAS
# ==========================================
class FormVersionBase(BaseModel):
    version_number: int
    ispublished: bool = False

class FormVersionCreate(FormVersionBase):
    fields: List[FieldCreate] = []

class FormVersionResponse(FormVersionBase):
    id: int
    formid: int
    publishedat: Optional[datetime] = None
    createdat: datetime
    updatedat: datetime
    fields: List[FieldResponse] = []

    class Config:
        from_attributes = True

# ==========================================
# FORM SCHEMAS
# ==========================================
class FormBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "draft"

class FormCreate(FormBase):
    initial_version: Optional[FormVersionCreate] = None

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    current_version: Optional[int] = None


class FormResponse(FormBase):
    id: int
    owner_id: int
    current_version: Optional[int] = None
    createdat: datetime
    updatedat: datetime
    versions: List[FormVersionResponse] = []
    fields_count: Optional[int] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_count(cls, form):
        """Build a FormResponse and compute fields_count from the current version."""
        obj = cls.model_validate(form)
        if form.current_version is not None and form.versions:
            current_ver = next(
                (v for v in form.versions if v.version_number == form.current_version),
                None
            )
            obj.fields_count = len(current_ver.fields) if current_ver else 0
        elif form.versions:
            # No current_version set — use the latest version
            latest = max(form.versions, key=lambda v: v.version_number)
            obj.fields_count = len(latest.fields)
        else:
            obj.fields_count = 0
        return obj

class PublicFormResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    current_version: int
    fields: List[FieldResponse] = []
    rules: List[ConditionalRuleResponse] = []

    class Config:
        from_attributes = True


# ==========================================
# SUBMISSION SCHEMAS
# ==========================================
class ResponseValueCreate(BaseModel):
    field_id: int
    value: Optional[str] = None
    uploaded_file: Optional[int] = None

class ResponseValueResponse(ResponseValueCreate):
    id: int
    submission_id: int

    class Config:
        from_attributes = True

class SubmissionCreate(BaseModel):
    form_version: int
    submitted_by: Optional[int] = None
    responses: List[ResponseValueCreate]

class SubmissionResponse(BaseModel):
    id: int
    form_version: int
    submission_id: str
    submitted_by: Optional[int] = None
    status: str
    started_at: datetime
    submitted_at: Optional[datetime] = None
    response_values: List[ResponseValueResponse] = []

    class Config:
        from_attributes = True

# ==========================================
# UPLOADED FILE SCHEMAS
# ==========================================
class UploadedFileResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    mime_type: str
    size: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


class SubmissionCreatePublic(BaseModel):
    responses: List[ResponseValueCreate]


# ==========================================
# ANALYTICS & TREND SCHEMAS
# ==========================================
class DashboardAnalytics(BaseModel):
    total_users: int
    total_forms: int
    published_forms: int
    archived_forms: int
    draft_forms: int
    total_submissions: int
    started_submissions: int
    submitted_submissions: int
    completion_rate: float

class FormAnalytics(BaseModel):
    form_id: int
    title: str
    status: str
    version_count: int
    total_submissions: int
    started_submissions: int
    completed_submissions: int
    completion_rate: float

class SubmissionTrendItem(BaseModel):
    date: Optional[str] = None
    month: Optional[str] = None
    count: int


# ==========================================
# TEMPLATE FIELD SCHEMAS
# ==========================================
class TemplateFieldBase(BaseModel):
    label: str
    field_name: str
    field_type: str
    placeholder: Optional[str] = None
    required: bool = False
    display_order: int = 0
    validation_conf: Optional[dict] = None
    options: Optional[List[dict]] = None

class TemplateFieldCreate(TemplateFieldBase):
    pass

class TemplateFieldResponse(TemplateFieldBase):
    id: int
    template_id: int
    createdat: datetime
    updatedat: datetime

    class Config:
        from_attributes = True


# ==========================================
# TEMPLATE SCHEMAS
# ==========================================
class TemplateBase(BaseModel):
    title: str
    description: Optional[str] = None

class TemplateCreate(TemplateBase):
    fields: List[TemplateFieldCreate] = []

class TemplateUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    fields: Optional[List[TemplateFieldCreate]] = None

class TemplateResponse(TemplateBase):
    id: int
    createdat: datetime
    updatedat: datetime
    fields: List[TemplateFieldResponse] = []

    class Config:
        from_attributes = True


class CreateFormFromTemplate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


# ==========================================
# QR CODE SCHEMAS
# ==========================================
class QRCodeBase(BaseModel):
    title: str
    target_url: str

class QRCodeCreate(QRCodeBase):
    pass

class QRCodeResponse(QRCodeBase):
    id: int
    qr_image_path: str
    created_at: datetime

    class Config:
        from_attributes = True




