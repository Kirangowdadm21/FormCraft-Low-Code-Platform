import sys
import os
import uuid
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

client = TestClient(app)

def test_auth_and_user_management():
    print("\n--- Starting test suite for Auth (/auth) and User Management (/users) ---")

    unique_suffix = uuid.uuid4().hex[:6]
    admin_email = f"admin_{unique_suffix}@example.com"
    admin_password = "adminpassword123"

    # ==========================================
    # 1. AUTHENTICATION MODULE TESTS (/auth)
    # ==========================================
    print("1. Testing POST /auth/register...")
    reg_payload = {
        "first_name": "Admin",
        "last_name": "User",
        "email": admin_email,
        "password": admin_password,
        "role": "admin"
    }
    reg_resp = client.post("/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    user_data = reg_resp.json()
    assert user_data["email"] == admin_email
    assert user_data["role"] == "admin"
    admin_id = user_data["id"]
    print(f"Admin registered successfully, ID: {admin_id}")

    # Duplicate registration check
    dup_resp = client.post("/auth/register", json=reg_payload)
    assert dup_resp.status_code == 400
    assert dup_resp.json()["detail"] == "Email already registered"

    # Login
    print("2. Testing POST /auth/login...")
    login_payload = {
        "email": admin_email,
        "password": admin_password
    }
    login_resp = client.post("/auth/login", json=login_payload)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token_data = login_resp.json()
    assert "access_token" in token_data
    access_token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print("Login successful, JWT access token retrieved.")

    # Invalid login
    invalid_login_resp = client.post("/auth/login", json={"email": admin_email, "password": "wrongpassword"})
    assert invalid_login_resp.status_code == 401

    # Profile
    print("3. Testing GET /auth/profile...")
    profile_resp = client.get("/auth/profile", headers=headers)
    assert profile_resp.status_code == 200, f"Profile fetch failed: {profile_resp.text}"
    profile_data = profile_resp.json()
    assert profile_data["email"] == admin_email
    assert profile_data["id"] == admin_id
    print("Profile verified successfully.")

    # Logout
    print("4. Testing POST /auth/logout...")
    logout_resp = client.post("/auth/logout", headers=headers)
    assert logout_resp.status_code == 200, f"Logout failed: {logout_resp.text}"
    assert logout_resp.json()["message"] == "Successfully logged out"

    # Profile after logout (expect 401 revoked token)
    revoked_resp = client.get("/auth/profile", headers=headers)
    assert revoked_resp.status_code == 401
    print("Revoked token rejection verified successfully.")

    # Create new active session for user management tests
    import time
    time.sleep(1)
    new_login_resp = client.post("/auth/login", json=login_payload)
    new_token = new_login_resp.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {new_token}"}

    # ==========================================
    # 2. USER MANAGEMENT MODULE TESTS (/users)
    # ==========================================
    print("5. Testing GET /users (List Users)...")
    users_resp = client.get("/users", headers=auth_headers)
    assert users_resp.status_code == 200, f"Get users failed: {users_resp.text}"
    users_list = users_resp.json()
    assert len(users_list) >= 1
    print(f"Total users retrieved: {len(users_list)}")

    # GET /users/{id}
    print(f"6. Testing GET /users/{admin_id}...")
    get_user_resp = client.get(f"/users/{admin_id}", headers=auth_headers)
    assert get_user_resp.status_code == 200
    assert get_user_resp.json()["email"] == admin_email
    print("User retrieved by ID successfully.")

    # POST /users (Admin create user)
    print("7. Testing POST /users (Admin Create User)...")
    sub_user_email = f"managed_{unique_suffix}@example.com"
    create_user_payload = {
        "first_name": "Managed",
        "last_name": "User",
        "email": sub_user_email,
        "password": "managedpassword123",
        "role": "user"
    }
    create_u_resp = client.post("/users", json=create_user_payload, headers=auth_headers)
    assert create_u_resp.status_code == 201, f"Admin create user failed: {create_u_resp.text}"
    managed_user = create_u_resp.json()
    managed_id = managed_user["id"]
    assert managed_user["email"] == sub_user_email
    print(f"Managed user created with ID: {managed_id}")

    # PATCH /users/{id}
    print(f"8. Testing PATCH /users/{managed_id}...")
    patch_payload = {
        "first_name": "UpdatedManaged",
        "last_name": "UpdatedUser",
        "role": "editor"
    }
    patch_resp = client.patch(f"/users/{managed_id}", json=patch_payload, headers=auth_headers)
    assert patch_resp.status_code == 200, f"Patch user failed: {patch_resp.text}"
    patched_data = patch_resp.json()
    assert patched_data["first_name"] == "UpdatedManaged"
    assert patched_data["role"] == "editor"
    print("User patched successfully.")

    # DELETE /users/{id}
    print(f"9. Testing DELETE /users/{managed_id}...")
    delete_resp = client.delete(f"/users/{managed_id}", headers=auth_headers)
    assert delete_resp.status_code == 200
    assert delete_resp.json()["message"] == "User successfully deleted"

    # Verify deleted user is 404
    get_deleted_user = client.get(f"/users/{managed_id}", headers=auth_headers)
    assert get_deleted_user.status_code == 404
    print("User deleted and verified successfully.")

    print("\n--- ALL AUTH AND USER MANAGEMENT TESTS COMPLETED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_auth_and_user_management()
