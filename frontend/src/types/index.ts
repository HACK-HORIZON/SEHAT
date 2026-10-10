export type PriorityCategory = "RED" | "ORANGE" | "YELLOW" | "GREEN";
export type ReviewerStatus = "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "OVERRIDDEN" | "ESCALATED";
export type SourceType = "patient_reported" | "ocr_extracted" | "ai_inferred" | "deterministic_rule" | "human_confirmed";

export interface TimelineEvent {
  day_label: string;
  title: string;
  description: string;
  is_exact_time: boolean;
  source: SourceType;
  detected_keywords?: string[];
}

export interface LabReportValue {
  parameter: string;
  value: string;
  unit: string;
  normal_range: string;
  status: "NORMAL" | "LOW" | "HIGH" | "CRITICAL_LOW" | "CRITICAL_HIGH" | "ELEVATED" | "ABNORMAL";
  ocr_confidence: number;
  is_uncertain: boolean;
  source: SourceType;
  bounding_box?: { x: number; y: number; width: number; height: number };
}

export interface VisualObservation {
  finding: string;
  confidence: number;
  is_advisory_only: boolean;
  source: SourceType;
  visual_cue: string;
}

export interface MissingInfoItem {
  item: string;
  importance: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  why_needed: string;
  source: SourceType;
}

export interface FollowUpQuestion {
  question_en: string;
  question_hi: string;
  target_info: string;
  context: string;
}

export interface SafetySignal {
  rule_code: string;
  severity: PriorityCategory;
  description: string;
  trigger_metric: string;
  trigger_value: string;
  explainable_reason: string;
  recommended_triage_action: string;
  is_overridden?: boolean;
  source: SourceType;
}

export interface HumanOverride {
  original_priority: PriorityCategory;
  new_priority: PriorityCategory;
  reason: string;
  reviewer_name: string;
  reviewer_role: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  case_id: string;
  action_type: string;
  performed_by: string;
  role: "SYSTEM_AI" | "HEALTH_WORKER" | "DOCTOR" | "ADMIN";
  summary: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface TriageCase {
  id: string;
  temp_patient_id: string;
  consent_granted: boolean;
  preferred_language: string;
  facility_name: string;
  chief_concern: string;
  patient_reported_symptoms: string[];
  symptom_timeline: TimelineEvent[];
  extracted_report_values: LabReportValue[];
  visual_observations: VisualObservation[];
  missing_information: MissingInfoItem[];
  follow_up_questions: FollowUpQuestion[];
  safety_signals: SafetySignal[];
  priority_category: PriorityCategory;
  deterministic_priority: PriorityCategory;
  ai_confidence: number;
  uncertainty_notes: string[];
  reviewer_status: ReviewerStatus;
  reviewer_notes?: string | null;
  escalation_status: boolean;
  escalation_target?: string | null;
  human_override?: HumanOverride | null;
  waiting_time_minutes: number;
  completeness_score: number;
  low_bandwidth_mode: boolean;
  created_at: string;
  updated_at: string;
  audit_trail: AuditLogEntry[];
  is_synthetic_demo: boolean;
}

export interface QueueStats {
  total_cases: number;
  red_count: number;
  orange_count: number;
  yellow_count: number;
  green_count: number;
  pending_count: number;
  escalated_count: number;
  average_wait_minutes: number;
}

export interface PrivacyMetrics {
  compliance_standards: string[];
  active_consent_rate: number;
  ephemeral_token_count: number;
  data_retention_days: number;
}

export interface FieldJustification {
  title: string;
  legal_basis: string;
  why_collected: string;
  retention: string;
}

export type FieldJustifications = Record<string, FieldJustification>;
