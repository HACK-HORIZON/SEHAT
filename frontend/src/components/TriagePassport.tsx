"use client";

import React, { useState } from "react";
import {
  TriageCase,
  PriorityCategory,
  ReviewerStatus,
  SourceType,
} from "@/types";
import {
  ShieldAlert,
  Flame,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  ArrowRight,
  Printer,
  Microscope,
  Stethoscope,
  Volume2
} from "lucide-react";
import { UILanguage, translations } from "@/i18n/translations";

interface PassportProps {
  uiLang: UILanguage;
  triageCase: TriageCase | null;
  onOverridePriority: (caseId: string, newPriority: PriorityCategory, reason: string) => Promise<void>;
  onUpdateStatus: (caseId: string, status: ReviewerStatus, notes?: string) => Promise<void>;
  onEscalate: (caseId: string, target: string) => Promise<void>;
  onRequestMoreInfo: (caseId: string) => Promise<void>;
  isActionLoading: boolean;
}

export default function TriagePassport({
  uiLang,
  triageCase,
  onOverridePriority,
  onUpdateStatus,
  onEscalate,
  onRequestMoreInfo,
  isActionLoading,
}: PassportProps) {
  const t = translations[uiLang];
  const [activeTab, setActiveTab] = useState<"PASSPORT" | "OCR_VIEWER" | "AUDIT_TRAIL">("PASSPORT");
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [targetPriority, setTargetPriority] = useState<PriorityCategory>("ORANGE");
  const [overrideReason, setOverrideReason] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!triageCase) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-400">
        <FileText className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="text-sm font-bold text-slate-600">
          {uiLang === "or" ? "କୌଣସି ରୋଗୀ ଚୟନ ହୋଇନାହିଁ" : uiLang === "hi" ? "कोई मरीज नहीं चुना गया" : "No Patient Selected"}
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          {uiLang === "or"
            ? "ରୋଗୀଙ୍କ କେସ୍ କାର୍ଡ୍ ଦେଖିବା ପାଇଁ ବାମ ଧାଡ଼ିରୁ ଜଣେ ରୋଗୀଙ୍କୁ ବାଛନ୍ତୁ।"
            : uiLang === "hi"
            ? "मरीज का केस कार्ड देखने के लिए बाईं कतार से किसी मरीज पर टैप करें।"
            : "Select a patient from the queue to review their structured Triage Passport."}
        </p>
      </div>
    );
  }

  // Source Provenance Badge
  const renderSourceBadge = (source: SourceType) => {
    switch (source) {
      case "patient_reported":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{uiLang === "or" ? "ରୋଗୀ କହିଛନ୍ତି" : uiLang === "hi" ? "मरीज ने बताया" : "Patient-Reported"}</span>;
      case "ocr_extracted":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">{uiLang === "or" ? "ରିପୋର୍ଟରୁ ପଢ଼ାଗଲା" : uiLang === "hi" ? "रिपोर्ट से पढ़ा गया" : "OCR-Extracted"}</span>;
      case "ai_inferred":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{uiLang === "or" ? "ସହାୟକ ବିଶ୍ଳେଷଣ" : uiLang === "hi" ? "सहायक विश्लेषण" : "AI-Inferred"}</span>;
      case "deterministic_rule":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">{uiLang === "or" ? "ସୁରକ୍ଷା ନିୟମ" : uiLang === "hi" ? "सुरक्षा नियम" : "Safety Rule"}</span>;
      case "human_confirmed":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{uiLang === "or" ? "ଡାକ୍ତରୀ ପ୍ରମାଣିତ" : uiLang === "hi" ? "डॉक्टर द्वारा पुष्ट" : "Doctor-Confirmed"}</span>;
    }
  };

  const getPriorityBanner = (priority: PriorityCategory) => {
    switch (priority) {
      case "RED":
        return {
          bg: "bg-red-600 text-white",
          tag: t.priorityRedTag,
          sub: t.redSub,
          icon: <Flame className="w-5 h-5 text-white" />,
        };
      case "ORANGE":
        return {
          bg: "bg-orange-500 text-white",
          tag: t.priorityOrangeTag,
          sub: t.orangeSub,
          icon: <Zap className="w-5 h-5 text-white" />,
        };
      case "YELLOW":
        return {
          bg: "bg-amber-400 text-slate-950",
          tag: t.priorityYellowTag,
          sub: t.yellowSub,
          icon: <AlertTriangle className="w-5 h-5 text-slate-950" />,
        };
      case "GREEN":
      default:
        return {
          bg: "bg-emerald-600 text-white",
          tag: t.priorityGreenTag,
          sub: t.greenSub,
          icon: <CheckCircle2 className="w-5 h-5 text-white" />,
        };
    }
  };

  const pBanner = getPriorityBanner(triageCase.priority_category);

  const handleSpeechPlay = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = triageCase.preferred_language === "hi" ? "hi-IN" : "en-US";
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative">
      {/* Top Banner with High-Contrast Color */}
      <div className={`p-4 ${pBanner.bg} transition-colors duration-200`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-md font-mono text-xs font-black tracking-wider text-white">
              {t.tokenLabel}: {triageCase.temp_patient_id}
            </span>
            <span className="text-xs font-bold text-white/90">
              {triageCase.facility_name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("PASSPORT")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                activeTab === "PASSPORT" ? "bg-white text-slate-900 shadow-xs" : "bg-black/20 text-white hover:bg-black/30"
              }`}
            >
              {t.tabPassport}
            </button>
            <button
              onClick={() => setActiveTab("OCR_VIEWER")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                activeTab === "OCR_VIEWER" ? "bg-white text-slate-900 shadow-xs" : "bg-black/20 text-white hover:bg-black/30"
              }`}
            >
              {t.tabLab} ({triageCase.extracted_report_values.length})
            </button>
            <button
              onClick={() => setActiveTab("AUDIT_TRAIL")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                activeTab === "AUDIT_TRAIL" ? "bg-white text-slate-900 shadow-xs" : "bg-black/20 text-white hover:bg-black/30"
              }`}
            >
              {t.tabAudit} ({triageCase.audit_trail.length})
            </button>
            <button
              onClick={() => window.print()}
              title="Print"
              className="p-1 rounded-md bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Priority Title */}
        <div className="flex items-center gap-2.5 mt-2">
          {pBanner.icon}
          <div>
            <h2 className="text-base font-black leading-tight tracking-wide">{pBanner.tag}</h2>
            <p className="text-xs opacity-90 font-medium">{pBanner.sub}</p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {/* Synthetic Demo Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center text-xs text-amber-900 font-bold">
          {uiLang === "or"
            ? "ଡେମୋ କେସ୍ (SYNTHETIC DEMO DATA — ପ୍ରକୃତ ରୋଗୀ ନୁହଁନ୍ତି)"
            : uiLang === "hi"
            ? "डेमो केस (SYNTHETIC DEMO DATA — वास्तविक मरीज नहीं)"
            : "SYNTHETIC DEMO DATA — NOT REAL PATIENT INFORMATION"}
        </div>

        {activeTab === "PASSPORT" && (
          <div className="space-y-4">
            {/* 1. CHIEF MEDICAL CONCERN */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    {t.secComplaint}
                  </h3>
                  {renderSourceBadge("patient_reported")}
                </div>

                <button
                  onClick={() => handleSpeechPlay(triageCase.chief_concern)}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition cursor-pointer"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "text-teal-700 animate-pulse" : ""}`} />
                  <span>{t.speakAudioBtn}</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 leading-relaxed">
                {triageCase.chief_concern}
              </div>

              {/* Symptoms Pills */}
              <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                <span className="text-xs font-bold text-slate-500 mr-1">{t.reportedSymptoms}</span>
                {triageCase.patient_reported_symptoms.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* 2. TIMELINE OF SYMPTOMS */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    {t.secTimeline}
                  </h3>
                  {renderSourceBadge("ai_inferred")}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {triageCase.symptom_timeline.map((evt, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                        {evt.day_label}
                      </span>
                      {!evt.is_exact_time && (
                        <span className="text-[10px] text-amber-700 font-bold">
                          {uiLang === "or" ? "ସମୟ ଅସ୍ପଷ୍ଟ" : uiLang === "hi" ? "समय स्पष्ट नहीं" : "Time Unknown"}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900">{evt.title}</div>
                    <p className="text-xs text-slate-600 mt-1 leading-normal">{evt.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. SAFETY RULES & ALERTS */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    {t.secSafety}
                  </h3>
                  {renderSourceBadge("deterministic_rule")}
                </div>
              </div>

              {triageCase.safety_signals.length === 0 ? (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {t.noSafetyAlerts}
                </div>
              ) : (
                <div className="space-y-2">
                  {triageCase.safety_signals.map((sig, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border ${
                        sig.severity === "RED"
                          ? "bg-red-50 border-red-300 text-red-950"
                          : sig.severity === "ORANGE"
                          ? "bg-orange-50 border-orange-300 text-orange-950"
                          : "bg-amber-50 border-amber-300 text-amber-950"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-black text-xs">{sig.description}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-current">
                          {uiLang === "or" ? "ମୂଲ୍ୟ" : uiLang === "hi" ? "वैल्यू" : "Value"}: {sig.trigger_value}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-normal mb-1.5">
                        <strong>{uiLang === "or" ? "କାରଣ (Reason):" : uiLang === "hi" ? "कारण (Reason):" : "Reason:"}</strong> {sig.explainable_reason}
                      </p>
                      <div className="text-xs font-bold text-slate-900 bg-white/80 p-2 rounded-lg border border-slate-200 flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span>{uiLang === "or" ? "ସୁପାରିଶ:" : uiLang === "hi" ? "सुझाव:" : "Action:"} {sig.recommended_triage_action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. LAB REPORT VALUES */}
            {triageCase.extracted_report_values.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Microscope className="w-3.5 h-3.5 text-purple-700" />
                      {t.secLab}
                    </h3>
                    {renderSourceBadge("ocr_extracted")}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold">
                        <th className="pb-2">{uiLang === "or" ? "ପରୀକ୍ଷା (Test)" : uiLang === "hi" ? "जांच (Test)" : "Test"}</th>
                        <th className="pb-2">{uiLang === "or" ? "ଫଳାଫଳ (Result)" : uiLang === "hi" ? "मरीज की वैल्यू" : "Result"}</th>
                        <th className="pb-2">{uiLang === "or" ? "ମାନକ (Reference Range)" : uiLang === "hi" ? "सामान्य सीमा" : "Ref Range"}</th>
                        <th className="pb-2">{uiLang === "or" ? "ସ୍ଥିତି (Status)" : uiLang === "hi" ? "स्थिति" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {triageCase.extracted_report_values.map((v, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 font-bold text-slate-900">{v.parameter}</td>
                          <td className="py-2 font-black text-sm text-slate-900">
                            {v.value} <span className="text-xs font-normal text-slate-500">{v.unit}</span>
                          </td>
                          <td className="py-2 text-slate-600 font-medium">{v.normal_range}</td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                v.status.includes("CRITICAL")
                                  ? "bg-red-600 text-white"
                                  : v.status === "LOW" || v.status === "HIGH"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {v.status === "CRITICAL_LOW"
                                ? uiLang === "or" ? "ଗୁରୁତର କମ୍ (Critical Low)" : uiLang === "hi" ? "खतरनाक कम (Critical Low)" : "Critical Low"
                                : v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. INFORMATION STILL NEEDED & QUESTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Missing Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    {t.secNeededInfo}
                  </h3>
                  {renderSourceBadge("ai_inferred")}
                </div>

                <div className="space-y-2">
                  {triageCase.missing_information.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                      <strong className="text-slate-900 block font-bold mb-0.5">{m.item}</strong>
                      <p className="text-slate-600 text-[11px] leading-normal">{m.why_needed}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up Questions */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    {t.secQuestions}
                  </h3>
                  <button
                    onClick={() => onRequestMoreInfo(triageCase.id)}
                    disabled={isActionLoading}
                    className="text-[11px] font-bold px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer"
                  >
                    {t.sendToPatientBtn}
                  </button>
                </div>

                <div className="space-y-2">
                  {triageCase.follow_up_questions.map((q, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900 leading-normal">
                        &ldquo;{uiLang === "or" ? q.question_hi : q.question_hi}&rdquo;
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 italic">
                        English: {q.question_en}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OCR REPORT VIEWER */}
        {activeTab === "OCR_VIEWER" && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              {uiLang === "or" ? "ଲାବ୍ ରିପୋର୍ଟ ପର୍ଚି (Paper Lab Slip View)" : "जांच रिपोर्ट पर्ची (Paper Lab Slip View)"}
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-800 space-y-2">
              <div className="font-bold border-b border-slate-300 pb-2 text-center text-slate-900">
                DISTRICT HOSPITAL PATHOLOGY LAB • GOVT OF ODISHA
              </div>
              <div className="text-slate-600 text-center text-[11px]">
                {t.tokenLabel}: {triageCase.temp_patient_id} | Complete Blood Count (CBC)
              </div>
              <div className="mt-3 space-y-2">
                {triageCase.extracted_report_values.map((v, i) => (
                  <div key={i} className="flex justify-between p-2 rounded bg-white border border-slate-200">
                    <span className="font-bold">{v.parameter}:</span>
                    <span className="font-black text-slate-900">{v.value} {v.unit}</span>
                    <span className="text-[11px] text-slate-500">{v.normal_range}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.status.includes("CRITICAL") ? "bg-red-600 text-white" : "bg-slate-100"}`}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeTab === "AUDIT_TRAIL" && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              {uiLang === "or" ? "ସିଷ୍ଟମ୍ ଲଗ୍ ଓ ଡାକ୍ତରୀ ନିଷ୍ପତ୍ତି ରେକର୍ଡ" : "सिस्टम लॉग व डॉक्टर निर्णय रिकॉर्ड"}
            </h3>
            {triageCase.audit_trail.map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between text-slate-500 text-[10px] mb-1">
                  <span className="font-bold text-teal-800">{log.action_type}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-800 font-medium">{log.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS - BIG, CLEAR TOUCH-FRIENDLY BUTTONS */}
      <div className="p-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Stethoscope className="w-4 h-4 text-teal-700" />
          <span>{t.actionControls}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Change Priority */}
          <button
            onClick={() => setOverrideModalOpen(true)}
            disabled={isActionLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition cursor-pointer"
          >
            {t.btnChangePriority}
          </button>

          {/* Escalate Button */}
          <button
            onClick={() => onEscalate(triageCase.id, "Emergency Medical Officer")}
            disabled={isActionLoading || triageCase.escalation_status}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              triageCase.escalation_status
                ? "bg-red-100 text-red-800 border-red-300 opacity-60"
                : "bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-xs"
            }`}
          >
            {triageCase.escalation_status ? t.btnEscalated : t.btnEscalate}
          </button>

          {/* Mark Reviewed */}
          <button
            onClick={() => onUpdateStatus(triageCase.id, "VERIFIED")}
            disabled={isActionLoading || triageCase.reviewer_status === "VERIFIED"}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              triageCase.reviewer_status === "VERIFIED"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
            }`}
          >
            {triageCase.reviewer_status === "VERIFIED" ? t.btnMarkedDone : t.btnMarkDone}
          </button>
        </div>
      </div>

      {/* OVERRIDE PRIORITY MODAL */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-700" />
              {t.btnChangePriority}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {uiLang === "or"
                ? "ଡାକ୍ତରଙ୍କ ଅନୁଭବ ସର୍ବୋପରି। ଅଗ୍ରାଧିକାର ବଦଳାଇବା ପାଇଁ କାରଣ ଦର୍ଶାନ୍ତୁ।"
                : uiLang === "hi"
                ? "डॉक्टर का अनुभव सर्वोच्च है। प्राथमिकता बदलने के लिए कारण दर्ज करें।"
                : "Human-in-the-loop oversight. Enter a clinical justification for priority override."}
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-800 font-bold block mb-1.5">
                  {uiLang === "or" ? "ନୂଆ ଶ୍ରେଣୀ ବାଛନ୍ତୁ:" : uiLang === "hi" ? "नई श्रेणी चुनें:" : "Select New Category:"}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["RED", "ORANGE", "YELLOW", "GREEN"] as PriorityCategory[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTargetPriority(p)}
                      className={`p-2 rounded-xl font-bold border text-center transition cursor-pointer ${
                        targetPriority === p
                          ? p === "RED"
                            ? "bg-red-600 text-white border-red-600"
                            : p === "ORANGE"
                            ? "bg-orange-500 text-white border-orange-500"
                            : p === "YELLOW"
                            ? "bg-amber-400 text-slate-950 border-amber-400"
                            : "bg-emerald-600 text-white border-emerald-600"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {p === "RED"
                        ? uiLang === "or" ? "ଲାଲ" : uiLang === "hi" ? "लाल" : "RED"
                        : p === "ORANGE"
                        ? uiLang === "or" ? "କମଳା" : uiLang === "hi" ? "नारंगी" : "ORANGE"
                        : p === "YELLOW"
                        ? uiLang === "or" ? "ହଳଦିଆ" : uiLang === "hi" ? "पीला" : "YELLOW"
                        : uiLang === "or" ? "ସବୁଜ" : uiLang === "hi" ? "हरा" : "GREEN"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1.5">
                  {uiLang === "or" ? "କାରଣ ଲେଖନ୍ତୁ (Reason):" : uiLang === "hi" ? "कारण दर्ज करें (Reason):" : "Clinical Reason:"}
                </label>
                <textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Clinical reason..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600"
                ></textarea>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setOverrideModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                {uiLang === "or" ? "ବାତିଲ୍" : uiLang === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={!overrideReason.trim() || isActionLoading}
                onClick={async () => {
                  await onOverridePriority(triageCase.id, targetPriority, overrideReason);
                  setOverrideModalOpen(false);
                  setOverrideReason("");
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {uiLang === "or" ? "ସଂରକ୍ଷଣ କରନ୍ତୁ" : uiLang === "hi" ? "सुरक्षित करें" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
