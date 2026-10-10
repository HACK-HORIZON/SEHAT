"""
Safety Engine Router for SEHAT.
Deterministic evaluation of clinical triggers into explainable priority levels.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from backend.app.models import LabReportValue, PriorityCategory, SafetySignal
from backend.app.safety import evaluate_safety_rules

router = APIRouter(prefix="/safety", tags=["Safety Engine"])

class SafetyCheckRequest(BaseModel):
    symptoms: List[str]
    chief_concern: str
    lab_values: List[LabReportValue] = []
    duration_days: int = 0

@router.post("/evaluate")
def evaluate_safety(req: SafetyCheckRequest) -> Dict[str, Any]:
    priority, signals = evaluate_safety_rules(
        req.symptoms, req.lab_values, req.chief_concern, req.duration_days
    )
    return {
        "priority_category": priority,
        "safety_signals": signals,
        "is_explainable": True,
        "deterministic": True
    }

