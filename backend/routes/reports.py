import csv
import io
import json
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import func

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models
import report_schemas
from database import get_db
from routes.export import generate_pdf_bytes

router = APIRouter(
    prefix="/reports",
    tags=["reports"]
)

# Helper function to get current ISO timestamp string
def get_now_str() -> str:
    return datetime.datetime.utcnow().isoformat() + "Z"

# ==========================================
# REPORT HELPER FUNCTIONS (READ ONLY)
# ==========================================

def get_dashboard_report(db: Session) -> report_schemas.DashboardReportResponse:
    total_users = db.query(models.User).count()
    total_forms = db.query(models.Form).count()
    published_forms = db.query(models.Form).filter(models.Form.status == "published").count()
    draft_forms = db.query(models.Form).filter(models.Form.status == "draft").count()
    archived_forms = db.query(models.Form).filter(models.Form.status == "archived").count()

    total_templates = db.query(models.Template).count()
    total_qrcodes = db.query(models.QRCode).count()
    total_submissions = db.query(models.Submission).count()
    total_responses = db.query(models.ResponseValue).count()
    completed_submissions = db.query(models.Submission).filter(models.Submission.status == "submitted").count()

    completion_rate = (completed_submissions / total_submissions * 100.0) if total_submissions > 0 else 0.0

    summary = report_schemas.DashboardReportSummary(
        generated_at=get_now_str(),
        report_type="Dashboard",
        total_forms=total_forms,
        published_forms=published_forms,
        draft_forms=draft_forms,
        archived_forms=archived_forms,
        total_templates=total_templates,
        total_qrcodes=total_qrcodes,
        total_submissions=total_submissions,
        total_responses=total_responses,
        completion_rate=round(completion_rate, 2)
    )

    data = {
        "users_count": total_users,
        "forms_summary": {
            "total": total_forms,
            "published": published_forms,
            "draft": draft_forms,
            "archived": archived_forms
        },
        "submissions_summary": {
            "total": total_submissions,
            "completed": completed_submissions,
            "completion_rate": round(completion_rate, 2)
        },
        "modules_count": {
            "templates": total_templates,
            "qrcodes": total_qrcodes,
            "responses": total_responses
        }
    }

    return report_schemas.DashboardReportResponse(summary=summary, data=data)


def get_forms_report(db: Session) -> report_schemas.FormsReportResponse:
    forms = db.query(models.Form).all()

    total_forms = len(forms)
    published_forms = sum(1 for f in forms if f.status == "published")
    draft_forms = sum(1 for f in forms if f.status == "draft")
    archived_forms = sum(1 for f in forms if f.status == "archived")

    total_fields = db.query(models.Field).count()
    total_responses = db.query(models.ResponseValue).count()

    form_items = []
    for f in forms:
        # Calculate number of fields across all versions for this form
        fields_count = db.query(models.Field)\
            .join(models.FormVersion, models.Field.formversion == models.FormVersion.id)\
            .filter(models.FormVersion.formid == f.id)\
            .count()

        # Calculate number of responses for this form
        responses_count = db.query(models.ResponseValue)\
            .join(models.Submission, models.ResponseValue.submission_id == models.Submission.id)\
            .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
            .filter(models.FormVersion.formid == f.id)\
            .count()

        # Get last submission date
        last_sub = db.query(models.Submission)\
            .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
            .filter(models.FormVersion.formid == f.id)\
            .order_by(models.Submission.started_at.desc())\
            .first()

        last_sub_date = last_sub.submitted_at.isoformat() if (last_sub and last_sub.submitted_at) else (last_sub.started_at.isoformat() if last_sub and last_sub.started_at else None)

        form_items.append(report_schemas.FormReportItem(
            id=f.id,
            title=f.title,
            description=f.description,
            status=f.status,
            owner_id=f.owner_id,
            current_version=f.current_version,
            createdat=f.createdat.isoformat() if f.createdat else None,
            updatedat=f.updatedat.isoformat() if f.updatedat else None,
            number_of_fields=fields_count,
            number_of_responses=responses_count,
            last_submission_date=last_sub_date
        ))

    summary = report_schemas.FormsReportSummary(
        generated_at=get_now_str(),
        report_type="Forms Report",
        total_forms=total_forms,
        published_forms=published_forms,
        draft_forms=draft_forms,
        archived_forms=archived_forms,
        total_fields=total_fields,
        total_responses=total_responses
    )

    return report_schemas.FormsReportResponse(summary=summary, data=form_items)


