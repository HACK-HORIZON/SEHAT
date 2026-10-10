"""
Privacy & Consent Center Router for SEHAT.
Exposes data minimization metrics, field justifications, ephemeral tokenization, and session wiping.
"""

from fastapi import APIRouter
from typing import Dict, Any
from backend.app.privacy_service import PrivacyService
from backend.app.database import get_all_cases, purge_all_data, delete_case

router = APIRouter(prefix="/privacy", tags=["Privacy & Consent Center"])

@router.get("/metrics")
def get_privacy_metrics() -> Dict[str, Any]:
    cases = get_all_cases()
    return PrivacyService.get_privacy_metrics(len(cases))

@router.get("/justifications")
def get_field_justifications() -> Dict[str, Any]:
    return PrivacyService.get_field_explanations()

@router.post("/generate-temp-id")
def generate_ephemeral_token() -> Dict[str, Any]:
    return PrivacyService.generate_ephemeral_token()

@router.delete("/purge-session/{case_id}")
def purge_patient_session(case_id: str):
    success = delete_case(case_id)
    return {
        "status": "PURGED" if success else "NOT_FOUND",
        "case_id": case_id,
        "anonymized_trace_deleted": True,
        "message": f"Session and all temporary records for case {case_id} have been securely purged from system memory and disk."
    }

@router.post("/purge-all-ephemeral")
def purge_all_ephemeral_sessions():
    purge_all_data()
    return {
        "status": "ALL_PURGED",
        "message": "All ephemeral triage queues, uploaded cache, and session tokens have been permanently wiped."
    }

