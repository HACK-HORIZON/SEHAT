"use client";

import React, { useState, useEffect } from "react";
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
  initialLanguage?: string;
}

const COMMON_SYMPTOMS = [
  { id: "High-grade fever", en: "High-grade fever", hi: "तेज बुखार (High fever)", or: "ପ୍ରବଳ ଜ୍ୱର (High fever)" },
  { id: "Chills and rigors", en: "Chills and rigors", hi: "कंपकंपी (Chills & rigors)", or: "କମ୍ପନ (Chills & rigors)" },
  { id: "Petechial rash on lower limbs", en: "Petechial rash on lower limbs", hi: "पैरों पर लाल चकत्ते (Petechial rash)", or: "ଗୋଡ଼ରେ ଲାଲ ଦାଗ (Petechial rash)" },
  { id: "Severe generalized weakness", en: "Severe generalized weakness", hi: "अत्यधिक कमजोरी (Severe weakness)", or: "ଅତ୍ୟଧିକ ଦୁର୍ବଳତା (Severe weakness)" },
  { id: "Retrosternal chest heaviness", en: "Retrosternal chest heaviness", hi: "सीने में भारीपन (Chest heaviness)", or: "ଛାତି ଭାରୀ ଲାଗିବା (Chest heaviness)" },
  { id: "Shortness of breath", en: "Shortness of breath", hi: "सांस फूलना (Shortness of breath)", or: "ଶ୍ୱାସକଷ୍ଟ (Shortness of breath)" },
  { id: "Persistent vomiting", en: "Persistent vomiting", hi: "लगातार उल्टी (Persistent vomiting)", or: "ଲଗାତାର ବାନ୍ତି (Persistent vomiting)" },
  { id: "Mild dry cough", en: "Mild dry cough", hi: "हल्की सूखी खांसी (Mild dry cough)", or: "ସାମାନ୍ୟ ଶୁଖିଲା କାଶ (Mild dry cough)" },
  { id: "Abdominal pain", en: "Abdominal pain", hi: "पेट में दर्द (Abdominal pain)", or: "ପେଟ ଯନ୍ତ୍ରଣା (Abdominal pain)" },
];

