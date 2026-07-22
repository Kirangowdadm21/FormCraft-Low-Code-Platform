import sys
import os
import uuid
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

client = TestClient(app)

def test_qrcodes_workflow():
    print("\n--- Starting test suite for QR Code Generation endpoints ---")

    # ==========================================
    # 1. POST /qrcodes - Create with valid URL
    # ==========================================
    print("Testing POST /qrcodes with valid URL...")
    unique_suffix = uuid.uuid4().hex[:6]
    qr_payload = {
        "title": f"Test QR Code {unique_suffix}",
        "target_url": "https://example.com/forms/public/1"
    }
    create_resp = client.post("/qrcodes", json=qr_payload)
    assert create_resp.status_code == 201, f"Create QR failed: {create_resp.text}"
    qr_data = create_resp.json()
    assert qr_data["title"] == qr_payload["title"]
    assert qr_data["target_url"] == qr_payload["target_url"]
    assert "qr_image_path" in qr_data
    assert "id" in qr_data
    assert "created_at" in qr_data
    qr_id = qr_data["id"]
    qr_image_path = qr_data["qr_image_path"]
    print(f"QR Code created successfully, ID: {qr_id}")

    # Verify the QR image file was actually written to disk
    assert os.path.exists(qr_image_path), f"QR image file not found at: {qr_image_path}"
    file_size = os.path.getsize(qr_image_path)
    assert file_size > 0, "QR image file is empty"
    print(f"QR image file verified on disk ({file_size} bytes): {qr_image_path}")

    # ==========================================
    # 2. POST /qrcodes - Create with another URL
    # ==========================================
    print("Testing POST /qrcodes with second valid URL...")
    qr_payload2 = {
        "title": f"Second QR {unique_suffix}",
        "target_url": "https://example.com/another-page"
    }
    create_resp2 = client.post("/qrcodes", json=qr_payload2)
    assert create_resp2.status_code == 201, f"Create second QR failed: {create_resp2.text}"
    qr_id2 = create_resp2.json()["id"]
    print(f"Second QR Code created, ID: {qr_id2}")

    # ==========================================
    # 3. POST /qrcodes - Invalid URL (expect 400)
    # ==========================================
    print("Testing POST /qrcodes with invalid URL (expect 400)...")
    invalid_payload = {
        "title": "Invalid QR",
        "target_url": "not-a-valid-url"
    }
    invalid_resp = client.post("/qrcodes", json=invalid_payload)
    assert invalid_resp.status_code == 400, f"Expected 400, got {invalid_resp.status_code}: {invalid_resp.text}"
    assert "Invalid URL" in invalid_resp.json()["detail"]
    print("Invalid URL validation passed.")

    # Test another invalid URL format
    invalid_payload2 = {
        "title": "FTP QR",
        "target_url": "ftp://example.com/file"
    }
    invalid_resp2 = client.post("/qrcodes", json=invalid_payload2)
    assert invalid_resp2.status_code == 400
    print("FTP URL correctly rejected.")

    # ==========================================
    # 4. GET /qrcodes - List all QR codes
    # ==========================================
    print("Testing GET /qrcodes...")
    list_resp = client.get("/qrcodes")
    assert list_resp.status_code == 200, f"List QR codes failed: {list_resp.text}"
    qr_list = list_resp.json()
    assert len(qr_list) >= 2
    assert any(q["id"] == qr_id for q in qr_list)
    assert any(q["id"] == qr_id2 for q in qr_list)
    print(f"GET /qrcodes returned {len(qr_list)} records.")

    # ==========================================
    # 5. GET /qrcodes/{qr_id} - Get specific QR code
    # ==========================================
    print(f"Testing GET /qrcodes/{qr_id}...")
    get_resp = client.get(f"/qrcodes/{qr_id}")
    assert get_resp.status_code == 200, f"Get QR by ID failed: {get_resp.text}"
    get_data = get_resp.json()
    assert get_data["id"] == qr_id
    assert get_data["title"] == qr_payload["title"]
    assert get_data["target_url"] == qr_payload["target_url"]
    assert get_data["qr_image_path"] == qr_image_path
    print(f"GET /qrcodes/{qr_id} verified successfully.")

    # Test 404 for invalid ID
    print("Testing GET /qrcodes/99999 (expect 404)...")
    not_found_resp = client.get("/qrcodes/99999")
    assert not_found_resp.status_code == 404
    print("QR Code 404 check passed.")

    # ==========================================
    # 6. DELETE /qrcodes/{qr_id} - Delete QR code
    # ==========================================
    print(f"Testing DELETE /qrcodes/{qr_id}...")
    delete_resp = client.delete(f"/qrcodes/{qr_id}")
    assert delete_resp.status_code == 200, f"Delete QR failed: {delete_resp.text}"
    assert delete_resp.json()["message"] == "QR Code successfully deleted"
    print(f"QR Code {qr_id} deleted successfully.")

    # Verify the QR image file was also deleted from disk
    assert not os.path.exists(qr_image_path), f"QR image file should have been deleted: {qr_image_path}"
    print("QR image file verified as deleted from disk.")

    # Verify GET returns 404 now
    get_deleted_resp = client.get(f"/qrcodes/{qr_id}")
    assert get_deleted_resp.status_code == 404
    print("Deleted QR Code returns 404 as expected.")

    # Test DELETE for invalid ID (expect 404)
    print("Testing DELETE /qrcodes/99999 (expect 404)...")
    delete_not_found = client.delete("/qrcodes/99999")
    assert delete_not_found.status_code == 404
    print("DELETE 404 check passed.")

    # ==========================================
    # 7. CLEANUP - Delete remaining QR code
    # ==========================================
    print("Cleaning up remaining QR code...")
    del_resp2 = client.delete(f"/qrcodes/{qr_id2}")
    assert del_resp2.status_code == 200
    print("Cleanup successful.")

    print("\n--- ALL QR CODE GENERATION TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_qrcodes_workflow()
