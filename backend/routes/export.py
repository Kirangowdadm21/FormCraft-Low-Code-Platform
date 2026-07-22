import csv
import io
import json
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import Optional
from fpdf import FPDF

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models
from database import get_db

router = APIRouter(
    prefix="/export",
    tags=["export"]
)

class PDFReport(FPDF):
    def header(self):
        # Draw sleek dark grey header bar
        self.set_fill_color(31, 41, 55)  # Tailwind gray-800
        self.rect(0, 0, 210, 20, 'F')
        
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 11)
        self.set_y(5)
        self.cell(0, 10, "FormCraft - Intelligent Data Collection Platform", align="C", new_x="LMARGIN", new_y="NEXT")
        
        self.set_text_color(0, 0, 0)
        self.set_y(25)  # Offset content from header

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(107, 114, 128)  # Tailwind gray-500
        # Draw horizontal rule above footer
        self.line(10, 280, 200, 280)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

def generate_pdf_bytes(data_type: str, data: list, form_id: Optional[int] = None) -> bytes:
    pdf = PDFReport()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # Title Section
    pdf.set_font('Helvetica', 'B', 16)
    title_text = f"{data_type.capitalize()} Export Report"
    if form_id is not None:
        title_text += f" (Form #{form_id})"
    pdf.cell(0, 10, title_text, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    
    if not data:
        pdf.set_font('Helvetica', 'I', 12)
        pdf.cell(0, 10, "No records found matching the export criteria.", new_x="LMARGIN", new_y="NEXT")
        return bytes(pdf.output())

    if data_type == "forms":
        for item in data:
            # Card Header block
            pdf.set_fill_color(243, 244, 246)  # Tailwind gray-100
            pdf.set_font('Helvetica', 'B', 11)
            pdf.cell(0, 8, f"Form ID #{item['id']}: {item['title']}", fill=True, new_x="LMARGIN", new_y="NEXT")
            
            # Fields info
            pdf.set_font('Helvetica', '', 10)
            status_label = item['status'].upper() if item['status'] else "DRAFT"
            version_label = item['current_version'] if item['current_version'] else "N/A"
            pdf.cell(0, 6, f"Status: {status_label}  |  Current Version: {version_label}", new_x="LMARGIN", new_y="NEXT")
            pdf.cell(0, 6, f"Created At: {item['createdat'] or 'N/A'}", new_x="LMARGIN", new_y="NEXT")
            
            if item.get('description'):
                pdf.multi_cell(0, 5, f"Description: {item['description']}", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(4)
            
    elif data_type == "submissions":
        for item in data:
            pdf.set_fill_color(243, 244, 246)
            pdf.set_font('Helvetica', 'B', 11)
            pdf.cell(0, 8, f"Submission ID: {item['submission_id']}", fill=True, new_x="LMARGIN", new_y="NEXT")
            
            pdf.set_font('Helvetica', '', 10)
            status_label = item['status'].upper() if item['status'] else "SUBMITTED"
            pdf.cell(0, 6, f"Form ID: {item['form_id']}  |  Version: {item['version_number'] or 'N/A'}  |  Status: {status_label}", new_x="LMARGIN", new_y="NEXT")
            pdf.cell(0, 6, f"Started At: {item['started_at']}  |  Submitted At: {item['submitted_at'] or 'N/A'}", new_x="LMARGIN", new_y="NEXT")
            
            if item.get("responses"):
                pdf.set_font('Helvetica', 'B', 10)
                pdf.cell(0, 6, "Responses:", new_x="LMARGIN", new_y="NEXT")
                pdf.set_font('Helvetica', '', 10)
                for r in item["responses"]:
                    label = r.get("field_label") or r.get("field_name") or f"Field #{r['field_id']}"
                    val = r.get("value")
                    if val is None:
                        val = f"Uploaded File (ID: {r['uploaded_file']})" if r.get('uploaded_file') else "N/A"
                    pdf.multi_cell(0, 5, f"  - {label}: {val}", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(4)
            
    elif data_type == "analytics":
        for item in data:
            pdf.set_fill_color(243, 244, 246)
            pdf.set_font('Helvetica', 'B', 11)
            pdf.cell(0, 8, f"Form ID #{item['form_id']}: {item['title']}", fill=True, new_x="LMARGIN", new_y="NEXT")
            
            pdf.set_font('Helvetica', '', 10)
            status_label = item['status'].upper() if item['status'] else "DRAFT"
            pdf.cell(0, 6, f"Status: {status_label}  |  Version Count: {item['version_count']}", new_x="LMARGIN", new_y="NEXT")
            pdf.cell(0, 6, f"Total Submissions: {item['total_submissions']}  |  Completed: {item['completed_submissions']}  |  Started: {item['started_submissions']}", new_x="LMARGIN", new_y="NEXT")
            pdf.cell(0, 6, f"Completion Rate: {item['completion_rate']:.2f}%", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(4)

    return bytes(pdf.output())

@router.get("")
def export_data(
    data_type: str = "forms",
    format: str = "csv",
    form_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    if data_type not in ("forms", "submissions", "analytics"):
        raise HTTPException(status_code=400, detail="data_type must be one of 'forms', 'submissions', 'analytics'")
    if format not in ("csv", "json", "pdf"):
        raise HTTPException(status_code=400, detail="format must be 'csv', 'json', or 'pdf'")

    data = []
    
    if data_type == "forms":
        # Export forms
        query = db.query(models.Form)
        if form_id is not None:
            query = query.filter(models.Form.id == form_id)
        forms = query.all()
        for f in forms:
            data.append({
                "id": f.id,
                "title": f.title,
                "description": f.description,
                "owner_id": f.owner_id,
                "status": f.status,
                "current_version": f.current_version,
                "createdat": f.createdat.isoformat() if f.createdat else None,
                "updatedat": f.updatedat.isoformat() if f.updatedat else None,
            })
            
    elif data_type == "submissions":
        # Export submissions
        query = db.query(models.Submission)
        if form_id is not None:
            query = query.join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
                         .filter(models.FormVersion.formid == form_id)
        submissions = query.all()
        for s in submissions:
            # Gather responses with field labels/names
            resp_list = []
            for rv in s.response_values:
                field_name = rv.field.field_name if rv.field else None
                field_label = rv.field.label if rv.field else None
                resp_list.append({
                    "field_id": rv.field_id,
                    "field_name": field_name,
                    "field_label": field_label,
                    "value": rv.value,
                    "uploaded_file": rv.uploaded_file
                })
            # Also get the form ID for this submission
            form_ver = db.query(models.FormVersion).filter(models.FormVersion.id == s.form_version).first()
            fid = form_ver.formid if form_ver else None
            version_number = form_ver.version_number if form_ver else None
            
            data.append({
                "id": s.id,
                "submission_id": s.submission_id,
                "form_id": fid,
                "form_version_id": s.form_version,
                "version_number": version_number,
                "submitted_by": s.submitted_by,
                "status": s.status,
                "started_at": s.started_at.isoformat() if s.started_at else None,
                "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
                "responses": resp_list
            })
            
    elif data_type == "analytics":
        # Export form analytics (either all forms, or a specific form if form_id is provided)
        query = db.query(models.Form)
        if form_id is not None:
            query = query.filter(models.Form.id == form_id)
        forms = query.all()
        for f in forms:
            version_count = db.query(models.FormVersion).filter(models.FormVersion.formid == f.id).count()
            total_submissions = db.query(models.Submission)\
                .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
                .filter(models.FormVersion.formid == f.id)\
                .count()
            started_submissions = db.query(models.Submission)\
                .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
                .filter(models.FormVersion.formid == f.id, models.Submission.status == "started")\
                .count()
            completed_submissions = db.query(models.Submission)\
                .join(models.FormVersion, models.Submission.form_version == models.FormVersion.id)\
                .filter(models.FormVersion.formid == f.id, models.Submission.status == "submitted")\
                .count()
            completion_rate = (completed_submissions / total_submissions * 100.0) if total_submissions > 0 else 0.0
            
            data.append({
                "form_id": f.id,
                "title": f.title,
                "status": f.status,
                "version_count": version_count,
                "total_submissions": total_submissions,
                "started_submissions": started_submissions,
                "completed_submissions": completed_submissions,
                "completion_rate": completion_rate
            })

    if format == "json":
        json_content = json.dumps(data, indent=2)
        return Response(
            content=json_content,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=export_{data_type}.json"
            }
        )
    elif format == "pdf":
        pdf_bytes = generate_pdf_bytes(data_type, data, form_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=export_{data_type}.pdf"
            }
        )
    else: # CSV format
        if not data:
            # Empty CSV output
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow([])
            output.seek(0)
            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=export_{data_type}.csv"
                }
            )
        
        # Get headers from the keys of the first item
        headers = list(data[0].keys())
        
        output = io.StringIO()
        # Ensure newlines are handled correctly for CSV
        writer = csv.writer(output, lineterminator='\n')
        writer.writerow(headers)
        for item in data:
            row = []
            for h in headers:
                val = item[h]
                if isinstance(val, (dict, list)):
                    val = json.dumps(val)
                row.append(val)
            writer.writerow(row)
        
        csv_content = output.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=export_{data_type}.csv"
            }
        )