const MODAL_TEXT: Record<string, {
  title: string;
  subtitle: string;
  langSelect: string;
  micSectionTitle: string;
  tapToSpeak: string;
  listening: string;
  presetsTitle: string;
  presetFever: string;
  presetChest: string;
  presetRoutine: string;
  chiefConcernLabel: string;
  chiefConcernPlaceholder: string;
  durationLabel: string;
  durationUnit: string;
  facilityLabel: string;
  symptomsLabel: string;
  labReportLabel: string;
  cbcBtn: string;
  spo2Btn: string;
  labPlaceholder: string;
  consentLabel: string;
  cancelBtn: string;
  submitBtn: string;
  submitting1: string;
  submitting2: string;
  submitted: string;
  alertConsent: string;
  alertConcern: string;
  alertMicSecure: string;
  alertMicPermission: string;
  alertNoSpeech: string;
  alertNetwork: string;
  alertNoMic: string;
  alertSpeechError: string;
  alertNotSupported: string;
  alertSubmitError: string;
}> = {
  en: {
    title: "New Patient Registration",
    subtitle: "Rapid Triage Intake • Register via Voice or Text",
    langSelect: "Select Patient Language (Language):",
    micSectionTitle: "Ask Patient & Record Voice (Tap to Record Patient Voice):",
    tapToSpeak: "🎙️ Tap to Speak",
    listening: "Listening... (Please speak now)",
    presetsTitle: "Or choose common patient complaints (Quick Presets):",
    presetFever: "🌡️ High Fever & Chills",
    presetChest: "🫀 Chest Pain & Breathlessness",
    presetRoutine: "🤧 Mild Cough & Cold",
    chiefConcernLabel: "Chief Concern (Patient Complaint):",
    chiefConcernPlaceholder: "Describe patient's symptoms or speak via mic...",
    durationLabel: "Duration:",
    durationUnit: "days",
    facilityLabel: "Health Facility:",
    symptomsLabel: "Select Common Symptoms:",
    labReportLabel: "Lab Report / Diagnostic Slip (Lab Report OCR):",
    cbcBtn: "CBC Report (Plt 24k)",
    spo2Btn: "SpO2 87% Report",
    labPlaceholder: "Paste lab report text or load demo report using the buttons above...",
    consentLabel: "Patient has provided informed consent for primary triage and temporary token creation.",
    cancelBtn: "Cancel",
    submitBtn: "Create Patient Token (Submit)",
    submitting1: "Analyzing voice transcript & symptoms...",
    submitting2: "Evaluating lab findings & safety rules...",
    submitted: "Patient added to triage queue!",
    alertConsent: "Please ensure patient consent is granted.",
    alertConcern: "Please enter patient complaint or speak via microphone.",
    alertMicSecure: "Speech recognition requires HTTPS or localhost.",
    alertMicPermission: "Microphone permission is required. Please allow microphone access in browser settings.",
    alertNoSpeech: "No speech heard. Please try speaking again.",
    alertNetwork: "Network error occurred. Please check internet connection.",
    alertNoMic: "Microphone not found. Please connect a microphone.",
    alertSpeechError: "Voice recognition error:",
    alertNotSupported: "Your browser does not support voice recognition. Please use Google Chrome or Microsoft Edge.",
    alertSubmitError: "Failed to create patient token",
  },
  hi: {
    title: "नया मरीज दर्ज करें (New Patient)",
    subtitle: "आसान पर्ची निर्माण • बोलकर या लिखकर दर्ज करें",
    langSelect: "मरीज की भाषा चुनें (Language):",
    micSectionTitle: "मरीज से बोलकर समस्या पूछें (Tap to Record Patient Voice):",
    tapToSpeak: "🎙️ माइक दबाकर बोलें (Tap to Speak)",
    listening: "सुन रहे हैं... (बोलें)",
    presetsTitle: "या सीधे आम परेशानी चुनें (Quick Presets):",
    presetFever: "🌡️ तेज बुखार व कंपकंपी",
    presetChest: "🫀 सीने में दर्द व सांस फूलना",
    presetRoutine: "🤧 हल्की खांसी व जुकाम",
    chiefConcernLabel: "मरीज की समस्या (Chief Concern):",
    chiefConcernPlaceholder: "मरीज को क्या परेशानी हो रही है...",
    durationLabel: "कितने दिनों से है (Duration):",
    durationUnit: "दिन से",
    facilityLabel: "स्वास्थ्य केंद्र:",
    symptomsLabel: "लक्षण चुनें (Common Symptoms):",
    labReportLabel: "जांच पर्चा / लैब रिपोर्ट (Lab Report OCR):",
    cbcBtn: "CBC रिपोर्ट (Plt 24k)",
    spo2Btn: "SpO2 87% रिपोर्ट",
    labPlaceholder: "लैब रिपोर्ट का टेक्स्ट या ऊपर दिए बटन से डेमो रिपोर्ट लोड करें...",
    consentLabel: "मरीज ने प्राथमिक जांच और टोकन निर्माण की सहमति दी है।",
    cancelBtn: "रद्द करें (Cancel)",
    submitBtn: "मरीज पर्ची बनाएं (Submit)",
    submitting1: "आवाज व लक्षणों की जांच हो रही है...",
    submitting2: "जांच रिपोर्ट व सुरक्षा नियमों का मिलान...",
    submitted: "मरीज कतार में जुड़ गया!",
    alertConsent: "कृपया मरीज की सहमति सुनिश्चित करें।",
    alertConcern: "कृपया मरीज की समस्या दर्ज करें या माइक से बोलें।",
    alertMicSecure: "आवाज़ पहचान के लिए HTTPS या localhost आवश्यक है।",
    alertMicPermission: "माइक्रोफ़ोन अनुमति आवश्यक है। ब्राउज़र सेटिंग्स में माइक्रोफ़ोन अनुमति दें।",
    alertNoSpeech: "कोई आवाज़ नहीं सुनी गई। कृपया फिर से कोशिश करें।",
    alertNetwork: "नेटवर्क त्रुटि। इंटरनेट कनेक्शन जांचें।",
    alertNoMic: "माइक्रोफ़ोन नहीं मिला। कृपया माइक्रोफ़ोन कनेक्ट करें।",
    alertSpeechError: "आवाज़ पहचान त्रुटि:",
    alertNotSupported: "आपका ब्राउज़र आवाज़ पहचान का समर्थन नहीं करता। कृपया Chrome या Edge का उपयोग करें।",
    alertSubmitError: "पर्ची बनाने में त्रुटि हुई",
  },
  or: {
    title: "ନୂତନ ରୋଗୀ ପଞ୍ଜୀକରଣ (New Patient)",
    subtitle: "ସହଜ ଟୋକନ୍ ନିର୍ମାଣ • କହିକି କିମ୍ବା ଲେଖିକି ଦାଖଲ କରନ୍ତୁ",
    langSelect: "ରୋଗୀଙ୍କ ଭାଷା ବାଛନ୍ତୁ (Language):",
    micSectionTitle: "ରୋଗୀଙ୍କ ସମସ୍ୟା ଶୁଣନ୍ତୁ (Tap to Record Patient Voice):",
    tapToSpeak: "🎙️ ମାଇକ୍ ଦବାଇ କୁହନ୍ତୁ (Tap to Speak)",
    listening: "ଶୁଣୁଛୁ... (ଦୟାକରି କୁହନ୍ତୁ)",
    presetsTitle: "ସିଧାସଳଖ ସାଧାରଣ ସମସ୍ୟା ବାଛନ୍ତୁ (Quick Presets):",
    presetFever: "🌡️ ପ୍ରବଳ ଜ୍ୱର ଓ କମ୍ପନ",
    presetChest: "🫀 ଛାତି ଯନ୍ତ୍ରଣା ଓ ଶ୍ୱାସକଷ୍ଟ",
    presetRoutine: "🤧 ସାମାନ୍ୟ କାଶ ଓ ଥଣ୍ଡା",
    chiefConcernLabel: "ରୋଗୀଙ୍କ ସମସ୍ୟା (Chief Concern):",
    chiefConcernPlaceholder: "ରୋଗୀଙ୍କୁ କଣ ଅସୁବିଧା ହେଉଛି...",
    durationLabel: "କେତେ ଦିନରୁ ହେଉଛି (Duration):",
    durationUnit: "ଦିନରୁ",
    facilityLabel: "ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର:",
    symptomsLabel: "ଲକ୍ଷଣ ବାଛନ୍ତୁ (Common Symptoms):",
    labReportLabel: "ପରୀକ୍ଷା ରିପୋର୍ଟ (Lab Report OCR):",
    cbcBtn: "CBC ରିପୋର୍ଟ (Plt 24k)",
    spo2Btn: "SpO2 87% ରିପୋର୍ଟ",
    labPlaceholder: "ରିପୋର୍ଟର ତଥ୍ୟ ଲେଖନ୍ତୁ କିମ୍ବା ଉପର ବଟନ ଦବାନ୍ତୁ...",
    consentLabel: "ରୋଗୀ ପ୍ରାଥମିକ ଯାଞ୍ଚ ଓ ଟୋକନ୍ ନିର୍ମାଣ ପାଇଁ ସହମତି ଦେଇଛନ୍ତି।",
    cancelBtn: "ବାତିଲ କରନ୍ତୁ (Cancel)",
    submitBtn: "ରୋଗୀ ଟୋକନ୍ ତିଆରି କରନ୍ତୁ (Submit)",
    submitting1: "ସ୍ୱର ଏବଂ ଲକ୍ଷଣ ଯାଞ୍ଚ ହେଉଛି...",
    submitting2: "ରିପୋର୍ଟ ଏବଂ ସୁରକ୍ଷା ନିୟମ ଯାଞ୍ଚ ହେଉଛି...",
    submitted: "ରୋଗୀ ତାଲିକାରେ ଯୋଡି ହୋଇଗଲା!",
    alertConsent: "ଦୟାକରି ରୋଗୀଙ୍କ ସମ୍ମତି ନିଶ୍ଚିତ କରନ୍ତୁ।",
    alertConcern: "ଦୟାକରି ରୋଗୀଙ୍କ ସମସ୍ୟା ଲେଖନ୍ତୁ କିମ୍ବା ମାଇକରେ କୁହନ୍ତୁ।",
    alertMicSecure: "ସ୍ୱର ଚିହ୍ନଟ ପାଇଁ HTTPS କିମ୍ବା localhost ଆବଶ୍ୟକ।",
    alertMicPermission: "ମାଇକ୍ରୋଫୋନ ଅନୁମତି ଆବଶ୍ୟକ। ବ୍ରାଉଜର ସେଟିଂସରେ ଅନୁମତି ଦିଅନ୍ତୁ।",
    alertNoSpeech: "କୌଣସି ସ୍ୱର ଶୁଣାଗଲା ନାହିଁ। ପୁଣି ଥରେ ଚେଷ୍ଟା କରନ୍ତୁ।",
    alertNetwork: "ନେଟୱାର୍କ ତ୍ରୁଟି। ଇଣ୍ଟରନେଟ ସଂଯୋଗ ଯାଞ୍ଚ କରନ୍ତୁ।",
    alertNoMic: "ମାଇକ୍ରୋଫୋନ ମିଳିଲା ନାହିଁ।",
    alertSpeechError: "ସ୍ୱର ଚିହ୍ନଟ ତ୍ରୁଟି:",
    alertNotSupported: "ଆପଣଙ୍କ ବ୍ରାଉଜର ସ୍ୱର ଚିହ୍ନଟ ସମର୍ଥନ କରୁନାହିଁ। Chrome କିମ୍ବା Edge ବ୍ୟବହାର କରନ୍ତୁ।",
    alertSubmitError: "ଦାଖଲ କରିବାରେ ତ୍ରୁଟି ଘଟିଛି",
  }
};

