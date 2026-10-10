"""
Intake Router for SEHAT Triage Support.
Handles multimodal patient intake submission (voice transcript, text, lab report, symptoms).
"""

from fastapi import APIRouter, HTTPException
from backend.app.models import IntakeRequest, TriageCase
from backend.app.extraction_service import ExtractionPipeline
from backend.app.database import save_case, add_audit_log

router = APIRouter(prefix="/intake", tags=["Intake"])
pipeline = ExtractionPipeline()

@router.post("/submit", response_model=TriageCase)
def submit_patient_intake(request: IntakeRequest):
    """
    Submits a new patient intake session, runs extraction, safety engine, and registers into queue.
    """
    if not request.consent_granted:
        raise HTTPException(status_code=400, detail="Consent is mandatory prior to clinical intake processing.")
    
    case = pipeline.process_intake(request)
    save_case(case)
    
    if case.audit_trail:
        add_audit_log(case.audit_trail[-1])
        
    return case

