"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Languages,
  X,
  Sparkles,
  FileCheck2,
  Camera
} from "lucide-react";
import { submitIntake } from "@/services/api";
import { TriageCase } from "@/types";

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}
interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated: (newCase: TriageCase) => void;
  facilityName: string;
  lowBandwidthDefault: boolean;
}

export default function PatientIntakeModal({
  isOpen,
  onClose,
  onCaseCreated,
  facilityName,
  lowBandwidthDefault,
}: IntakeModalProps) {
  const [consentGranted, setConsentGranted] = useState(true);
  const [language, setLanguage] = useState("hi");
  const [chiefConcern, setChiefConcern] = useState("");
  const [durationDays, setDurationDays] = useState(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    "High-grade fever",
    "Chills and rigors",
  ]);
  const [rawLabText, setRawLabText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState("");

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const loadPreset = (type: "fever" | "chest" | "routine") => {
    if (type === "fever") {
      setLanguage("hi");
      setChiefConcern("मुझे पिछले तीन दिनों से बहुत तेज बुखार और कंपकंपी आ रही है। कल रात से हाथ-पैरों पर लाल चकत्ते भी दिखने लगे हैं।");
      setSpeechTranscript("मरीज ने 3 दिन से तेज बुखार, कंपकंपी और लाल चकत्ते बताए हैं।");
      setSelectedSymptoms(["High-grade fever", "Chills and rigors", "Petechial rash on lower limbs"]);
      setDurationDays(3);
    } else if (type === "chest") {
      setLanguage("hi");
      setChiefConcern("आज सुबह से सीने के बीच में बहुत भारीपन और दबाव लग रहा है। सांस खींचने में दिक्कत हो रही है और ठंडा पसीना आ रहा है।");
      setSpeechTranscript("आज सुबह से सीने में भारीपन, सांस फूलना और ठंडा पसीना।");
      setSelectedSymptoms(["Retrosternal chest heaviness", "Shortness of breath", "Cold diaphoresis"]);
      setDurationDays(1);
    } else {
      setLanguage("hi");
      setChiefConcern("दो दिन से हल्की सूखी खांसी और गले में खराश है। कोई बुखार नहीं है।");
      setSpeechTranscript("दो दिन से सूखी खांसी और गले में खराश।");
      setSelectedSymptoms(["Mild dry cough", "Throat irritation"]);
      setDurationDays(2);
    }
  };

  const loadSampleReport = (type: "cbc" | "hypoxemia") => {
    if (type === "cbc") {
      setRawLabText(`COMPLETE BLOOD COUNT (CBC) - DISTRICT HOSPITAL PATH LAB
Hemoglobin: 11.2 g/dL (Reference: 12.0 - 16.0)
Platelet Count: 24,000 / mcL (Reference: 150000 - 450000)
Total Leukocyte Count (TLC): 3200 / mcL (Reference: 4000 - 11000)
SpO2 (Pulse Oximetry): 96 % (Reference: 95 - 100)`);
    } else {
      setRawLabText(`EMERGENCY VITALS & GASES - CLINIC RESUSCITATION
SpO2 Saturation: 87 % (Reference: 95 - 100)
Random Blood Sugar: 215 mg/dL (Reference: 70 - 140)`);
    }
  };

  const handleToggleLiveMic = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    // SpeechRecognition requires secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (!isSecureContext) {
      alert("आवाज़ पहचान के लिए HTTPS या localhost आवश्यक है।");
      loadPreset("fever");
      return;
    }

    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognitionConstructor = (window as unknown as { SpeechRecognition: SpeechRecognitionStatic; webkitSpeechRecognition: SpeechRecognitionStatic }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: SpeechRecognitionStatic }).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = language === "hi" ? "hi-IN" : language === "or" ? "or-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;

      console.log("[SpeechRecognition] Starting with lang:", recognition.lang);

      recognition.onstart = () => {
        console.log("[SpeechRecognition] onstart");
        setIsRecording(true);
      };
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log("[SpeechRecognition] onresult", event);
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          const transcript = result[0].transcript.trim();
          console.log("[SpeechRecognition] Final transcript:", transcript);
          if (transcript) {
            setSpeechTranscript(transcript);
            setChiefConcern(transcript);
          }
          setIsRecording(false);
        } else {
          // Interim result - show what we're hearing
          const interim = result[0].transcript;
          console.log("[SpeechRecognition] Interim:", interim);
        }
      };
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("[SpeechRecognition] Error:", event.error, event.message);
        setIsRecording(false);
        if (event.error === "not-allowed") {
          alert("माइक्रोफ़ोन अनुमति आवश्यक है। ब्राउज़र सेटिंग्स में माइक्रोफ़ोन अनुमति दें।");
        } else if (event.error === "no-speech") {
          alert("कोई आवाज़ नहीं सुनी गई। कृपया फिर से कोशिश करें।");
        } else if (event.error === "network") {
          alert("नेटवर्क त्रुटि। इंटरनेट कनेक्शन जांचें।");
        } else if (event.error === "audio-capture") {
          alert("माइक्रोफ़ोन नहीं मिला। कृपया माइक्रोफ़ोन कनेक्ट करें।");
        } else {
          alert(`आवाज़ पहचान त्रुटि: ${event.error}`);
        }
      };
      recognition.onend = () => {
        console.log("[SpeechRecognition] onend");
        setIsRecording(false);
      };
      recognition.start();
    } else {
      alert("आपका ब्राउज़र आवाज़ पहचान का समर्थन नहीं करता। कृपया Chrome या Edge का उपयोग करें।");
      loadPreset("fever");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGranted) {
      alert("कृपया मरीज की सहमति सुनिश्चित करें।");
      return;
    }
    if (!chiefConcern.trim()) {
      alert("कृपया मरीज की समस्या दर्ज करें या माइक से बोलें।");
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep("आवाज व लक्षणों की जांच हो रही है...");

    try {
      await new Promise((r) => setTimeout(r, 600));
      setSubmissionStep("जांच रिपोर्ट व सुरक्षा नियमों का मिलान...");

      const newCase = await submitIntake({
        facility_name: facilityName === "ALL" ? "Khordha District Hospital" : facilityName,
        preferred_language: language,
        consent_granted: consentGranted,
        chief_concern: chiefConcern,
        spoken_audio_transcript: speechTranscript || undefined,
        input_text: chiefConcern,
        symptoms: selectedSymptoms,
        duration_days: durationDays,
        raw_lab_text: rawLabText || undefined,
        low_bandwidth_mode: lowBandwidthDefault,
      });

      setSubmissionStep("मरीज कतार में जुड़ गया!");
      await new Promise((r) => setTimeout(r, 400));
      onCaseCreated(newCase);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "पर्ची बनाने में त्रुटि हुई";
      alert(message);
    } finally {
      setIsSubmitting(false);
      setSubmissionStep("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 max-w-xl w-full rounded-2xl shadow-2xl p-6 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">नया मरीज दर्ज करें (New Patient)</h2>
              <p className="text-xs text-slate-500">आसान पर्ची निर्माण • बोलकर या लिखकर दर्ज करें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-4 text-xs">
          {/* Language Selection */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-teal-700" />
              मरीज की भाषा चुनें (Language):
            </span>
            <div className="flex gap-1.5">
              {[
                { code: "hi", label: "हिंदी" },
                { code: "en", label: "English" },
                { code: "or", label: "ଓଡ଼ିଆ" },
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                    language === l.code
                      ? "bg-teal-700 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* BIG TAP-TO-SPEAK BUTTON (RURAL USER FRIENDLY) */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-center">
            <div className="text-xs font-bold text-teal-950 mb-2">
              मरीज से बोलकर समस्या पूछें (Tap to Record Patient Voice):
            </div>

            <button
              type="button"
              onClick={handleToggleLiveMic}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span>{isRecording ? "सुन रहे हैं... (बोलें)" : "🎙️ माइक दबाकर बोलें (Tap to Speak)"}</span>
            </button>

            {/* Quick 1-Click Common Complaints */}
            <div className="mt-3 pt-2.5 border-t border-teal-200/60">
              <div className="text-[11px] font-bold text-teal-900 mb-1.5">या सीधे आम परेशानी चुनें (Quick Presets):</div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => loadPreset("fever")}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-teal-900 border border-teal-300 hover:bg-teal-100 cursor-pointer"
                >
                  🌡️ तेज बुखार व कंपकंपी
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("chest")}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-red-900 border border-red-300 hover:bg-red-50 cursor-pointer"
                >
                  🫀 सीने में दर्द व सांस फूलना
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("routine")}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  🤧 हल्की खांसी व जुकाम
                </button>
              </div>
            </div>
          </div>

          {/* Chief Concern Input */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              मरीज की समस्या (Chief Concern):
            </label>
            <textarea
              rows={2}
              value={chiefConcern}
              onChange={(e) => setChiefConcern(e.target.value)}
              placeholder="मरीज को क्या परेशानी हो रही है..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600"
              required
            ></textarea>
          </div>

          {/* Duration in Days */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                कितने दिनों से है (Duration):
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-teal-600"
                />
                <span className="text-xs font-semibold text-slate-600">दिन से</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                स्वास्थ्य केंद्र:
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-medium">
                {facilityName === "ALL" ? "Khordha District Hospital" : facilityName}
              </div>
            </div>
          </div>

          {/* Common Symptoms Checklist */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              लक्षण चुनें (Common Symptoms):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                "High-grade fever",
                "Chills and rigors",
                "Petechial rash on lower limbs",
                "Severe generalized weakness",
                "Retrosternal chest heaviness",
                "Shortness of breath",
                "Persistent vomiting",
                "Mild dry cough",
                "Abdominal pain",
              ].map((sym) => {
                const active = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer ${
                      active
                        ? "bg-teal-700 text-white font-bold border-teal-700"
                        : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lab Report Upload / Sample Report Button */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-purple-700" />
                जांच पर्चा / लैब रिपोर्ट (Lab Report OCR):
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => loadSampleReport("cbc")}
                  className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-semibold text-[11px] border border-purple-300 cursor-pointer"
                >
                  CBC रिपोर्ट (Plt 24k)
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleReport("hypoxemia")}
                  className="px-2 py-0.5 rounded bg-red-100 text-red-900 font-semibold text-[11px] border border-red-300 cursor-pointer"
                >
                  SpO2 87% रिपोर्ट
                </button>
              </div>
            </div>
            <textarea
              rows={2}
              value={rawLabText}
              onChange={(e) => setRawLabText(e.target.value)}
              placeholder="लैब रिपोर्ट का टेक्स्ट या ऊपर दिए बटन से डेमो रिपोर्ट लोड करें..."
              className="w-full bg-white font-mono text-[11px] border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-hidden focus:border-teal-600"
            ></textarea>
          </div>

          {/* Simple Consent Check */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="m-consent"
              checked={consentGranted}
              onChange={(e) => setConsentGranted(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 bg-white border-slate-300 cursor-pointer"
            />
            <label htmlFor="m-consent" className="text-xs text-slate-700 cursor-pointer">
              मरीज ने प्राथमिक जांच और टोकन निर्माण की सहमति दी है।
            </label>
          </div>

          {/* Progress Animation */}
          {isSubmitting && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-300 text-teal-900 text-xs font-bold flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
              <span>{submissionStep}</span>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>मरीज पर्ची बनाएं (Submit)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
