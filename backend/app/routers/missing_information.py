"""
Missing Information Router for SEHAT.
Detects clinical gaps and synthesizes non-diagnostic follow-up questions.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from backend.app.models import MissingInfoItem, FollowUpQuestion, LabReportValue
from backend.app.missing_info_service import detect_missing_information

router = APIRouter(prefix="/missing-information", tags=["Missing Information Engine"])

class MissingInfoRequest(BaseModel):
    symptoms: List[str]
    chief_concern: str
    lab_values: List[LabReportValue] = []
    preferred_language: str = "hi"

@router.post("/detect")
def detect_missing_info(req: MissingInfoRequest) -> Dict[str, Any]:
    items, questions = detect_missing_information(
        req.symptoms, req.chief_concern, req.lab_values, req.preferred_language
    )
    return {
        "missing_items": items,
        "follow_up_questions": questions
    }

