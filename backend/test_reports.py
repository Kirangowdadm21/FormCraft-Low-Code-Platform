import sys
import os
import uuid
import json
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

client = TestClient(app)

def test_reports_module_workflow():
    print("\n--- Starting test suite for Independent Reports Module ---")

    # ==========================================
    # 1. SETUP TEST DATA
    # ==========================================
    unique_suffix = uuid.uuid4().hex[:6]
    test_email = f"reports_owner_{unique_suffix}@example.com"
    user_payload = {
        "first_name": "Report",
        "last_name": "Tester",
        "email": test_email,
        "password": "securepassword123",
        "role": "user"
    }
    reg_resp = client.post("/auth/register", json=user_payload)
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    owner_id = reg_resp.json()["id"]

    # Create Form with initial version and field
    form_payload = {
        "title": f"Report Test Form {unique_suffix}",
        "description": "Form for testing reports module",
        "status": "draft",
        "initial_version": {
            "version_number": 1,
            "ispublished": True,
            "fields": [
                {
                    "label": "Feedback Comment",
                    "field_name": "feedback_comment",
                    "field_type": "text",
                    "required": True,
                    "display_order": 1
                }
            ]
        }
    }
    create_form_resp = client.post(f"/forms/?owner_id={owner_id}", json=form_payload)
    assert create_form_resp.status_code == 201, f"Form creation failed: {create_form_resp.text}"
    form_data = create_form_resp.json()
    form_id = form_data["id"]
    version_id = form_data["versions"][0]["id"]
    field_id = form_data["versions"][0]["fields"][0]["id"]

    # Publish the Form
    pub_resp = client.post(f"/forms/{form_id}/publish?version_number=1")
    assert pub_resp.status_code == 200, f"Form publishing failed: {pub_resp.text}"

    # Submit a response
    sub_payload = {
        "form_version": version_id,
        "submitted_by": owner_id,
        "responses": [
            {
                "field_id": field_id,
                "value": "Outstanding platform design!"
            }
        ]
    }
    sub_resp = client.post("/submissions/", json=sub_payload)
    assert sub_resp.status_code == 201, f"Submission failed: {sub_resp.text}"
    sub_id = sub_resp.json()["id"]
    resp_id = sub_resp.json()["response_values"][0]["id"]

    # Create a Template
    template_payload = {
        "title": f"Report Test Template {unique_suffix}",
        "description": "Template for reports test",
        "fields": [
            {
                "label": "Rating",
                "field_name": "rating",
                "field_type": "number",
                "required": False,
                "display_order": 1
            }
        ]
    }
    tmpl_resp = client.post("/templates/", json=template_payload)
    assert tmpl_resp.status_code == 201, f"Template creation failed: {tmpl_resp.text}"

    # Create a QR Code
    qr_payload = {
        "title": f"Report Test QR {unique_suffix}",
        "target_url": "https://example.com/reports-test"
    }
    qr_resp = client.post("/qrcodes", json=qr_payload)
    assert qr_resp.status_code == 201, f"QR code creation failed: {qr_resp.text}"

    print("Setup completed successfully. Verifying Reports endpoints...\n")

    # ==========================================
    # 2. TEST GET /reports/dashboard
    # ==========================================
    print("Testing GET /reports/dashboard ...")
    dash_resp = client.get("/reports/dashboard")
    assert dash_resp.status_code == 200, f"Dashboard report failed: {dash_resp.text}"
    dash_data = dash_resp.json()
    assert "summary" in dash_data and "data" in dash_data
    assert dash_data["summary"]["report_type"] == "Dashboard"
    assert dash_data["summary"]["total_forms"] >= 1
    assert dash_data["summary"]["published_forms"] >= 1
    assert dash_data["summary"]["total_submissions"] >= 1
    assert dash_data["summary"]["total_responses"] >= 1
    print("PASSED: GET /reports/dashboard")

    # ==========================================
    # 3. TEST GET /reports/forms
    # ==========================================
    print("Testing GET /reports/forms ...")
    forms_resp = client.get("/reports/forms")
    assert forms_resp.status_code == 200, f"Forms report failed: {forms_resp.text}"
    forms_data = forms_resp.json()
    assert "summary" in forms_data and "data" in forms_data
    assert forms_data["summary"]["report_type"] == "Forms Report"
    assert isinstance(forms_data["data"], list)
    target_form = next((f for f in forms_data["data"] if f["id"] == form_id), None)
    assert target_form is not None, "Created form not found in forms report"
    assert target_form["number_of_fields"] >= 1
    assert target_form["number_of_responses"] >= 1
    print("PASSED: GET /reports/forms")

    # ==========================================
    # 4. TEST GET /reports/forms/{form_id}
    # ==========================================
    print(f"Testing GET /reports/forms/{form_id} ...")
    single_form_resp = client.get(f"/reports/forms/{form_id}")
    assert single_form_resp.status_code == 200, f"Single form report failed: {single_form_resp.text}"
    sf_data = single_form_resp.json()
    assert "summary" in sf_data and "data" in sf_data
    assert sf_data["summary"]["form_id"] == form_id
    assert sf_data["summary"]["number_of_fields"] >= 1
    assert sf_data["summary"]["number_of_responses"] >= 1
    assert sf_data["data"]["id"] == form_id
    print(f"PASSED: GET /reports/forms/{form_id}")

    # ==========================================
    # 5. TEST GET /reports/templates
    # ==========================================
    print("Testing GET /reports/templates ...")
    tmpl_report_resp = client.get("/reports/templates")
    assert tmpl_report_resp.status_code == 200, f"Templates report failed: {tmpl_report_resp.text}"
    tr_data = tmpl_report_resp.json()
    assert "summary" in tr_data and "data" in tr_data
    assert tr_data["summary"]["report_type"] == "Templates Report"
    assert tr_data["summary"]["total_templates"] >= 1
    print("PASSED: GET /reports/templates")

    # ==========================================
    # 6. TEST GET /reports/qrcodes
    # ==========================================
    print("Testing GET /reports/qrcodes ...")
    qr_report_resp = client.get("/reports/qrcodes")
    assert qr_report_resp.status_code == 200, f"QR code report failed: {qr_report_resp.text}"
    qr_data = qr_report_resp.json()
    assert "summary" in qr_data and "data" in qr_data
    assert qr_data["summary"]["report_type"] == "QR Code Report"
    assert qr_data["summary"]["total_qrcodes"] >= 1
    print("PASSED: GET /reports/qrcodes")

    # ==========================================
    # 7. TEST GET /reports/submissions
    # ==========================================
    print("Testing GET /reports/submissions ...")
    sub_report_resp = client.get(f"/reports/submissions?form_id={form_id}")
    assert sub_report_resp.status_code == 200, f"Submissions report failed: {sub_report_resp.text}"
    sr_data = sub_report_resp.json()
    assert "summary" in sr_data and "data" in sr_data
    assert sr_data["summary"]["total_submissions"] >= 1
    assert sr_data["summary"]["successful_submissions"] >= 1
    target_sub = next((s for s in sr_data["data"] if s["id"] == sub_id), None)
    assert target_sub is not None
    assert target_sub["response_count"] == 1
    print("PASSED: GET /reports/submissions")

    # ==========================================
    # 8. TEST GET /reports/responses
    # ==========================================
    print("Testing GET /reports/responses ...")
    resp_report_resp = client.get(f"/reports/responses?submission_id={sub_id}")
    assert resp_report_resp.status_code == 200, f"Responses report failed: {resp_report_resp.text}"
    rr_data = resp_report_resp.json()
    assert "summary" in rr_data and "data" in rr_data
    assert rr_data["summary"]["total_responses"] >= 1
    target_resp = next((r for r in rr_data["data"] if r["id"] == resp_id), None)
    assert target_resp is not None
    assert target_resp["value"] == "Outstanding platform design!"
    print("PASSED: GET /reports/responses")

    # ==========================================
    # 9. TEST POST /reports/generate (JSON, CSV, PDF)
    # ==========================================
    print("Testing POST /reports/generate (JSON format) ...")
    gen_json_resp = client.post("/reports/generate", json={"report_type": "dashboard", "format": "json"})
    assert gen_json_resp.status_code == 200
    assert "application/json" in gen_json_resp.headers["content-type"]
    assert "attachment" in gen_json_resp.headers["content-disposition"]
    print("PASSED: POST /reports/generate (JSON)")

    print("Testing POST /reports/generate (CSV format) ...")
    gen_csv_resp = client.post("/reports/generate", json={"report_type": "forms", "format": "csv"})
    assert gen_csv_resp.status_code == 200
    assert "text/csv" in gen_csv_resp.headers["content-type"]
    assert "attachment" in gen_csv_resp.headers["content-disposition"]
    print("PASSED: POST /reports/generate (CSV)")

    print("Testing POST /reports/generate (PDF format) ...")
    gen_pdf_resp = client.post("/reports/generate", json={"report_type": "submissions", "format": "pdf", "form_id": form_id})
    assert gen_pdf_resp.status_code == 200
    assert "application/pdf" in gen_pdf_resp.headers["content-type"]
    assert "attachment" in gen_pdf_resp.headers["content-disposition"]
    assert gen_pdf_resp.content.startswith(b"%PDF")
    print("PASSED: POST /reports/generate (PDF)")

    print("\n--- ALL REPORTS MODULE TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_reports_module_workflow()
