import os
import uuid
import sys
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import crud
import schemas
import models
from database import get_db

router = APIRouter(
    prefix="/qrcodes",
    tags=["qrcodes"]
)

QR_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "qrcodes")

def is_valid_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return all([parsed.scheme in ("http", "https"), parsed.netloc])
    except Exception:
        return False

@router.post("", response_model=schemas.QRCodeResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=schemas.QRCodeResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_new_qrcode(qrcode_data: schemas.QRCodeCreate, db: Session = Depends(get_db)):
    # 1. Validate target_url
    if not is_valid_url(qrcode_data.target_url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL format. URL must start with http or https and contain a domain."
        )

    # 2. Ensure destination folder exists
    os.makedirs(QR_DIR, exist_ok=True)

    # 3. Generate QR code image
    unique_filename = f"{uuid.uuid4().hex}.png"
    qr_image_path = os.path.join(QR_DIR, unique_filename)

    try:
        import qrcode
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qrcode_data.target_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        img.save(qr_image_path)
    except Exception as local_err:
        try:
            import urllib.request
            import urllib.parse
            qr_api_url = f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={urllib.parse.quote(qrcode_data.target_url)}"
            urllib.request.urlretrieve(qr_api_url, qr_image_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate QR Code image: {str(local_err)} | Fallback error: {str(e)}"
            )

    # 4. Insert into database
    return crud.create_qrcode(db=db, qrcode_data=qrcode_data, qr_image_path=qr_image_path)

@router.get("", response_model=List[schemas.QRCodeResponse])
@router.get("/", response_model=List[schemas.QRCodeResponse], include_in_schema=False)
def list_all_qrcodes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_qrcodes(db=db, skip=skip, limit=limit)

@router.get("/{qr_id}", response_model=schemas.QRCodeResponse)
def get_qrcode_detail(qr_id: int, db: Session = Depends(get_db)):
    db_qr = crud.get_qrcode(db=db, qr_id=qr_id)
    if not db_qr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QR Code not found")
    return db_qr

@router.delete("/{qr_id}", status_code=status.HTTP_200_OK)
def delete_existing_qrcode(qr_id: int, db: Session = Depends(get_db)):
    success = crud.delete_qrcode(db=db, qr_id=qr_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QR Code not found")
    return {"message": "QR Code successfully deleted"}
