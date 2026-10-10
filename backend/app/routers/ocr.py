"""
OCR Lab Report Extraction Router for SEHAT.
Extracts clinical parameters, evaluates normal intervals and flags uncertainty.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from backend.app.models import LabReportValue
from backend.app.ocr_service import parse_lab_text_or_ocr

router = APIRouter(prefix="/ocr", tags=["OCR Lab Extraction"])

class OCRRequest(BaseModel):
    raw_text: Optional[str] = None
    filename: Optional[str] = "report.png"
    low_bandwidth_compression: bool = False

@router.post("/extract", response_model=List[LabReportValue])
def extract_lab_report(req: OCRRequest):
    return parse_lab_text_or_ocr(req.raw_text or "", req.filename)

