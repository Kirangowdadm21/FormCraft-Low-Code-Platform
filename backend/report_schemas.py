from pydantic import BaseModel
from typing import List, Optional, Any, Dict

# ==========================================
# REPORT SCHEMAS: SUMMARY & WRAPPERS
# ==========================================

# --- 1. DASHBOARD REPORT ---
class DashboardReportSummary(BaseModel):
    generated_at: str
    report_type: str = "Dashboard"
    total_forms: int
    published_forms: int
    draft_forms: int
    archived_forms: int
    total_templates: int
    total_qrcodes: int
    total_submissions: int
    total_responses: int
    completion_rate: float

class DashboardReportResponse(BaseModel):
    summary: DashboardReportSummary
    data: Dict[str, Any]


# --- 2. FORMS REPORT ---
class FormReportItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    owner_id: int
    current_version: Optional[int] = None
    createdat: Optional[str] = None
    updatedat: Optional[str] = None
    number_of_fields: int
    number_of_responses: int
    last_submission_date: Optional[str] = None

class FormsReportSummary(BaseModel):
    generated_at: str
    report_type: str = "Forms Report"
    total_forms: int
    published_forms: int
    draft_forms: int
    archived_forms: int
    total_fields: int
    total_responses: int

class FormsReportResponse(BaseModel):
    summary: FormsReportSummary
    data: List[FormReportItem]


# --- 3. SINGLE FORM DETAIL REPORT ---
class SingleFormReportSummary(BaseModel):
    generated_at: str
    report_type: str = "Form Detail Report"
    form_id: int
    form_name: str
    status: str
    created_date: Optional[str] = None
    number_of_fields: int
    number_of_responses: int
    last_submission_date: Optional[str] = None

class SingleFormReportResponse(BaseModel):
    summary: SingleFormReportSummary
    data: Dict[str, Any]


# --- 4. TEMPLATES REPORT ---
class TemplateReportItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    createdat: Optional[str] = None
    updatedat: Optional[str] = None
    number_of_fields: int
    usage_count: int

class TemplatesReportSummary(BaseModel):
    generated_at: str
    report_type: str = "Templates Report"
    total_templates: int
    total_template_fields: int

class TemplatesReportResponse(BaseModel):
    summary: TemplatesReportSummary
    data: List[TemplateReportItem]


# --- 5. QR CODES REPORT ---
class QRCodeReportItem(BaseModel):
    id: int
    title: str
    target_url: str
    qr_image_path: str
    creation_date: Optional[str] = None

class QRCodesReportSummary(BaseModel):
    generated_at: str
    report_type: str = "QR Code Report"
    total_qrcodes: int

class QRCodesReportResponse(BaseModel):
    summary: QRCodesReportSummary
    data: List[QRCodeReportItem]


# --- 6. SUBMISSIONS REPORT ---
class SubmissionReportItem(BaseModel):
    id: int
    submission_id: str
    form_version_id: int
    version_number: Optional[int] = None
    form_id: Optional[int] = None
    form_title: Optional[str] = None
    submitted_by: Optional[int] = None
    status: str
    started_at: Optional[str] = None
    submitted_at: Optional[str] = None
    response_count: int

class SubmissionsReportSummary(BaseModel):
    generated_at: str
    report_type: str = "Submission Report"
    total_submissions: int
    successful_submissions: int
    latest_submission: Optional[str] = None

class SubmissionsReportResponse(BaseModel):
    summary: SubmissionsReportSummary
    data: List[SubmissionReportItem]


# --- 7. RESPONSES REPORT ---
class ResponseReportItem(BaseModel):
    id: int
    submission_id: int
    field_id: int
    field_name: Optional[str] = None
    field_label: Optional[str] = None
    field_type: Optional[str] = None
    form_id: Optional[int] = None
    form_title: Optional[str] = None
    value: Optional[str] = None
    uploaded_file: Optional[int] = None

class ResponsesReportSummary(BaseModel):
    generated_at: str
    report_type: str = "Response Report"
    total_responses: int
    latest_response: Optional[str] = None
    associated_forms_count: int

class ResponsesReportResponse(BaseModel):
    summary: ResponsesReportSummary
    data: List[ResponseReportItem]


# --- 8. GENERATE REPORT REQUEST ---
class ReportGenerateRequest(BaseModel):
    report_type: str = "dashboard"  # dashboard, forms, submissions, templates, qrcodes, responses
    format: str = "json"            # json, csv, pdf
    form_id: Optional[int] = None
