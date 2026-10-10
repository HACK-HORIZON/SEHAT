import { TriageCase, QueueStats, PriorityCategory, ReviewerStatus, PrivacyMetrics, FieldJustifications } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8088";

export async function fetchQueue(filters?: {
  priority?: string;
  status?: string;
  facility?: string;
  search?: string;
}): Promise<TriageCase[]> {
  const params = new URLSearchParams();
  if (filters?.priority) params.append("priority", filters.priority);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.facility) params.append("facility", filters.facility);
  if (filters?.search) params.append("search", filters.search);

  const res = await fetch(`${API_BASE}/triage/queue?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch queue");
  return res.json();
}

export async function fetchQueueStats(): Promise<QueueStats> {
  const res = await fetch(`${API_BASE}/triage/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch queue stats");
  return res.json();
}

export async function fetchCase(caseId: string): Promise<TriageCase> {
  const res = await fetch(`${API_BASE}/triage/case/${caseId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch case");
  return res.json();
}

export async function submitIntake(data: {
  temp_patient_id?: string;
  facility_name: string;
  preferred_language: string;
  consent_granted: boolean;
  chief_concern: string;
  spoken_audio_transcript?: string;
  input_text?: string;
  symptoms: string[];
  duration_days?: number;
  raw_lab_text?: string;
  lab_report_image_base64?: string;
  image_observation_cue?: string;
  low_bandwidth_mode: boolean;
}): Promise<TriageCase> {
  const res = await fetch(`${API_BASE}/intake/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to submit intake");
  }
  return res.json();
}

export async function overridePriority(
  caseId: string,
  payload: {
    new_priority: PriorityCategory;
    reason: string;
    reviewer_name?: string;
    reviewer_role?: string;
  }
): Promise<TriageCase> {
  const res = await fetch(`${API_BASE}/review/${caseId}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      new_priority: payload.new_priority,
      reason: payload.reason,
      reviewer_name: payload.reviewer_name || "Dr. S. K. Mohapatra, MD",
      reviewer_role: payload.reviewer_role || "Senior Medical Officer",
    }),
  });
  if (!res.ok) throw new Error("Failed to override priority");
  return res.json();
}

export async function updateReviewStatus(
  caseId: string,
  payload: {
    reviewer_status: ReviewerStatus;
    reviewer_notes?: string;
    reviewer_name?: string;
    escalate_to?: string;
  }
): Promise<TriageCase> {
  const res = await fetch(`${API_BASE}/review/${caseId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function escalateCase(
  caseId: string,
  target: string = "Senior Medical Officer - Emergency Resuscitation",
  reviewer_name: string = "Dr. S. K. Mohapatra"
): Promise<TriageCase> {
  const res = await fetch(`${API_BASE}/review/${caseId}/escalate?target=${encodeURIComponent(target)}&reviewer_name=${encodeURIComponent(reviewer_name)}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to escalate case");
  return res.json();
}

export async function requestMoreInfo(caseId: string): Promise<TriageCase> {
  const res = await fetch(`${API_BASE}/review/${caseId}/request-more-info`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to request more info");
  return res.json();
}

export async function fetchPrivacyMetrics(): Promise<PrivacyMetrics> {
  const res = await fetch(`${API_BASE}/privacy/metrics`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch privacy metrics");
  return res.json();
}

export async function fetchFieldJustifications(): Promise<FieldJustifications> {
  const res = await fetch(`${API_BASE}/privacy/justifications`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch justifications");
  return res.json();
}

export async function purgeSession(caseId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/privacy/purge-session/${caseId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to purge session");
  return res.json();
}

export async function resetDemoDataset(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/triage/reset-demo`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reset demo dataset");
  return res.json();
}

export async function getPresetAudioTranscripts(): Promise<{ id: string; label: string; transcript: string }[]> {
  const res = await fetch(`${API_BASE}/transcription/presets`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch transcription presets");
  return res.json();
}