def get_form_report(db: Session, form_id: int) -> report_schemas.SingleFormReportResponse:
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    # Calculate fields count
    fields_count = db.query(models.Field)\
        .join(models.FormVersion, models.Field.formversion == models.FormVersion.id)\
        .filter(models.FormVersion.formid == form_id)\
        .count()

    # Calculate responses count
    responses_count = db.query(models.ResponseValue)\
        .join(models.Submission, models.ResponseValue.submission_id == models.Submission.id)\
        .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
        .filter(models.FormVersion.formid == form_id)\
        .count()

    # Get last submission
    last_sub = db.query(models.Submission)\
        .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
        .filter(models.FormVersion.formid == form_id)\
        .order_by(models.Submission.started_at.desc())\
        .first()

    last_sub_date = last_sub.submitted_at.isoformat() if (last_sub and last_sub.submitted_at) else (last_sub.started_at.isoformat() if last_sub and last_sub.started_at else None)

    summary = report_schemas.SingleFormReportSummary(
        generated_at=get_now_str(),
        report_type="Form Detail Report",
        form_id=form.id,
        form_name=form.title,
        status=form.status,
        created_date=form.createdat.isoformat() if form.createdat else None,
        number_of_fields=fields_count,
        number_of_responses=responses_count,
        last_submission_date=last_sub_date
    )

    # Detailed version breakdown
    versions = db.query(models.FormVersion).filter(models.FormVersion.formid == form_id).all()
    version_details = []
    for v in versions:
        version_fields = []
        for f in v.fields:
            opts = [{"id": o.id, "optiontext": o.optiontext, "value": o.value} for o in f.options]
            version_fields.append({
                "id": f.id,
                "label": f.label,
                "field_name": f.field_name,
                "field_type": f.field_type,
                "required": f.required,
                "options": opts
            })
        
        subs_count = db.query(models.Submission).filter(models.Submission.form_version == v.id).count()

        version_details.append({
            "id": v.id,
            "version_number": v.version_number,
            "ispublished": v.ispublished,
            "publishedat": v.publishedat.isoformat() if v.publishedat else None,
            "fields": version_fields,
            "submission_count": subs_count
        })

    data = {
        "id": form.id,
        "title": form.title,
        "description": form.description,
        "owner_id": form.owner_id,
        "status": form.status,
        "current_version": form.current_version,
        "createdat": form.createdat.isoformat() if form.createdat else None,
        "updatedat": form.updatedat.isoformat() if form.updatedat else None,
        "versions": version_details
    }

    return report_schemas.SingleFormReportResponse(summary=summary, data=data)


def get_templates_report(db: Session) -> report_schemas.TemplatesReportResponse:
    templates = db.query(models.Template).all()

    total_templates = len(templates)
    total_template_fields = db.query(models.TemplateField).count()

    template_items = []
    for t in templates:
        fields_count = len(t.fields)
        # Calculate usage count by checking forms with matching title or created from template
        usage_count = db.query(models.Form).filter(models.Form.title.like(f"%{t.title}%")).count()

        template_items.append(report_schemas.TemplateReportItem(
            id=t.id,
            title=t.title,
            description=t.description,
            createdat=t.createdat.isoformat() if t.createdat else None,
            updatedat=t.updatedat.isoformat() if t.updatedat else None,
            number_of_fields=fields_count,
            usage_count=usage_count
        ))

    summary = report_schemas.TemplatesReportSummary(
        generated_at=get_now_str(),
        report_type="Templates Report",
        total_templates=total_templates,
        total_template_fields=total_template_fields
    )

    return report_schemas.TemplatesReportResponse(summary=summary, data=template_items)


