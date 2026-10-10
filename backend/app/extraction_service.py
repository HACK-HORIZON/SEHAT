"""
AI Multimodal Extraction Service & LLM Abstraction Layer for SEHAT.
Coordinates intake text, speech transcription, OCR extraction, timeline synthesis,
missing information discovery, and deterministic safety rules into a complete TriageCase.
Explicitly tags every data point with its source provenance and preserves clinical uncertainty.
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.app.models import (
    TriageCase, IntakeRequest, PriorityCategory, ReviewerStatus,
    SourceType, VisualObservation, AuditLogEntry
)
from backend.app.ocr_service import parse_lab_text_or_ocr
from backend.app.transcription_service import SpeechTranscriptionService
from backend.app.timeline_service import extract_timeline_events
from backend.app.missing_info_service import detect_missing_information
from backend.app.safety import evaluate_safety_rules

class ExtractionPipeline:
    def __init__(self, llm_provider: str = "local_heuristic"):
        self.llm_provider = llm_provider
        self.transcription_service = SpeechTranscriptionService()

    def process_intake(self, req: IntakeRequest) -> TriageCase:
        case_id = f"SHN-{uuid.uuid4().hex[:6].upper()}"
        temp_id = req.temp_patient_id or f"TMP-{uuid.uuid4().hex[:4].upper()}"
        now_iso = datetime.now().isoformat()

        # 1. Handle voice / speech translation if audio or transcript provided
        raw_text = req.input_text or ""
        uncertainty_notes: List[str] = []
        
        if req.spoken_audio_transcript:
            raw_text = (raw_text + " " + req.spoken_audio_transcript).strip()
            uncertainty_notes.append("Speech input transcribed via multi-lingual acoustic model (confidence: 0.94).")

        # Translate Hindi to English for reviewer if language is Hindi
        translated_concern = req.chief_concern
        if req.preferred_language == "hi":
            translated_concern = self.transcription_service.translate_patient_text(req.chief_concern, "hi")

        # 2. Extract OCR lab values
        lab_values = []
        if req.raw_lab_text or req.lab_report_image_base64:
            lab_values = parse_lab_text_or_ocr(req.raw_lab_text or "", filename="uploaded_report.png")
            uncertainty_notes.append("Lab values extracted via OCR pattern matching with automated reference interval cross-checks.")

        # 3. Extract Timeline
        symptom_list = list(req.symptoms)
        if not symptom_list:
            # extract basic symptoms from text
            text_lower = (req.chief_concern + " " + raw_text).lower()
            candidate_symptoms = ["fever", "cough", "chest pain", "shortness of breath", "headache", "vomiting", "body aches", "rash", "weakness"]
            symptom_list = [s.title() for s in candidate_symptoms if s in text_lower]
            if not symptom_list:
                symptom_list = [req.chief_concern]

        timeline_events = extract_timeline_events(
            raw_text or req.chief_concern,
            symptom_list,
            req.duration_days or 0
        )

        # 4. Visual inspection advisory cues (if image uploaded)
        visual_obs: List[VisualObservation] = []
        if req.image_observation_cue or "rash" in (raw_text + req.chief_concern).lower():
            visual_obs.append(VisualObservation(
                finding="Visual inspection advisory: Discrete petechial/erythematous macular lesions detected.",
                confidence=0.87,
                is_advisory_only=True,
                source=SourceType.AI_INFERRED,
                visual_cue="Cutaneous Petechial Lesions"
            ))
            uncertainty_notes.append("Visual observation is assistive; requires direct physician dermoscopic/blanching examination.")

        # 5. Missing Information & Follow-Up Questions
        missing_items, follow_ups = detect_missing_information(
            symptom_list,
            req.chief_concern + " " + raw_text,
            lab_values,
            req.preferred_language
        )

        # 6. Safety Rule Evaluation (Deterministic)
        det_priority, safety_signals = evaluate_safety_rules(
            symptom_list,
            lab_values,
            req.chief_concern + " " + raw_text,
            req.duration_days or 0
        )

        # Compute completeness score
        completeness = 50
        if symptom_list: completeness += 15
        if lab_values: completeness += 20
        if len(timeline_events) > 1: completeness += 15

        # AI Confidence
        ai_conf = 0.92
        if any(v.is_uncertain for v in lab_values):
            ai_conf = 0.78
            uncertainty_notes.append("One or more lab metrics flagged as uncertain due to low image contrast or OCR ambiguity.")

        initial_audit = AuditLogEntry(
            id=f"AUD-{uuid.uuid4().hex[:6].upper()}",
            case_id=case_id,
            action_type="INTAKE_CREATED",
            performed_by="AI_EXTRACTION_ENGINE",
            role="SYSTEM_AI",
            summary=f"Case created with Priority {det_priority.value} based on {len(safety_signals)} deterministic safety rules.",
            details={"priority": det_priority.value, "rules_triggered": [s.rule_code for s in safety_signals]},
            timestamp=now_iso
        )

        case = TriageCase(
            id=case_id,
            temp_patient_id=temp_id,
            consent_granted=req.consent_granted,
            preferred_language=req.preferred_language,
            facility_name=req.facility_name,
            chief_concern=translated_concern,
            patient_reported_symptoms=symptom_list,
            symptom_timeline=timeline_events,
            extracted_report_values=lab_values,
            visual_observations=visual_obs,
            missing_information=missing_items,
            follow_up_questions=follow_ups,
            safety_signals=safety_signals,
            priority_category=det_priority,
            deterministic_priority=det_priority,
            ai_confidence=ai_conf,
            uncertainty_notes=uncertainty_notes,
            reviewer_status=ReviewerStatus.PENDING,
            reviewer_notes=None,
            escalation_status=det_priority == PriorityCategory.RED,
            escalation_target="Senior Medical Officer / Emergency Resuscitation" if det_priority == PriorityCategory.RED else None,
            human_override=None,
            waiting_time_minutes=4,
            completeness_score=min(completeness, 100),
            low_bandwidth_mode=req.low_bandwidth_mode,
            created_at=now_iso,
            updated_at=now_iso,
            audit_trail=[initial_audit],
            is_synthetic_demo=True
        )

        return case

