import sys
import os
import uuid
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

client = TestClient(app)

def test_template_workflow():
    print("\n--- Starting test suite for Form Templates ---")

    # 1. Register a temporary user to act as form owner
    unique_suffix = uuid.uuid4().hex[:6]
    test_email = f"template_owner_{unique_suffix}@example.com"
    user_payload = {
        "first_name": "Template",
        "last_name": "Tester",
        "email": test_email,
        "password": "testpassword123",
        "role": "user"
    }
    
    print(f"Creating test owner user with email: {test_email}")
    register_response = client.post("/auth/register", json=user_payload)
    assert register_response.status_code == 201, f"Failed to register user: {register_response.text}"
    owner_data = register_response.json()
    owner_id = owner_data["id"]
    print(f"Test user created successfully with ID: {owner_id}")

    # 2. Create a Template
    template_payload = {
        "title": f"Reusable Form Template {unique_suffix}",
        "description": "A blueprint for customer feedback forms",
        "fields": [
            {
                "label": "Full Name",
                "field_name": "full_name",
                "field_type": "text",
                "required": True,
                "display_order": 1,
                "placeholder": "Enter your name"
            },
            {
                "label": "Rating",
                "field_name": "rating",
                "field_type": "dropdown",
                "required": False,
                "display_order": 2,
                "placeholder": "Select rating",
                "options": [
                    {"optiontext": "Good", "value": "good", "display_order": 1},
                    {"optiontext": "Excellent", "value": "excellent", "display_order": 2}
                ]
            }
        ]
    }
    print("Testing POST /templates...")
    create_resp = client.post("/templates/", json=template_payload)
    assert create_resp.status_code == 201, f"Template creation failed: {create_resp.text}"
    template_data = create_resp.json()
    template_id = template_data["id"]
    assert template_data["title"] == template_payload["title"]
    assert len(template_data["fields"]) == 2
    assert template_data["fields"][0]["field_name"] == "full_name"
    assert template_data["fields"][1]["options"][0]["value"] == "good"
    print(f"Template created successfully with ID: {template_id}")

    # 3. GET /templates (list)
    print("Testing GET /templates...")
    list_resp = client.get("/templates/")
    assert list_resp.status_code == 200, f"Failed to list templates: {list_resp.text}"
    templates_list = list_resp.json()
    assert any(t["id"] == template_id for t in templates_list)
    print("Template listing verified.")

    # 4. GET /templates/{id}
    print(f"Testing GET /templates/{template_id}...")
    get_resp = client.get(f"/templates/{template_id}")
    assert get_resp.status_code == 200, f"Failed to get template: {get_resp.text}"
    single_template_data = get_resp.json()
    assert single_template_data["description"] == template_payload["description"]
    print("Template details retrieval verified.")

    # 5. PATCH /templates/{id} (update title and update fields)
    print(f"Testing PATCH /templates/{template_id}...")
    patch_payload = {
        "title": f"Updated Form Template {unique_suffix}",
        "description": "Updated blueprint description",
        "fields": [
            {
                "label": "First Name",
                "field_name": "first_name",
                "field_type": "text",
                "required": True,
                "display_order": 1,
                "placeholder": "Enter first name"
            }
        ]
    }
    patch_resp = client.patch(f"/templates/{template_id}", json=patch_payload)
    assert patch_resp.status_code == 200, f"Failed to patch template: {patch_resp.text}"
    patched_data = patch_resp.json()
    assert patched_data["title"] == patch_payload["title"]
    assert len(patched_data["fields"]) == 1
    assert patched_data["fields"][0]["field_name"] == "first_name"
    print("Template patched successfully.")

    # 6. POST /templates/{id}/create-form (instantiate form from template)
    print(f"Testing POST /templates/{template_id}/create-form...")
    create_form_resp = client.post(f"/templates/{template_id}/create-form?owner_id={owner_id}", json={
        "title": "Custom Overridden Form Title",
        "description": "Custom Overridden Form Description"
    })
    assert create_form_resp.status_code == 201, f"Failed to instantiate form from template: {create_form_resp.text}"
    new_form_data = create_form_resp.json()
    new_form_id = new_form_data["id"]
    assert new_form_data["title"] == "Custom Overridden Form Title"
    assert new_form_data["description"] == "Custom Overridden Form Description"
    assert new_form_data["owner_id"] == owner_id
    assert len(new_form_data["versions"]) == 1
    
    version_1 = new_form_data["versions"][0]
    assert version_1["version_number"] == 1
    assert len(version_1["fields"]) == 1
    new_field = version_1["fields"][0]
    new_field_id = new_field["id"]
    assert new_field["field_name"] == "first_name"
    assert new_field["label"] == "First Name"
    print(f"New form successfully created with ID: {new_form_id} and field ID: {new_field_id}")

    # 7. Modify the instantiated form's field and verify the template is untouched
    print("Modifying form field and verifying template remains unchanged...")
    patch_field_payload = {
        "label": "Given Name",
        "placeholder": "e.g. Madhu"
    }
    patch_field_resp = client.patch(f"/fields/{new_field_id}", json=patch_field_payload)
    assert patch_field_resp.status_code == 200, f"Failed to patch form field: {patch_field_resp.text}"
    
    # Retrieve the template again to verify it was NOT modified
    verify_template_resp = client.get(f"/templates/{template_id}")
    assert verify_template_resp.status_code == 200
    verify_template_data = verify_template_resp.json()
    assert verify_template_data["fields"][0]["label"] == "First Name" # untouched
    print("Verified that editing the created form field does not modify the original template.")

    # 8. Delete the template and verify that the instantiated form still exists
    print(f"Deleting template with ID: {template_id}...")
    delete_template_resp = client.delete(f"/templates/{template_id}")
    assert delete_template_resp.status_code == 200
    
    # Verify template is 404
    get_deleted_template_resp = client.get(f"/templates/{template_id}")
    assert get_deleted_template_resp.status_code == 404
    
    # Verify the instantiated form still exists
    get_form_resp = client.get(f"/forms/{new_form_id}")
    assert get_form_resp.status_code == 200
    print("Verified that deleting the template does not delete the instantiated form.")

    # Cleanup: Delete the created Form
    print(f"Cleaning up instantiated form {new_form_id}...")
    delete_form_resp = client.delete(f"/forms/{new_form_id}")
    assert delete_form_resp.status_code == 200
    print("Cleanup successful.")

    print("\n--- ALL TEMPLATES INTEGRATION TESTS COMPLETED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_template_workflow()
