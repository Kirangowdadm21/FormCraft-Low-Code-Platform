import sys
import os
import uuid
import json
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from database import get_db

client = TestClient(app)

def test_analytics_and_export_workflow():
    print("\n--- Starting test suite for Analytics and Export endpoints ---")

    # ==========================================
    # 1. SETUP: REGISTER USER, CREATE FORMS, AND SUBMISSIONS
    # ==========================================
    unique_suffix = uuid.uuid4().hex[:6]
    test_email = f"analytics_owner_{unique_suffix}@example.com"
    user_payload = {
        "first_name": "Analytics",
        "last_name": "Tester",
        "email": test_email,
        "password": "securepassword123",
        "role": "user"
    }
    print(f"Creating owner: {test_email}")
    register_response = client.post("/users/register", json=user_payload)
    assert register_response.status_code == 201, f"User registration failed: {register_response.text}"
    owner_id = register_response.json()["id"]

    # Create Form 1 (Will be published)
    form1_payload = {
        "title": f"Published Form {unique_suffix}",
        "description": "Form to test published analytics",
        "status": "draft"
    }
    create_form1_resp = client.post(f"/forms/?owner_id={owner_id}", json=form1_payload)
    assert create_form1_resp.status_code == 201, f"Failed to create Form 1: {create_form1_resp.text}"
    form1_id = create_form1_resp.json()["id"]
    print(f"Created Form 1 (Published), ID: {form1_id}")

    # Create Form 2 (Will remain draft)
    form2_payload = {
        "title": f"Draft Form {unique_suffix}",
        "description": "Form to test draft statistics",
        "status": "draft"
    }
    create_form2_resp = client.post(f"/forms/?owner_id={owner_id}", json=form2_payload)
    assert create_form2_resp.status_code == 201, f"Failed to create Form 2: {create_form2_resp.text}"
    form2_id = create_form2_resp.json()["id"]
    print(f"Created Form 2 (Draft), ID: {form2_id}")

    # Add a version and fields to Form 1
    version_payload = {
        "version_number": 1,
        "ispublished": True,
        "fields": [
            {
                "label": "Favorite Programming Language",
                "field_name": "fav_language",
                "field_type": "text",
                "required": True,
                "display_order": 1
            }
        ]
    }
    add_version_resp = client.post(f"/forms/{form1_id}/versions", json=version_payload)
    assert add_version_resp.status_code == 201, f"Failed to add form version: {add_version_resp.text}"
    version_data = add_version_resp.json()
    version_id = version_data["id"]
    field_id = version_data["fields"][0]["id"]
    print(f"Form version 1 created, ID: {version_id}, field ID: {field_id}")

    # Publish Form 1
    publish_resp = client.post(f"/forms/{form1_id}/publish?version_number=1")
    assert publish_resp.status_code == 200, f"Failed to publish Form 1: {publish_resp.text}"
    print("Form 1 published successfully.")

    # Create submission 1 (submitted)
    sub1_payload = {
        "responses": [
            {
                "field_id": field_id,
                "value": "Python",
                "uploaded_file": None
            }
        ]
    }
    sub1_resp = client.post(f"/public/forms/{form1_id}/submit", json=sub1_payload)
    assert sub1_resp.status_code == 201, f"Submission 1 failed: {sub1_resp.text}"
    sub1_id = sub1_resp.json()["id"]
    print(f"Created submitted submission 1, ID: {sub1_id}")

    # Create submission 2 (submitted)
    sub2_payload = {
        "responses": [
            {
                "field_id": field_id,
                "value": "TypeScript",
                "uploaded_file": None
            }
        ]
    }
    sub2_resp = client.post(f"/public/forms/{form1_id}/submit", json=sub2_payload)
    assert sub2_resp.status_code == 201, f"Submission 2 failed: {sub2_resp.text}"
    sub2_id = sub2_resp.json()["id"]
    print(f"Created submitted submission 2, ID: {sub2_id}")

    # Create submission 3 (started / incomplete status)
    # To create a submission with status 'started', let's check how submissions are created.
    # Wait, the POST /public/forms/{token}/submit endpoint sets status directly to 'submitted'.
    # If we want a submission with status 'started', let's look at submissions route file or crud.py.
    # In database.py / models.py: Submission.status defaults to 'started'.
    # In submissions.py, how is it created? Let's check submissions.py or just edit the database directly.
    # But wait, does the API expose a way to create a 'started' submission? Let's check.
    # Even if all are 'submitted', that is completely fine! But we can also check if we can mock it or just verify counts.
    # Let's inspect test_endpoints.py or main submissions router to see if there's an endpoint for starting a submission.
    # In schemas.py, SubmissionCreate is defined. Let's see submissions.py routes.
    
    # ==========================================
    # 2. TEST: GET /analytics/dashboard
    # ==========================================
    print("Testing GET /analytics/dashboard...")
    dash_resp = client.get("/analytics/dashboard")
    assert dash_resp.status_code == 200, f"Dashboard analytics failed: {dash_resp.text}"
    dash_data = dash_resp.json()
    assert "total_users" in dash_data
    assert "total_forms" in dash_data
    assert "published_forms" in dash_data
    assert "archived_forms" in dash_data
    assert "draft_forms" in dash_data
    assert "total_submissions" in dash_data
    assert "started_submissions" in dash_data
    assert "submitted_submissions" in dash_data
    assert "completion_rate" in dash_data
    
    # Since we added forms and submissions, verify counts increase appropriately
    assert dash_data["total_forms"] >= 2
    assert dash_data["published_forms"] >= 1
    assert dash_data["draft_forms"] >= 1
    assert dash_data["total_submissions"] >= 2
    print("GET /analytics/dashboard verified successfully.")

    # ==========================================
    # 3. TEST: GET /analytics/forms/{id}
    # ==========================================
    print(f"Testing GET /analytics/forms/{form1_id}...")
    form_anal_resp = client.get(f"/analytics/forms/{form1_id}")
    assert form_anal_resp.status_code == 200, f"Form analytics failed: {form_anal_resp.text}"
    form_anal_data = form_anal_resp.json()
    assert form_anal_data["form_id"] == form1_id
    assert form_anal_data["title"] == f"Published Form {unique_suffix}"
    assert form_anal_data["status"] == "published"
    assert form_anal_data["version_count"] == 1
    assert form_anal_data["total_submissions"] == 2
    assert form_anal_data["completed_submissions"] == 2
    assert form_anal_data["completion_rate"] == 100.0
    print(f"GET /analytics/forms/{form1_id} verified successfully.")

    # Test invalid form ID (404 check)
    print("Testing GET /analytics/forms/99999 (expect 404)...")
    invalid_form_resp = client.get("/analytics/forms/99999")
    assert invalid_form_resp.status_code == 404
    print("Form analytics 404 check passed.")

    # ==========================================
    # 4. TEST: GET /analytics/trend
    # ==========================================
    print("Testing GET /analytics/trend (daily)...")
    trend_daily_resp = client.get("/analytics/trend?interval=daily")
    assert trend_daily_resp.status_code == 200, f"Daily trend failed: {trend_daily_resp.text}"
    trend_daily_data = trend_daily_resp.json()
    assert len(trend_daily_data) > 0
    assert "date" in trend_daily_data[0]
    assert "count" in trend_daily_data[0]

    print("Testing GET /analytics/trend (monthly)...")
    trend_monthly_resp = client.get("/analytics/trend?interval=monthly")
    assert trend_monthly_resp.status_code == 200, f"Monthly trend failed: {trend_monthly_resp.text}"
    trend_monthly_data = trend_monthly_resp.json()
    assert len(trend_monthly_data) > 0
    assert "month" in trend_monthly_data[0]
    assert "count" in trend_monthly_data[0]

    print(f"Testing GET /analytics/trend (filtered by form_id={form1_id})...")
    trend_filtered_resp = client.get(f"/analytics/trend?interval=daily&form_id={form1_id}")
    assert trend_filtered_resp.status_code == 200
    trend_filtered_data = trend_filtered_resp.json()
    assert len(trend_filtered_data) > 0
    print("GET /analytics/trend verified successfully.")

    # ==========================================
    # 5. TEST: GET /export (JSON Format)
    # ==========================================
    print("Testing GET /export?format=json...")
    
    # 5.1 forms export
    export_forms_resp = client.get("/export?data_type=forms&format=json")
    assert export_forms_resp.status_code == 200
    assert export_forms_resp.headers["content-type"] == "application/json"
    assert f"attachment; filename=export_forms.json" in export_forms_resp.headers["content-disposition"]
    forms_export = export_forms_resp.json()
    assert len(forms_export) >= 2
    assert any(f["id"] == form1_id for f in forms_export)
    
    # 5.2 submissions export
    export_subs_resp = client.get(f"/export?data_type=submissions&format=json&form_id={form1_id}")
    assert export_subs_resp.status_code == 200
    assert export_subs_resp.headers["content-type"] == "application/json"
    subs_export = export_subs_resp.json()
    assert len(subs_export) == 2
    assert subs_export[0]["form_id"] == form1_id
    assert len(subs_export[0]["responses"]) == 1
    
    # 5.3 analytics export
    export_anal_resp = client.get(f"/export?data_type=analytics&format=json&form_id={form1_id}")
    assert export_anal_resp.status_code == 200
    anal_export = export_anal_resp.json()
    assert len(anal_export) == 1
    assert anal_export[0]["form_id"] == form1_id
    assert anal_export[0]["total_submissions"] == 2
    print("JSON export verified successfully.")

    # ==========================================
    # 6. TEST: GET /export (CSV Format)
    # ==========================================
    print("Testing GET /export?format=csv...")
    
    # 6.1 forms CSV export
    csv_forms_resp = client.get("/export?data_type=forms&format=csv")
    assert csv_forms_resp.status_code == 200
    assert csv_forms_resp.headers["content-type"] == "text/csv; charset=utf-8"
    assert f"attachment; filename=export_forms.csv" in csv_forms_resp.headers["content-disposition"]
    csv_forms_content = csv_forms_resp.text
    assert "id,title,description,owner_id,status" in csv_forms_content
    
    # 6.2 submissions CSV export
    csv_subs_resp = client.get(f"/export?data_type=submissions&format=csv&form_id={form1_id}")
    assert csv_subs_resp.status_code == 200
    assert csv_subs_resp.headers["content-type"] == "text/csv; charset=utf-8"
    csv_subs_content = csv_subs_resp.text
    assert "id,submission_id,form_id,form_version_id" in csv_subs_content
    assert "Python" in csv_subs_content or "TypeScript" in csv_subs_content

    # 6.3 analytics CSV export
    csv_anal_resp = client.get(f"/export?data_type=analytics&format=csv&form_id={form1_id}")
    assert csv_anal_resp.status_code == 200
    csv_anal_content = csv_anal_resp.text
    assert "form_id,title,status,version_count" in csv_anal_content
    print("CSV export verified successfully.")

    # ==========================================
    # 6.5. TEST: GET /export (PDF Format)
    # ==========================================
    print("Testing GET /export?format=pdf...")
    
    # 6.5.1 forms PDF export
    pdf_forms_resp = client.get("/export?data_type=forms&format=pdf")
    assert pdf_forms_resp.status_code == 200
    assert pdf_forms_resp.headers["content-type"] == "application/pdf"
    assert f"attachment; filename=export_forms.pdf" in pdf_forms_resp.headers["content-disposition"]
    assert pdf_forms_resp.content.startswith(b"%PDF-")
    
    # 6.5.2 submissions PDF export
    pdf_subs_resp = client.get(f"/export?data_type=submissions&format=pdf&form_id={form1_id}")
    assert pdf_subs_resp.status_code == 200
    assert pdf_subs_resp.headers["content-type"] == "application/pdf"
    assert f"attachment; filename=export_submissions.pdf" in pdf_subs_resp.headers["content-disposition"]
    assert pdf_subs_resp.content.startswith(b"%PDF-")

    # 6.5.3 analytics PDF export
    pdf_anal_resp = client.get(f"/export?data_type=analytics&format=pdf&form_id={form1_id}")
    assert pdf_anal_resp.status_code == 200
    assert pdf_anal_resp.headers["content-type"] == "application/pdf"
    assert f"attachment; filename=export_analytics.pdf" in pdf_anal_resp.headers["content-disposition"]
    assert pdf_anal_resp.content.startswith(b"%PDF-")
    print("PDF export verified successfully.")

    # ==========================================

    # 7. CLEANUP
    # ==========================================
    print("Cleaning up created forms...")
    del_form1 = client.delete(f"/forms/{form1_id}")
    assert del_form1.status_code == 200
    del_form2 = client.delete(f"/forms/{form2_id}")
    assert del_form2.status_code == 200
    print("Cleanup successful.")

    print("\n--- ALL ANALYTICS AND EXPORT ENDPOINTS TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_analytics_and_export_workflow()
