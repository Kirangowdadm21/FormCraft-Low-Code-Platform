import sys
import os
import uuid
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

client = TestClient(app)

def test_lifecycle_and_rules():
    print("Starting Form Lifecycle and Rules CRUD integration tests...")
    
    # 1. Register a user
    unique_suffix = uuid.uuid4().hex[:6]
    test_email = f"user_{unique_suffix}@example.com"
    user_payload = {
        "first_name": "Lifecycle",
        "last_name": "Tester",
        "email": test_email,
        "password": "mypassword123",
        "role": "user"
    }
    
    register_response = client.post("/auth/register", json=user_payload)
    assert register_response.status_code == 201
    user_data = register_response.json()
    owner_id = user_data["id"]
    print(f"Test owner user created with ID: {owner_id}")
    
    # 2. Create form
    form_payload = {
        "title": f"Lifecycle Form {unique_suffix}",
        "description": "Form for testing lifecycle and rules",
        "status": "draft"
    }
    create_form_resp = client.post(f"/forms/?owner_id={owner_id}", json=form_payload)
    assert create_form_resp.status_code == 201
    form_data = create_form_resp.json()
    form_id = form_data["id"]
    print(f"Form created with ID: {form_id}")
    
    # 3. Add Form Version with 2 fields
    version_payload = {
        "version_number": 1,
        "ispublished": False,
        "fields": [
            {
                "label": "Are you a student?",
                "field_name": "is_student",
                "field_type": "dropdown",
                "required": True,
                "display_order": 1,
                "options": [
                    {"optiontext": "Yes", "value": "yes", "display_order": 1},
                    {"optiontext": "No", "value": "no", "display_order": 2}
                ]
            },
            {
                "label": "School Name",
                "field_name": "school_name",
                "field_type": "text",
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
    
    # Extract field IDs for testing Rules
    fields = version_data["fields"]
    trigger_field_id = fields[0]["id"]
    targeted_field_id = fields[1]["id"]
    print(f"Trigger field: {trigger_field_id}, Targeted field: {targeted_field_id}")
    
    # 4. Get Form Versions
    get_versions_resp = client.get(f"/forms/{form_id}/versions")
    assert get_versions_resp.status_code == 200
    versions_list = get_versions_resp.json()
    assert len(versions_list) == 1
    assert versions_list[0]["version_number"] == 1
    print("Form versions fetched successfully.")
    
    # 5. Publish Form
    print(f"Publishing form {form_id}...")
    publish_resp = client.post(f"/forms/{form_id}/publish?version_number=1")
    assert publish_resp.status_code == 200
    publish_data = publish_resp.json()
    assert publish_data["status"] == "published"
    assert publish_data["current_version"] == 1
    assert "publish_url" in publish_data
    print(f"Form published. Publish Link: {publish_data['publish_url']}")
    
    # 6. Retrieve Public Form (without authentication)
    print("Retrieving public form...")
    public_resp = client.get(f"/forms/public/{form_id}")
    assert public_resp.status_code == 200
    public_data = public_resp.json()
    assert public_data["id"] == form_id
    assert public_data["title"] == form_payload["title"]
    assert len(public_data["fields"]) == 2
    assert public_data["fields"][0]["label"] == "Are you a student?"
    print("Public form retrieved successfully and matches structure.")
    
    # 7. Rules CRUD Operations
    # 7.1. Create Rule (Show school_name if is_student equals yes)
    rule_payload = {
        "trigger_field": trigger_field_id,
        "operator": "equals",
        "comparison": "yes",
        "targeted_field": targeted_field_id,
        "action": "show"
    }
    print("Creating conditional rule...")
    create_rule_resp = client.post("/rules/", json=rule_payload)
    assert create_rule_resp.status_code == 201, f"Failed to create rule: {create_rule_resp.text}"
    rule_data = create_rule_resp.json()
    rule_id = rule_data["id"]
    print(f"Rule created with ID: {rule_id}")
    
    # 7.2. Get all rules
    get_rules_resp = client.get("/rules/")
    assert get_rules_resp.status_code == 200
    rules_list = get_rules_resp.json()
    assert len(rules_list) >= 1
    print(f"Total rules: {len(rules_list)}")
    
    # 7.3. Get rules with trigger_field filter
    get_filtered_rules = client.get(f"/rules/?trigger_field={trigger_field_id}")
    assert get_filtered_rules.status_code == 200
    filtered_rules_list = get_filtered_rules.json()
    assert len(filtered_rules_list) == 1
    assert filtered_rules_list[0]["id"] == rule_id
    print("Filtered rules list retrieved successfully.")
    
    # 7.4. Get rule by ID
    read_rule_resp = client.get(f"/rules/{rule_id}")
    assert read_rule_resp.status_code == 200
    rule_item = read_rule_resp.json()
    assert rule_item["comparison"] == "yes"
    print("Rule fetched by ID successfully.")
    
    # 7.5. Patch Rule (change operator to 'not_equals' and comparison to 'no')
    patch_rule_payload = {
        "operator": "not_equals",
        "comparison": "no"
    }
    patch_rule_resp = client.patch(f"/rules/{rule_id}", json=patch_rule_payload)
    assert patch_rule_resp.status_code == 200
    patched_rule = patch_rule_resp.json()
    assert patched_rule["operator"] == "not_equals"
    assert patched_rule["comparison"] == "no"
    print("Rule patched successfully.")
    
    # 7.6. Delete Rule
    delete_rule_resp = client.delete(f"/rules/{rule_id}")
    assert delete_rule_resp.status_code == 200
    assert delete_rule_resp.json()["message"] == "Rule successfully deleted"
    
    # Verify deletion
    verify_del_resp = client.get(f"/rules/{rule_id}")
    assert verify_del_resp.status_code == 404
    print("Rule deleted and verified successfully.")
    
    # 8. Archive Form
    print(f"Archiving form {form_id}...")
    archive_resp = client.post(f"/forms/{form_id}/archive")
    assert archive_resp.status_code == 200
    assert archive_resp.json()["status"] == "archived"
    print("Form archived successfully.")
    
    # 9. Verify Public Route fails for Archived Form
    verify_public_archived = client.get(f"/forms/public/{form_id}")
    assert verify_public_archived.status_code == 400
    print("Archived public form route correctly rejected request.")

    # 9.5 Unarchive Form and Verify Restore Status
    print(f"Unarchiving form {form_id}...")
    unarchive_resp = client.post(f"/forms/{form_id}/unarchive")
    assert unarchive_resp.status_code == 200
    assert unarchive_resp.json()["status"] == "draft"
    print("Form unarchived successfully.")
    
    # 10. Clean up: Delete form
    print("Cleaning up Form...")
    del_form_resp = client.delete(f"/forms/{form_id}")
    assert del_form_resp.status_code == 200
    print("Cleaned up and form deleted successfully.")
    
    print("\n--- ALL TESTS COMPLETED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_lifecycle_and_rules()
