import sys
import os
import uuid
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from database import get_db

client = TestClient(app)

def test_crud_endpoints():
    print("Starting CRUD endpoint integration tests...")
    
    # 1. Register a temporary user to act as form owner
    unique_suffix = uuid.uuid4().hex[:6]
    test_email = f"test_{unique_suffix}@example.com"
    user_payload = {
        "first_name": "Test",
        "last_name": "User",
        "email": test_email,
        "password": "testpassword123",
        "role": "user"
    }
    
    print(f"Creating test user with email: {test_email}")
    register_response = client.post("/users/register", json=user_payload)
    assert register_response.status_code == 201, f"Failed to register user: {register_response.text}"
    user_data = register_response.json()
    owner_id = user_data["id"]
    print(f"Test user created successfully with ID: {owner_id}")
    
    # 2. Create a form
    form_payload = {
        "title": f"Test Form {unique_suffix}",
        "description": "Initial test form description",
        "status": "draft"
    }
    print("Creating a new form...")
    create_form_resp = client.post(f"/forms/?owner_id={owner_id}", json=form_payload)
    assert create_form_resp.status_code == 201, f"Failed to create form: {create_form_resp.text}"
    form_data = create_form_resp.json()
    form_id = form_data["id"]
    print(f"Form created successfully with ID: {form_id}")
    
    # 3. Read form by ID
    print(f"Reading form with ID: {form_id}")
    get_form_resp = client.get(f"/forms/{form_id}")
    assert get_form_resp.status_code == 200, f"Failed to get form: {get_form_resp.text}"
    assert get_form_resp.json()["title"] == form_payload["title"]
    
    # 4. Patch Form
    print(f"Patching form with ID: {form_id}")
    patch_payload = {
        "description": "Updated form description!",
        "status": "published"
    }
    patch_form_resp = client.patch(f"/forms/{form_id}", json=patch_payload)
    assert patch_form_resp.status_code == 200, f"Failed to patch form: {patch_form_resp.text}"
    updated_form_data = patch_form_resp.json()
    assert updated_form_data["description"] == "Updated form description!"
    assert updated_form_data["status"] == "published"
    print("Form patched successfully.")
    
    # 5. Add a Form Version
    version_payload = {
        "version_number": 1,
        "ispublished": True,
        "fields": [
            {
                "label": "First Name",
                "field_name": "first_name",
                "field_type": "text",
                "required": True,
                "display_order": 1
            }
        ]
    }
    print(f"Adding a version to form: {form_id}")
    add_version_resp = client.post(f"/forms/{form_id}/versions", json=version_payload)
    assert add_version_resp.status_code == 201, f"Failed to add version: {add_version_resp.text}"
    version_data = add_version_resp.json()
    version_id = version_data["id"]
    print(f"Form Version created successfully with ID: {version_id}")
    
    # 6. Create a Field directly under this version
    field_payload = {
        "formversion": version_id,
        "label": "Email Address",
        "field_name": "email_addr",
        "field_type": "email",
        "required": True,
        "display_order": 2,
        "placeholder": "Enter your email",
        "options": [
            {
                "optiontext": "Work",
                "value": "work",
                "display_order": 1
            },
            {
                "optiontext": "Personal",
                "value": "personal",
                "display_order": 2
            }
        ]
    }
    print(f"Creating a field directly under version ID: {version_id}")
    create_field_resp = client.post("/fields/", json=field_payload)
    assert create_field_resp.status_code == 201, f"Failed to create field: {create_field_resp.text}"
    field_data = create_field_resp.json()
    field_id = field_data["id"]
    print(f"Field created successfully with ID: {field_id}")
    
    # 7. Get All Fields
    print("Retrieving all fields...")
    get_all_resp = client.get("/fields/")
    assert get_all_resp.status_code == 200, f"Failed to get all fields: {get_all_resp.text}"
    fields_list = get_all_resp.json()
    assert len(fields_list) >= 2  # The one from version creation and the one created directly
    print(f"Found {len(fields_list)} total fields.")
    
    # 8. Get Fields filtered by version
    print(f"Retrieving fields for version ID: {version_id}")
    get_filtered_resp = client.get(f"/fields/?formversion_id={version_id}")
    assert get_filtered_resp.status_code == 200, f"Failed to get filtered fields: {get_filtered_resp.text}"
    filtered_list = get_filtered_resp.json()
    assert len(filtered_list) == 2
    print(f"Found {len(filtered_list)} fields for version {version_id}.")
    
    # 9. Get Field by ID
    print(f"Reading field with ID: {field_id}")
    get_field_resp = client.get(f"/fields/{field_id}")
    assert get_field_resp.status_code == 200, f"Failed to get field by ID: {get_field_resp.text}"
    field_item = get_field_resp.json()
    assert field_item["label"] == "Email Address"
    assert len(field_item["options"]) == 2
    print("Field read by ID successfully.")
    
    # 10. Patch Field (updating details and replacing options)
    print(f"Patching field with ID: {field_id}")
    patch_field_payload = {
        "label": "Primary Email Address",
        "placeholder": "e.g. john@example.com",
        "options": [
            {
                "optiontext": "Office",
                "value": "office",
                "display_order": 1
            },
            {
                "optiontext": "Home",
                "value": "home",
                "display_order": 2
            },
            {
                "optiontext": "Other",
                "value": "other",
                "display_order": 3
            }
        ]
    }
    patch_field_resp = client.patch(f"/fields/{field_id}", json=patch_field_payload)
    assert patch_field_resp.status_code == 200, f"Failed to patch field: {patch_field_resp.text}"
    patched_field_data = patch_field_resp.json()
    assert patched_field_data["label"] == "Primary Email Address"
    assert patched_field_data["placeholder"] == "e.g. john@example.com"
    assert len(patched_field_data["options"]) == 3
    assert patched_field_data["options"][0]["value"] == "office"
    print("Field patched successfully.")
    
    # 11. Delete the created Field
    print(f"Deleting field with ID: {field_id}")
    delete_field_resp = client.delete(f"/fields/{field_id}")
    assert delete_field_resp.status_code == 200, f"Failed to delete field: {delete_field_resp.text}"
    assert delete_field_resp.json()["message"] == "Field successfully deleted"
    
    # Verify the field is gone
    get_deleted_field_resp = client.get(f"/fields/{field_id}")
    assert get_deleted_field_resp.status_code == 404
    print("Field deleted and verified successfully.")
    
    # 12. Delete the created Form
    print(f"Deleting form with ID: {form_id}")
    delete_form_resp = client.delete(f"/forms/{form_id}")
    assert delete_form_resp.status_code == 200, f"Failed to delete form: {delete_form_resp.text}"
    assert delete_form_resp.json()["message"] == "Form successfully deleted"
    
    # Verify form is gone
    get_deleted_form_resp = client.get(f"/forms/{form_id}")
    assert get_deleted_form_resp.status_code == 404
    print("Form deleted and verified successfully.")
    
    print("\n--- ALL TESTS COMPLETED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_crud_endpoints()
