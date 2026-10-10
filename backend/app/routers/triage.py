"""
Triage Queue & Passport Router for SEHAT.
Provides queue intelligence, triage passport retrieval, and demo dataset seeding.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from backend.app.models import TriageCase, QueueStats, PriorityCategory, ReviewerStatus
from backend.app.database import get_all_cases, get_case_by_id, save_case, purge_all_data, add_audit_log
from backend.app.seed_data import generate_seed_cases

router = APIRouter(prefix="/triage", tags=["Triage Queue & Passport"])

@router.get("/queue", response_model=List[TriageCase])
def get_triage_queue(
    priority: Optional[str] = None,
    status: Optional[str] = None,
    facility: Optional[str] = None,
    search: Optional[str] = None
):
    """Returns the live prioritized queue with filters."""
    cases = get_all_cases()
    if not cases:
        # Auto seed if empty
        seed_cases = generate_seed_cases()
        for sc in seed_cases:
            save_case(sc)
        cases = get_all_cases()

    filtered = cases
    if priority and priority != "ALL":
        filtered = [c for c in filtered if c.priority_category.value == priority]
    if status and status != "ALL":
        filtered = [c for c in filtered if c.reviewer_status.value == status]
    if facility and facility != "ALL":
        filtered = [c for c in filtered if facility.lower() in c.facility_name.lower()]
    if search:
        s = search.lower()
        filtered = [
            c for c in filtered if
            s in c.temp_patient_id.lower() or
            s in c.chief_concern.lower() or
            s in c.facility_name.lower() or
            any(s in sym.lower() for sym in c.patient_reported_symptoms)
        ]
    return filtered

@router.get("/stats", response_model=QueueStats)
def get_queue_statistics():
    cases = get_all_cases()
    if not cases:
        seed_cases = generate_seed_cases()
        for sc in seed_cases:
            save_case(sc)
        cases = get_all_cases()

    red = sum(1 for c in cases if c.priority_category == PriorityCategory.RED)
    orange = sum(1 for c in cases if c.priority_category == PriorityCategory.ORANGE)
    yellow = sum(1 for c in cases if c.priority_category == PriorityCategory.YELLOW)
    green = sum(1 for c in cases if c.priority_category == PriorityCategory.GREEN)
    pending = sum(1 for c in cases if c.reviewer_status == ReviewerStatus.PENDING)
    escalated = sum(1 for c in cases if c.escalation_status)
    avg_wait = sum(c.waiting_time_minutes for c in cases) / max(len(cases), 1)

    return QueueStats(
        total_cases=len(cases),
        red_count=red,
        orange_count=orange,
        yellow_count=yellow,
        green_count=green,
        pending_count=pending,
        escalated_count=escalated,
        average_wait_minutes=round(avg_wait, 1)
    )

@router.get("/case/{case_id}", response_model=TriageCase)
def get_triage_passport(case_id: str):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.post("/reset-demo")
def reset_to_demo_dataset():
    """Resets queue to the 5 standard synthetic fictional cases for judges."""
    purge_all_data()
    seed_cases = generate_seed_cases()
    for sc in seed_cases:
        save_case(sc)
        for log in sc.audit_trail:
            add_audit_log(log)
    return {"message": "Demo dataset reseeded successfully with 5 synthetic cases", "case_count": len(seed_cases)}