export default function PatientIntakeModal({
  isOpen,
  onClose,
  onCaseCreated,
  facilityName,
  lowBandwidthDefault,
  initialLanguage = "hi",
}: IntakeModalProps) {
  const [consentGranted, setConsentGranted] = useState(true);
  const [language, setLanguage] = useState(initialLanguage || "hi");
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

  useEffect(() => {
    if (initialLanguage && (initialLanguage === "en" || initialLanguage === "hi" || initialLanguage === "or")) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  if (!isOpen) return null;

  const t = MODAL_TEXT[language] || MODAL_TEXT.hi;

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const loadPreset = (type: "fever" | "chest" | "routine") => {
    if (type === "fever") {
      if (language === "en") {
        setChiefConcern("I have had very high fever and chills for the past 3 days. Red petechial rashes appeared on my lower limbs since last night.");
        setSpeechTranscript("Patient reports high fever for 3 days, chills, and lower limb petechial rash.");
      } else if (language === "or") {
        setChiefConcern("ମୋତେ ଗତ ୩ ଦିନ ହେବ ପ୍ରବଳ ଜ୍ୱର ଓ କମ୍ପନ ହେଉଛି। ଗତ ରାତିରୁ ଗୋଡ଼ରେ ଲାଲ ଦାଗ ମଧ୍ୟ ଦେଖାଯାଉଛି।");
        setSpeechTranscript("ରୋଗୀ ୩ ଦିନରୁ ପ୍ରବଳ ଜ୍ୱର, କମ୍ପନ ଏବଂ ଗୋଡ଼ରେ ଲାଲ ଦାଗ ବର୍ଣ୍ଣନା କରିଛନ୍ତି।");
      } else {
        setChiefConcern("मुझे पिछले तीन दिनों से बहुत तेज बुखार और कंपकंपी आ रही है। कल रात से हाथ-पैरों पर लाल चकत्ते भी दिखने लगे हैं।");
        setSpeechTranscript("मरीज ने 3 दिन से तेज बुखार, कंपकंपी और लाल चकत्ते बताए हैं।");
      }
      setSelectedSymptoms(["High-grade fever", "Chills and rigors", "Petechial rash on lower limbs"]);
      setDurationDays(3);
    } else if (type === "chest") {
      if (language === "en") {
        setChiefConcern("Since this morning I feel severe retrosternal chest tightness and heaviness, difficulty breathing, and cold sweats.");
        setSpeechTranscript("Patient reports retrosternal chest heaviness, shortness of breath, and cold diaphoresis since morning.");
      } else if (language === "or") {
        setChiefConcern("ଆଜି ସକାଳୁ ଛାତିରେ ଭୀଷଣ ଚାପ ଓ ଭାରୀ ଲାଗୁଛି, ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ ହେଉଛି ଓ ଥଣ୍ଡା ଝାଳ ବୋହୁଛି।");
        setSpeechTranscript("ରୋଗୀ ସକାଳୁ ଛାତିରେ ଚାପ, ନିଶ୍ୱାସ ପ୍ରଶ୍ୱାସରେ କଷ୍ଟ ଓ ଝାଳ ବର୍ଣ୍ଣନା କରିଛନ୍ତି।");
      } else {
        setChiefConcern("आज सुबह से सीने के बीच में बहुत भारीपन और दबाव लग रहा है। सांस खींचने में दिक्कत हो रही है और ठंडा पसीना आ रहा है।");
        setSpeechTranscript("आज सुबह से सीने में भारीपन, सांस फूलना और ठंडा पसीना।");
      }
      setSelectedSymptoms(["Retrosternal chest heaviness", "Shortness of breath"]);
      setDurationDays(1);
    } else {
      if (language === "en") {
        setChiefConcern("Mild dry cough and running nose for two days. Mild throat irritation, no fever.");
        setSpeechTranscript("Patient reports mild dry cough and sore throat for 2 days.");
      } else if (language === "or") {
        setChiefConcern("୨ ଦିନ ହେବ ସାମାନ୍ୟ କାଶ ଓ ଥଣ୍ଡା ହୋଇଛି। ଗଳାରେ ଟିକେ କଷ୍ଟ ଅଛି, ଜ୍ୱର ନାହିଁ।");
        setSpeechTranscript("ରୋଗୀ ୨ ଦିନରୁ ଶୁଖିଲା କାଶ ଓ ଥଣ୍ଡା ବର୍ଣ୍ଣନା କରିଛନ୍ତି।");
      } else {
        setChiefConcern("दो दिन से हल्की सूखी खांसी और गले में खराश है। कोई बुखार नहीं है।");
        setSpeechTranscript("दो दिन से सूखी खांसी और गले में खराश।");
      }
      setSelectedSymptoms(["Mild dry cough"]);
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

    const isSecureContext =
      typeof window !== "undefined" &&
      (window.isSecureContext ||
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1");

    if (!isSecureContext) {
      alert(t.alertMicSecure);
      loadPreset("fever");
      return;
    }

    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognitionConstructor =
        (
          window as unknown as {
            SpeechRecognition: SpeechRecognitionStatic;
            webkitSpeechRecognition: SpeechRecognitionStatic;
          }
        ).SpeechRecognition ||
        (
          window as unknown as {
            webkitSpeechRecognition: SpeechRecognitionStatic;
          }
        ).webkitSpeechRecognition;

      const recognition = new SpeechRecognitionConstructor();
      recognition.lang =
        language === "hi" ? "hi-IN" : language === "or" ? "or-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          const transcript = result[0].transcript.trim();
          if (transcript) {
            setSpeechTranscript(transcript);
            setChiefConcern(transcript);
          }
          setIsRecording(false);
        }
      };
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsRecording(false);
        if (event.error === "not-allowed") {
          alert(t.alertMicPermission);
        } else if (event.error === "no-speech") {
          alert(t.alertNoSpeech);
        } else if (event.error === "network") {
          alert(t.alertNetwork);
        } else if (event.error === "audio-capture") {
          alert(t.alertNoMic);
        } else {
          alert(`${t.alertSpeechError} ${event.error}`);
        }
      };
      recognition.onend = () => {
        setIsRecording(false);
      };
      recognition.start();
    } else {
      alert(t.alertNotSupported);
      loadPreset("fever");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGranted) {
      alert(t.alertConsent);
      return;
    }
    if (!chiefConcern.trim()) {
      alert(t.alertConcern);
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep(t.submitting1);

    try {
      await new Promise((r) => setTimeout(r, 500));
      setSubmissionStep(t.submitting2);

      const newCase = await submitIntake({
        facility_name:
          facilityName === "ALL" ? "Khordha District Hospital" : facilityName,
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

      setSubmissionStep(t.submitted);
      await new Promise((r) => setTimeout(r, 400));
      onCaseCreated(newCase);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t.alertSubmitError;
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
              <h2 className="text-base font-black text-slate-900">{t.title}</h2>
              <p className="text-xs text-slate-500">{t.subtitle}</p>
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
              {t.langSelect}
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

          {/* BIG TAP-TO-SPEAK BUTTON */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-center">
            <div className="text-xs font-bold text-teal-950 mb-2">
              {t.micSectionTitle}
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
              <span>{isRecording ? t.listening : t.tapToSpeak}</span>
            </button>

            {/* Quick 1-Click Common Complaints */}
            <div className="mt-3 pt-2.5 border-t border-teal-200/60">
              <div className="text-[11px] font-bold text-teal-900 mb-1.5">
                {t.presetsTitle}
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => loadPreset("fever")}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-teal-900 border border-teal-300 hover:bg-teal-100 cursor-pointer"
                >
                  {t.presetFever}
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("chest")}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-red-900 border border-red-300 hover:bg-red-50 cursor-pointer"
                >
                  {t.presetChest}
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("routine")}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  {t.presetRoutine}
                </button>
              </div>
            </div>
          </div>

          {/* Chief Concern Input */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              {t.chiefConcernLabel}
            </label>
            <textarea
              rows={2}
              value={chiefConcern}
              onChange={(e) => setChiefConcern(e.target.value)}
              placeholder={t.chiefConcernPlaceholder}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600"
              required
            ></textarea>
          </div>

          {/* Duration in Days */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                {t.durationLabel}
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
                <span className="text-xs font-semibold text-slate-600">{t.durationUnit}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                {t.facilityLabel}
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-medium truncate">
                {facilityName === "ALL" ? "Khordha District Hospital" : facilityName}
              </div>
            </div>
          </div>

          {/* Common Symptoms Checklist */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              {t.symptomsLabel}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SYMPTOMS.map((item) => {
                const active = selectedSymptoms.includes(item.id);
                const displayLabel =
                  language === "en" ? item.en : language === "or" ? item.or : item.hi;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSymptom(item.id)}
                    className={`px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer ${
                      active
                        ? "bg-teal-700 text-white font-bold border-teal-700"
                        : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {displayLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lab Report Upload / Sample Report Button */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-purple-700" />
                {t.labReportLabel}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => loadSampleReport("cbc")}
                  className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-semibold text-[11px] border border-purple-300 cursor-pointer"
                >
                  {t.cbcBtn}
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleReport("hypoxemia")}
                  className="px-2 py-0.5 rounded bg-red-100 text-red-900 font-semibold text-[11px] border border-red-300 cursor-pointer"
                >
                  {t.spo2Btn}
                </button>
              </div>
            </div>
            <textarea
              rows={2}
              value={rawLabText}
              onChange={(e) => setRawLabText(e.target.value)}
              placeholder={t.labPlaceholder}
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
              {t.consentLabel}
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
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.submitBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
