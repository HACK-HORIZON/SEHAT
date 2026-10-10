"""
Extraction Router for SEHAT.
Exposes modular information extraction orchestration endpoint.
"""

from fastapi import APIRouter
from backend.app.models import IntakeRequest, TriageCase
from backend.app.extraction_service import ExtractionPipeline

router = APIRouter(prefix="/extraction", tags=["Extraction"])
pipeline = ExtractionPipeline()

@router.post("/analyze", response_model=TriageCase)
def analyze_case(req: IntakeRequest):
    return pipeline.process_intake(req)

