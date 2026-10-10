import {
  TriageCase,
  QueueStats,
  PriorityCategory,
  ReviewerStatus,
  PrivacyMetrics,
  FieldJustifications,
} from "@/types";

const PROD_RENDER_URL = "https://sehat-sywu.onrender.com";

export function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://127.0.0.1:8088";
    }
    // In production on Vercel or any public domain, use the same-origin Next.js proxy
    return "/api/proxy";
  }

  return process.env.NODE_ENV === "production"
    ? PROD_RENDER_URL
    : "http://127.0.0.1:8088";
}

export const API_BASE = getApiBase();

/**
 * Robust universal fetch:
 * 1. Calls same-origin Next.js rewrite (/api/proxy/...) to prevent CORS/adblocker/mixed-network issues.
 * 2. If proxy is unavailable, falls back directly to Render production backend.
 */
async function safeFetch(path: string, options?: RequestInit): Promise<Response> {
  const base = getApiBase();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${cleanPath}`;

  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    if (
      typeof window !== "undefined" &&
      !base.includes("127.0.0.1") &&
      !base.includes("localhost") &&
      base !== PROD_RENDER_URL
    ) {
      console.warn("[SEHAT] Proxy request failed, falling back directly to Render backend...", err);
      const directUrl = `${PROD_RENDER_URL}${cleanPath}`;
      return await fetch(directUrl, options);
    }
    throw err;
  }
}

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

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await safeFetch(`/triage/queue${query}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch queue");
  return res.json();
}

export async function fetchQueueStats(): Promise<QueueStats> {
  const res = await safeFetch("/triage/stats", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch queue stats");
  return res.json();
}

export async function fetchCase(caseId: string): Promise<TriageCase> {
  const res = await safeFetch(`/triage/case/${caseId}`, { cache: "no-store" });
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
  const res = await safeFetch("/intake/submit", {
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
  const res = await safeFetch(`/review/${caseId}/override`, {
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
  const res = await safeFetch(`/review/${caseId}/status`, {
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
  const res = await safeFetch(
    `/review/${caseId}/escalate?target=${encodeURIComponent(
      target
    )}&reviewer_name=${encodeURIComponent(reviewer_name)}`,
    {
      method: "POST",
    }
  );
  if (!res.ok) throw new Error("Failed to escalate case");
  return res.json();
}

export async function requestMoreInfo(caseId: string): Promise<TriageCase> {
  const res = await safeFetch(`/review/${caseId}/request-more-info`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to request more info");
  return res.json();
}

export async function fetchPrivacyMetrics(): Promise<PrivacyMetrics> {
  const res = await safeFetch("/privacy/metrics", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch privacy metrics");
  return res.json();
}

export async function fetchFieldJustifications(): Promise<FieldJustifications> {
  const res = await safeFetch("/privacy/justifications", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch justifications");
  return res.json();
}

export async function purgeSession(caseId: string): Promise<{ success: boolean }> {
  const res = await safeFetch(`/privacy/purge-session/${caseId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to purge session");
  return res.json();
}

export async function resetDemoDataset(): Promise<{ success: boolean }> {
  const res = await safeFetch("/triage/reset-demo", {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reset demo dataset");
  return res.json();
}

export async function getPresetAudioTranscripts(): Promise<
  { id: string; label: string; transcript: string }[]
> {
  const res = await safeFetch("/transcription/presets", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch transcription presets");
  return res.json();
}

export async function purgeAllEphemeral(): Promise<{ status: string; message: string }> {
  const res = await safeFetch("/privacy/purge-all-ephemeral", {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to purge all ephemeral records");
  return res.json();
}
