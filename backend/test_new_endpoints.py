import sys
import os
import uuid
import io
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

client = TestClient(app)

def test_new_endpoints_workflow():
    print("\n--- Starting test suite for new endpoints ---")

    # ==========================================
    # 1. FILE UPLOAD ENDPOINTS (/uploads)
    # ==========================================
    print("Testing POST /uploads...")
    file_content = b"Hello, this is a test file for upload functionality!"
    file_name = "test_upload.txt"
    files = {"file": (file_name, io.BytesIO(file_content), "text/plain")}
    
    upload_resp = client.post("/uploads/", files=files)
    assert upload_resp.status_code == 201, f"Upload failed: {upload_resp.text}"
    upload_data = upload_resp.json()
    assert upload_data["filename"] == file_name
    assert upload_data["mime_type"] == "text/plain"
    assert upload_data["size"] == len(file_content)
    upload_id = upload_data["id"]
    print(f"File uploaded successfully, metadata ID: {upload_id}")

    # Testing GET /uploads/{id}
    print(f"Testing GET /uploads/{upload_id} (metadata)...")
    get_upload_resp = client.get(f"/uploads/{upload_id}")
    assert get_upload_resp.status_code == 200, f"Failed to get upload metadata: {get_upload_resp.text}"
    meta_data = get_upload_resp.json()
    assert meta_data["filename"] == file_name
    assert meta_data["id"] == upload_id

    # Testing GET /uploads/{id}/download
    print(f"Testing GET /uploads/{upload_id}/download...")
    download_resp = client.get(f"/uploads/{upload_id}/download")
    assert download_resp.status_code == 200, f"Failed to download file: {download_resp.text}"
    assert download_resp.content == file_content
    print("File downloaded and content verified successfully.")

    # Testing GET /uploads/99999 (expect 404)
    print("Testing GET /uploads/99999 (expect 404)...")
    get_invalid_upload_resp = client.get("/uploads/99999")
    assert get_invalid_upload_resp.status_code == 404

    # ==========================================
    # 2. PREPARING FORM & FIELDS FOR SUBMISSION
    # ==========================================
    # Register an owner
    unique_suffix = uuid.uuid4().hex[:6]
    test_email = f"owner_{unique_suffix}@example.com"
    user_payload = {
        "first_name": "New",
        "last_name": "Tester",
        "email": test_email,
        "password": "ownerpassword123",
        "role": "user"
    }
    register_response = client.post("/auth/register", json=user_payload)
    assert register_response.status_code == 201
    owner_id = register_response.json()["id"]

    # Create form
    form_payload = {
        "title": f"New Test Form {unique_suffix}",
        "description": "Form to test public submissions",
        "status": "draft"
    }
    create_form_resp = client.post(f"/forms/?owner_id={owner_id}", json=form_payload)
    assert create_form_resp.status_code == 201
    form_id = create_form_resp.json()["id"]
    print(f"Form created with ID: {form_id}")

    # Add form version with 1 required field (first_name) and 1 optional field (file_attachment)
    version_payload = {
        "version_number": 1,
        "ispublished": True,
        "fields": [
            {
                "label": "Full Name",
                "field_name": "full_name",
                "field_type": "text",
                "required": True,
                "display_order": 1
            },
            {
                "label": "Attachment",
                "field_name": "attachment",
                "field_type": "file_upload",
                "required": False,
                "display_order": 2
            }
        ]
    }
    add_version_resp = client.post(f"/forms/{form_id}/versions", json=version_payload)
    assert add_version_resp.status_code == 201
    version_data = add_version_resp.json()
    version_id = version_data["id"]
    print(f"Form Version created with ID: {version_id}")

    # Extract field IDs
    fields = version_data["fields"]
    name_field_id = [f["id"] for f in fields if f["field_name"] == "full_name"][0]
    file_field_id = [f["id"] for f in fields if f["field_name"] == "attachment"][0]

    # Publish Form
    publish_resp = client.post(f"/forms/{form_id}/publish?version_number=1")
    assert publish_resp.status_code == 200
    print("Form published.")

    # ==========================================
    # 3. PUBLIC SUBMISSION ENDPOINT (/public/forms/{token}/submit)
    # ==========================================
    print("Testing POST /public/forms/{token}/submit...")
    
    # 3.1. Invalid token (non-integer)
    invalid_token_resp = client.post("/public/forms/abc/submit", json={"responses": []})
    assert invalid_token_resp.status_code == 400
    assert "Invalid form token format" in invalid_token_resp.json()["detail"]

    # 3.2. Form not found
    not_found_resp = client.post("/public/forms/99999/submit", json={"responses": []})
    assert not_found_resp.status_code == 404
    assert "Form not found" in not_found_resp.json()["detail"]

    # 3.3. Validation Error: missing required field 'full_name'
    invalid_payload = {
        "responses": [
            {
                "field_id": file_field_id,
                "value": None,
                "uploaded_file": upload_id
            }
        ]
    }
    missing_req_resp = client.post(f"/public/forms/{form_id}/submit", json=invalid_payload)
    assert missing_req_resp.status_code == 400
    assert "is missing" in missing_req_resp.json()["detail"]
    print("Missing required field validation check passed.")

    # 3.4. Valid submission
    valid_payload = {
        "responses": [
            {
                "field_id": name_field_id,
                "value": "Madhuvanth DM",
                "uploaded_file": None
            },
            {
                "field_id": file_field_id,
                "value": None,
                "uploaded_file": upload_id
            }
        ]
    }
    submit_resp = client.post(f"/public/forms/{form_id}/submit", json=valid_payload)
    assert submit_resp.status_code == 201, f"Submission failed: {submit_resp.text}"
    submission_data = submit_resp.json()
    submission_id = submission_data["id"]
    assert submission_data["status"] == "submitted"
    assert len(submission_data["response_values"]) == 2
    print(f"Public submission successful, submission ID: {submission_id}")

    # ==========================================
    # 4. SUBMISSION RETRIEVAL (GET /submissions/{id})
    # ==========================================
    print(f"Testing GET /submissions/{submission_id}...")
    get_sub_resp = client.get(f"/submissions/{submission_id}")
    assert get_sub_resp.status_code == 200, f"Get submission failed: {get_sub_resp.text}"
    get_sub_data = get_sub_resp.json()
    assert get_sub_data["id"] == submission_id
    assert get_sub_data["form_version"] == version_id
    assert len(get_sub_data["response_values"]) == 2
    print("Submission retrieval verified.")

    # Test GET /submissions/99999 (expect 404)
    get_invalid_sub_resp = client.get("/submissions/99999")
    assert get_invalid_sub_resp.status_code == 404

    # ==========================================
    # 5. RESPONSE ENDPOINTS (/responses)
    # ==========================================
    print("Testing GET /responses (all)...")
    get_resps_all = client.get("/responses/")
    assert get_resps_all.status_code == 200
    resps_list = get_resps_all.json()
    assert len(resps_list) >= 2
    print(f"Total responses in database: {len(resps_list)}")

    # Filtered responses by submission_id
    print(f"Testing GET /responses/?submission_id={submission_id}...")
    get_resps_filtered = client.get(f"/responses/?submission_id={submission_id}")
    assert get_resps_filtered.status_code == 200
    filtered_list = get_resps_filtered.json()
    assert len(filtered_list) == 2
    response_ids = [r["id"] for r in filtered_list]
    
    # Testing GET /responses/{id}
    resp_id_to_test = response_ids[0]
    print(f"Testing GET /responses/{resp_id_to_test}...")
    get_single_resp = client.get(f"/responses/{resp_id_to_test}")
    assert get_single_resp.status_code == 200
    assert get_single_resp.json()["id"] == resp_id_to_test
    print("Response GET by ID verified.")

    # Testing DELETE /responses/{id}
    print(f"Testing DELETE /responses/{resp_id_to_test}...")
    delete_resp = client.delete(f"/responses/{resp_id_to_test}")
    assert delete_resp.status_code == 200
    assert delete_resp.json()["message"] == "Response value successfully deleted"

    # Verify deleted response is 404
    get_deleted_resp = client.get(f"/responses/{resp_id_to_test}")
    assert get_deleted_resp.status_code == 404
    print("Response deleted and verified successfully.")

    # Testing DELETE /submissions/{id}
    print(f"Testing DELETE /submissions/{submission_id}...")
    delete_sub_resp = client.delete(f"/submissions/{submission_id}")
    assert delete_sub_resp.status_code == 200
    assert delete_sub_resp.json()["message"] == "Submission successfully deleted"

    # Verify deleted submission is 404
    get_deleted_sub_resp = client.get(f"/submissions/{submission_id}")
    assert get_deleted_sub_resp.status_code == 404

    # Verify cascade delete of responses (GET /responses/?submission_id={submission_id} returns empty)
    get_resps_after_sub_deleted = client.get(f"/responses/?submission_id={submission_id}")
    assert get_resps_after_sub_deleted.status_code == 200
    assert len(get_resps_after_sub_deleted.json()) == 0
    print("Submission and cascade responses deleted and verified successfully.")

    # Clean up: delete form
    print("Cleaning up Form...")
    delete_form_resp = client.delete(f"/forms/{form_id}")
    assert delete_form_resp.status_code == 200

    print("\n--- ALL NEW ENDPOINTS TESTS COMPLETED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_new_endpoints_workflow()