def get_qrcodes_report(db: Session) -> report_schemas.QRCodesReportResponse:
    qrcodes = db.query(models.QRCode).all()
    total_qrcodes = len(qrcodes)

    qr_items = []
    for q in qrcodes:
        qr_items.append(report_schemas.QRCodeReportItem(
            id=q.id,
            title=q.title,
            target_url=q.target_url,
            qr_image_path=q.qr_image_path,
            creation_date=q.created_at.isoformat() if q.created_at else None
        ))

    summary = report_schemas.QRCodesReportSummary(
        generated_at=get_now_str(),
        report_type="QR Code Report",
        total_qrcodes=total_qrcodes
    )

    return report_schemas.QRCodesReportResponse(summary=summary, data=qr_items)


def get_submissions_report(db: Session, form_id: Optional[int] = None) -> report_schemas.SubmissionsReportResponse:
    query = db.query(models.Submission)
    if form_id is not None:
        query = query.join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
                     .filter(models.FormVersion.formid == form_id)

    submissions = query.all()
    total_submissions = len(submissions)
    successful_submissions = sum(1 for s in submissions if s.status == "submitted")

    latest_sub = max(submissions, key=lambda s: s.started_at) if submissions else None
    latest_sub_str = latest_sub.submitted_at.isoformat() if (latest_sub and latest_sub.submitted_at) else (latest_sub.started_at.isoformat() if latest_sub and latest_sub.started_at else None)

    sub_items = []
    for s in submissions:
        form_ver = db.query(models.FormVersion).filter(models.FormVersion.id == s.form_version).first()
        fid = form_ver.formid if form_ver else None
        ver_num = form_ver.version_number if form_ver else None

        form_obj = db.query(models.Form).filter(models.Form.id == fid).first() if fid else None
        form_title = form_obj.title if form_obj else None

        resp_count = len(s.response_values)

        sub_items.append(report_schemas.SubmissionReportItem(
            id=s.id,
            submission_id=s.submission_id,
            form_version_id=s.form_version,
            version_number=ver_num,
            form_id=fid,
            form_title=form_title,
            submitted_by=s.submitted_by,
            status=s.status,
            started_at=s.started_at.isoformat() if s.started_at else None,
            submitted_at=s.submitted_at.isoformat() if s.submitted_at else None,
            response_count=resp_count
        ))

    summary = report_schemas.SubmissionsReportSummary(
        generated_at=get_now_str(),
        report_type="Submission Report",
        total_submissions=total_submissions,
        successful_submissions=successful_submissions,
        latest_submission=latest_sub_str
    )

    return report_schemas.SubmissionsReportResponse(summary=summary, data=sub_items)


def get_responses_report(
    db: Session,
    submission_id: Optional[int] = None,
    field_id: Optional[int] = None
) -> report_schemas.ResponsesReportResponse:
    query = db.query(models.ResponseValue)
    if submission_id is not None:
        query = query.filter(models.ResponseValue.submission_id == submission_id)
    if field_id is not None:
        query = query.filter(models.ResponseValue.field_id == field_id)

    responses_list = query.all()
    total_responses = len(responses_list)

    # Calculate latest response timestamp via associated submission
    latest_sub_date = None
    form_ids_set = set()

    resp_items = []
    for r in responses_list:
        field_obj = r.field
        field_name = field_obj.field_name if field_obj else None
        field_label = field_obj.label if field_obj else None
        field_type = field_obj.field_type if field_obj else None

        sub_obj = r.submission
        fid = None
        ftitle = None
        if sub_obj:
            form_ver = sub_obj.form_version_rel
            if form_ver:
                fid = form_ver.formid
                form_ids_set.add(fid)
                if form_ver.form:
                    ftitle = form_ver.form.title

            if sub_obj.submitted_at:
                dt_str = sub_obj.submitted_at.isoformat()
                if not latest_sub_date or dt_str > latest_sub_date:
                    latest_sub_date = dt_str

        resp_items.append(report_schemas.ResponseReportItem(
            id=r.id,
            submission_id=r.submission_id,
            field_id=r.field_id,
            field_name=field_name,
            field_label=field_label,
            field_type=field_type,
            form_id=fid,
            form_title=ftitle,
            value=r.value,
            uploaded_file=r.uploaded_file
        ))

    summary = report_schemas.ResponsesReportSummary(
        generated_at=get_now_str(),
        report_type="Response Report",
        total_responses=total_responses,
        latest_response=latest_sub_date,
        associated_forms_count=len(form_ids_set)
    )

    return report_schemas.ResponsesReportResponse(summary=summary, data=resp_items)


