"""
Audit Logging Router for SEHAT.
Provides immutable audit trail queries for medical legal compliance and reviewer transparency.
"""

from fastapi import APIRouter
from typing import List, Optional
from backend.app.models import AuditLogEntry
from backend.app.database import get_audit_logs

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("/logs", response_model=List[AuditLogEntry])
def query_audit_logs(case_id: Optional[str] = None):
    return get_audit_logs(case_id)

