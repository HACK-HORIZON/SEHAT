"""
Human Reviewer Actions Router for SEHAT.
Enables clinician override, escalation, verification, and follow-up requests with immutable audit logging.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
from backend.app.models import (
    TriageCase, PriorityOverrideRequest, ReviewUpdateRequest,
    HumanOverride, AuditLogEntry, ReviewerStatus
)
from backend.app.database import get_case_by_id, save_case, add_audit_log

router = APIRouter(prefix="/review", tags=["Reviewer Controls"])

@router.post("/{case_id}/override", response_model=TriageCase)
def override_case_priority(case_id: str, req: PriorityOverrideRequest):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    old_priority = case.priority_category
    case.priority_category = req.new_priority
    case.reviewer_status = ReviewerStatus.OVERRIDDEN
    case.updated_at = datetime.now().isoformat()
    
    override = HumanOverride(
        original_priority=old_priority,
        new_priority=req.new_priority,
        reason=req.reason,
        reviewer_name=req.reviewer_name,
        reviewer_role=req.reviewer_role,
        timestamp=datetime.now().isoformat()
    )
    case.human_override = override

    # Record in audit trail
    log_entry = AuditLogEntry(
        id=f"AUD-{uuid.uuid4().hex[:6].upper()}",
        case_id=case_id,
        action_type="PRIORITY_OVERRIDE",
        performed_by=req.reviewer_name,
        role="DOCTOR",
        summary=f"Priority manually overridden from {old_priority.value} to {req.new_priority.value}. Reason: {req.reason}",
        details={"from": old_priority.value, "to": req.new_priority.value, "reason": req.reason},
        timestamp=datetime.now().isoformat()
    )
    case.audit_trail.append(log_entry)
    save_case(case)
    add_audit_log(log_entry)
    return case

@router.post("/{case_id}/status", response_model=TriageCase)
def update_review_status(case_id: str, req: ReviewUpdateRequest):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case.reviewer_status = req.reviewer_status
    if req.reviewer_notes:
        case.reviewer_notes = req.reviewer_notes
    if req.escalate_to:
        case.escalation_status = True
        case.escalation_target = req.escalate_to
    
    case.updated_at = datetime.now().isoformat()

    log_entry = AuditLogEntry(
        id=f"AUD-{uuid.uuid4().hex[:6].upper()}",
        case_id=case_id,
        action_type="STATUS_CHANGE",
        performed_by=req.reviewer_name,
        role="DOCTOR",
        summary=f"Review status changed to {req.reviewer_status.value}. Notes: {req.reviewer_notes or 'None'}",
        details={"new_status": req.reviewer_status.value, "notes": req.reviewer_notes},
        timestamp=datetime.now().isoformat()
    )
    case.audit_trail.append(log_entry)
    save_case(case)
    add_audit_log(log_entry)
    return case

@router.post("/{case_id}/escalate", response_model=TriageCase)
def escalate_case(case_id: str, target: str = "Senior Medical Officer - Emergency Resuscitation", reviewer_name: str = "Dr. S. K. Mohapatra"):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case.escalation_status = True
    case.escalation_target = target
    case.reviewer_status = ReviewerStatus.ESCALATED
    case.updated_at = datetime.now().isoformat()

    log_entry = AuditLogEntry(
        id=f"AUD-{uuid.uuid4().hex[:6].upper()}",
        case_id=case_id,
        action_type="ESCALATION",
        performed_by=reviewer_name,
        role="DOCTOR",
        summary=f"Case escalated to {target}.",
        details={"escalated_to": target},
        timestamp=datetime.now().isoformat()
    )
    case.audit_trail.append(log_entry)
    save_case(case)
    add_audit_log(log_entry)
    return case

@router.post("/{case_id}/request-more-info", response_model=TriageCase)
def request_more_information(case_id: str, reviewer_name: str = "Triage Nurse / Reviewer"):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    log_entry = AuditLogEntry(
        id=f"AUD-{uuid.uuid4().hex[:6].upper()}",
        case_id=case_id,
        action_type="REQUEST_INFO",
        performed_by=reviewer_name,
        role="HEALTH_WORKER",
        summary=f"Triggered follow-up prompt dispatch to patient kiosk in {case.preferred_language.upper()}.",
        details={"language": case.preferred_language, "questions_count": len(case.follow_up_questions)},
        timestamp=datetime.now().isoformat()
    )
    case.audit_trail.append(log_entry)
    save_case(case)
    add_audit_log(log_entry)
    return case