# ==========================================
# FASTAPI ROUTE HANDLERS
# ==========================================

@router.get("/dashboard", response_model=report_schemas.DashboardReportResponse)
def read_dashboard_report(db: Session = Depends(get_db)):
    return get_dashboard_report(db)


@router.get("/forms", response_model=report_schemas.FormsReportResponse)
def read_forms_report(db: Session = Depends(get_db)):
    return get_forms_report(db)


@router.get("/forms/{form_id}", response_model=report_schemas.SingleFormReportResponse)
def read_single_form_report(form_id: int, db: Session = Depends(get_db)):
    return get_form_report(db, form_id)


@router.get("/templates", response_model=report_schemas.TemplatesReportResponse)
def read_templates_report(db: Session = Depends(get_db)):
    return get_templates_report(db)


@router.get("/qrcodes", response_model=report_schemas.QRCodesReportResponse)
def read_qrcodes_report(db: Session = Depends(get_db)):
    return get_qrcodes_report(db)


@router.get("/submissions", response_model=report_schemas.SubmissionsReportResponse)
def read_submissions_report(form_id: Optional[int] = None, db: Session = Depends(get_db)):
    return get_submissions_report(db, form_id=form_id)


@router.get("/responses", response_model=report_schemas.ResponsesReportResponse)
def read_responses_report(
    submission_id: Optional[int] = None,
    field_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return get_responses_report(db, submission_id=submission_id, field_id=field_id)


@router.post("/generate")
def generate_report_file(request: report_schemas.ReportGenerateRequest, db: Session = Depends(get_db)):
    """Generate exportable report document (JSON, CSV, PDF) reusing export module helpers."""
    report_type = request.report_type.lower()
    fmt = request.format.lower()

    if fmt not in ("json", "csv", "pdf"):
        raise HTTPException(status_code=400, detail="Format must be 'json', 'csv', or 'pdf'")

    # Gather data dict based on report type
    if report_type == "dashboard":
        report_obj = get_dashboard_report(db).model_dump()
    elif report_type == "forms":
        report_obj = get_forms_report(db).model_dump()
    elif report_type == "templates":
        report_obj = get_templates_report(db).model_dump()
    elif report_type == "qrcodes":
        report_obj = get_qrcodes_report(db).model_dump()
    elif report_type == "submissions":
        report_obj = get_submissions_report(db, form_id=request.form_id).model_dump()
    elif report_type == "responses":
        report_obj = get_responses_report(db).model_dump()
    else:
        raise HTTPException(status_code=400, detail=f"Invalid report_type: {request.report_type}")

    filename = f"report_{report_type}.{fmt}"

    if fmt == "json":
        return Response(
            content=json.dumps(report_obj, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    # For PDF, reuse export module generate_pdf_bytes logic
    if fmt == "pdf":
        export_data_list = report_obj["data"] if isinstance(report_obj["data"], list) else [report_obj["data"]]
        pdf_bytes = generate_pdf_bytes(report_type if report_type in ("forms", "submissions") else "analytics", export_data_list, form_id=request.form_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    # CSV format
    raw_data = report_obj["data"]
    output = io.StringIO()
    writer = csv.writer(output, lineterminator="\n")

    if isinstance(raw_data, list):
        if raw_data:
            headers = list(raw_data[0].keys())
            writer.writerow(headers)
            for item in raw_data:
                row = []
                for h in headers:
                    val = item[h]
                    if isinstance(val, (dict, list)):
                        val = json.dumps(val)
                    row.append(val)
                writer.writerow(row)
        else:
            writer.writerow([])
    elif isinstance(raw_data, dict):
        writer.writerow(["Metric", "Value"])
        for k, v in raw_data.items():
            writer.writerow([k, json.dumps(v) if isinstance(v, (dict, list)) else v])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
