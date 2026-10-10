"""
Pydantic Schemas and Data Models for SEHAT Triage Support Platform.
All health outputs are strictly advisory non-diagnostic triage aids requiring human review.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class PriorityCategory(str, Enum):
    GREEN = "GREEN"      # Routine review
    YELLOW = "YELLOW"    # Priority review
    ORANGE = "ORANGE"    # Prompt review
    RED = "RED"          # Urgent professional review

class ReviewerStatus(str, Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    OVERRIDDEN = "OVERRIDDEN"
    ESCALATED = "ESCALATED"

class SourceType(str, Enum):
    PATIENT_REPORTED = "patient_reported"
    OCR_EXTRACTED = "ocr_extracted"
    AI_INFERRED = "ai_inferred"
    DETERMINISTIC_RULE = "deterministic_rule"
    HUMAN_CONFIRMED = "human_confirmed"

class TimelineEvent(BaseModel):
    day_label: str = Field(..., description="e.g. 'Day -3', 'Day -1', 'Today'")
    title: str
    description: str
    is_exact_time: bool = True
    source: SourceType = SourceType.PATIENT_REPORTED
    detected_keywords: Optional[List[str]] = None

class LabReportValue(BaseModel):
    parameter: str
    value: str
    unit: str
    normal_range: str
    status: str = Field(..., description="'NORMAL', 'LOW', 'HIGH', 'CRITICAL_LOW', 'CRITICAL_HIGH', 'ABNORMAL'")
    ocr_confidence: float = Field(default=0.95, ge=0.0, le=1.0)
    is_uncertain: bool = False
    source: SourceType = SourceType.OCR_EXTRACTED
    bounding_box: Optional[Dict[str, int]] = None  # x, y, width, height for UI overlay

class VisualObservation(BaseModel):
    finding: str
    confidence: float = 0.85
    is_advisory_only: bool = True
    source: SourceType = SourceType.AI_INFERRED
    visual_cue: str = Field(..., description="e.g. Skin pallor, petechial rash, conjunctival injection")

class MissingInfoItem(BaseModel):
    item: str
    importance: str = Field(..., description="'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'")
    why_needed: str
    source: SourceType = SourceType.AI_INFERRED

class FollowUpQuestion(BaseModel):
    question_en: str
    question_hi: str
    target_info: str
    context: str

class SafetySignal(BaseModel):
    rule_code: str
    severity: PriorityCategory
    description: str
    trigger_metric: str
    trigger_value: str
    explainable_reason: str
    recommended_triage_action: str
    is_overridden: bool = False
    source: SourceType = SourceType.DETERMINISTIC_RULE

class HumanOverride(BaseModel):
    original_priority: PriorityCategory
    new_priority: PriorityCategory
    reason: str
    reviewer_name: str
    reviewer_role: str
    timestamp: str

class AuditLogEntry(BaseModel):
    id: str
    case_id: str
    action_type: str = Field(..., description="'INTAKE_CREATED', 'OCR_EXTRACTED', 'SPEECH_TRANSCRIBED', 'SAFETY_EVALUATED', 'REVIEWER_EDIT', 'PRIORITY_OVERRIDE', 'ESCALATION', 'STATUS_CHANGE', 'SESSION_PURGE'")
    performed_by: str
    role: str = Field(..., description="'SYSTEM_AI', 'HEALTH_WORKER', 'DOCTOR', 'ADMIN'")
    summary: str
    details: Optional[Dict[str, Any]] = None
    timestamp: str

class IntakeRequest(BaseModel):
    temp_patient_id: Optional[str] = None
    facility_name: str = "Khordha District Hospital"
    preferred_language: str = "hi"
    consent_granted: bool = True
    chief_concern: str
    spoken_audio_transcript: Optional[str] = None
    input_text: Optional[str] = None
    symptoms: List[str] = []
    duration_days: Optional[int] = None
    raw_lab_text: Optional[str] = None
    lab_report_image_base64: Optional[str] = None
    image_observation_cue: Optional[str] = None
    low_bandwidth_mode: bool = False

class TriageCase(BaseModel):
    id: str
    temp_patient_id: str
    consent_granted: bool
    preferred_language: str
    facility_name: str
    chief_concern: str
    patient_reported_symptoms: List[str]
    symptom_timeline: List[TimelineEvent]
    extracted_report_values: List[LabReportValue]
    visual_observations: List[VisualObservation]
    missing_information: List[MissingInfoItem]
    follow_up_questions: List[FollowUpQuestion]
    safety_signals: List[SafetySignal]
    priority_category: PriorityCategory
    deterministic_priority: PriorityCategory
    ai_confidence: float
    uncertainty_notes: List[str]
    reviewer_status: ReviewerStatus
    reviewer_notes: Optional[str] = None
    escalation_status: bool = False
    escalation_target: Optional[str] = None
    human_override: Optional[HumanOverride] = None
    waiting_time_minutes: int = 0
    completeness_score: int = 70
    low_bandwidth_mode: bool = False
    created_at: str
    updated_at: str
    audit_trail: List[AuditLogEntry] = []
    is_synthetic_demo: bool = True

class PriorityOverrideRequest(BaseModel):
    new_priority: PriorityCategory
    reason: str
    reviewer_name: str = "Dr. S. K. Mohapatra, MD"
    reviewer_role: str = "Senior Medical Officer"

class ReviewUpdateRequest(BaseModel):
    reviewer_status: ReviewerStatus
    reviewer_notes: Optional[str] = None
    reviewer_name: str = "Dr. S. K. Mohapatra, MD"
    escalate_to: Optional[str] = None
    additional_followups: Optional[List[str]] = None

class QueueStats(BaseModel):
    total_cases: int
    red_count: int
    orange_count: int
    yellow_count: int
    green_count: int
    pending_count: int
    escalated_count: int
    average_wait_minutes: float

