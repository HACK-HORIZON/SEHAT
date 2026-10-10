"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Languages,
  Mic,
  FileText,
  Microscope,
  Clock,
  HelpCircle,
  ShieldAlert,
  Flame,
  UserCheck,
  History,
  Shield
} from "lucide-react";

interface TourProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCaseById: (caseId: string) => void;
  onOpenPrivacyCenter: () => void;
}

const STEPS = [
  {
    step: 1,
    title: "1. मरीज हिंदी में बोलता है (Voice in Hindi)",
    icon: <Languages className="w-5 h-5 text-amber-600" />,
    caseTarget: "SHN-DEMO-04",
    highlight: "हिंदी आवाज इनपुट (मरीज को अंग्रेजी की जरूरत नहीं)",
    description: "ग्रामीण मरीज बोलता है: 'मुझे 3 दिन से तेज बुखार, बदन दर्द और कंपकंपी आ रही है...' सिस्टम आवाज को बिना किसी रुकावट के दर्ज करता है।",
  },
  {
    step: 2,
    title: "2. आवाज से मेडिकल पर्ची में अनुवाद (STT & Translation)",
    icon: <Mic className="w-5 h-5 text-teal-600" />,
    caseTarget: "SHN-DEMO-04",
    highlight: "हिंदी बोली -> डॉक्टर के लिए क्लीन मेडिकल समरी",
    description: "सिस्टम मरीज के हिंदी शब्दों को सहेजते हुए डॉक्टर के लिए अंग्रेजी मेडिकल फॉर्मेट में प्रस्तुत करता है।",
  },
  {
    step: 3,
    title: "3. जांच रिपोर्ट / पर्चा अपलोड (Paper Report Upload)",
    icon: <FileText className="w-5 h-5 text-purple-600" />,
    caseTarget: "SHN-DEMO-05",
    highlight: "मोबाइल या स्कैनर से खून जांच रिपोर्ट अपलोड",
    description: "मरीज द्वारा लाई गई सीबीसी (CBC) पर्ची को सिस्टम में अपलोड किया जाता है।",
  },
  {
    step: 4,
    title: "4. कंप्यूटर द्वारा रिपोर्ट पढ़ना (OCR Extraction)",
    icon: <Microscope className="w-5 h-5 text-purple-600" />,
    caseTarget: "SHN-DEMO-05",
    highlight: "प्लेटलेट 24,000 / μL (खतरनाक रूप से कम - Critical)",
    description: "ओसीआर तकनीक रिपोर्ट से प्लेटलेट व हीमोग्लोबिन के अंक सीधे पढ़ती है और सामान्य सीमा से तुलना करती है।",
  },
  {
    step: 5,
    title: "5. बीमारी का आसान टाइमलाइन (Timeline Engine)",
    icon: <Clock className="w-5 h-5 text-teal-600" />,
    caseTarget: "SHN-DEMO-05",
    highlight: "4 दिन पहले बुखार -> 2 दिन पहले उल्टी -> आज अस्पताल",
    description: "लंबे पैराग्राफ के बदले एक आसान दिन-वार टाइमलाइन बनती है जिससे डॉक्टर तुरंत समझ सकें।",
  },
  {
    step: 6,
    title: "6. क्या जानकारी पूछना बाकी है? (Missing Information)",
    icon: <HelpCircle className="w-5 h-5 text-amber-600" />,
    caseTarget: "SHN-DEMO-05",
    highlight: "खून बहने या चकत्तों के बारे में सवाल तैयार करना",
    description: "सिस्टम पहचानता है कि क्या जरूरी जानकारी छूट गई है और स्वास्थ्य कर्मी के लिए हिंदी सवाल तैयार करता है।",
  },
  {
    step: 7,
    title: "7. सुरक्षा नियम द्वारा लाल अलर्ट (Deterministic Safety)",
    icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
    caseTarget: "SHN-DEMO-05",
    highlight: "प्लेटलेट 50 हजार से कम होने पर लाल (RED) प्राथमिकता",
    description: "बिना किसी ब्लैक-बॉक्स अनुमान के, स्पष्ट नियमों के तहत केस को तुरंत डॉक्टर के लिए लाल श्रेणी में डाला जाता है।",
  },
  {
    step: 8,
    title: "8. डॉक्टर की कतार में सबसे आगे (Live Prioritization)",
    icon: <Flame className="w-5 h-5 text-red-600" />,
    caseTarget: "SHN-DEMO-05",
    highlight: "गंभीर मरीज कतार में तुरंत ऊपर आ जाता है",
    description: "गंभीर स्थिति वाले मरीज को घंटों इंतजार नहीं करना पड़ता; डॉक्टर की स्क्रीन पर तुरंत लाल चेतावनी दिखती है।",
  },
  {
    step: 9,
    title: "9. डिजिटल केस पर्ची (Triage Passport)",
    icon: <FileText className="w-5 h-5 text-teal-600" />,
    caseTarget: "SHN-DEMO-05",
    highlight: "एक ही स्क्रीन पर मरीज का पूरा विवरण",
    description: "डॉक्टर टोकन, लक्षण, टाइमलाइन, लैब जांच और सुरक्षा चेतावनियां एक साथ देखते हैं।",
  },
  {
    step: 10,
    title: "10. डॉक्टर का अंतिम फैसला (Human in Control)",
    icon: <UserCheck className="w-5 h-5 text-purple-600" />,
    caseTarget: "SHN-DEMO-03",
    highlight: "डॉक्टर प्राथमिकता बदल सकते हैं या रेफर कर सकते हैं",
    description: "एआई केवल सहायक है; डॉक्टर का क्लिनिकल अनुभव अंतिम निर्णय लेता है।",
  },
  {
    step: 11,
    title: "11. पूरा रिकॉर्ड और ऑडिट लॉग (Audit Trail)",
    icon: <History className="w-5 h-5 text-teal-600" />,
    caseTarget: "SHN-DEMO-03",
    highlight: "हर कदम का सुरक्षित टाइमस्टैम्प रिकॉर्ड",
    description: "नर्स और डॉक्टर द्वारा की गई हर कार्रवाई का सुरक्षित इतिहास दर्ज रहता है।",
  },
  {
    step: 12,
    title: "12. गोपनीयता व डेटा सुरक्षा (DPDP 2023 Compliance)",
    icon: <Shield className="w-5 h-5 text-purple-600" />,
    caseTarget: "SHN-DEMO-01",
    highlight: "अस्थाई टोकन, 24 घंटे में ऑटो-डिलीट",
    description: "मरीज की पहचान पूरी तरह सुरक्षित है और परामर्श के बाद डेटा नष्ट करने की सुविधा है।",
  },
];

export default function DemoWalkthroughModal({
  isOpen,
  onClose,
  onSelectCaseById,
  onOpenPrivacyCenter,
}: TourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const current = STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      onSelectCaseById(STEPS[nextIdx].caseTarget);
      if (nextIdx === 11) {
        onOpenPrivacyCenter();
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      onSelectCaseById(STEPS[prevIdx].caseTarget);
    }
  };

  const handleJump = (idx: number) => {
    setCurrentStepIndex(idx);
    onSelectCaseById(STEPS[idx].caseTarget);
    if (idx === 11) {
      onOpenPrivacyCenter();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl shadow-2xl p-6 relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                सिस्टम वॉकथ्रू (Judge Demo Tour)
              </h2>
              <p className="text-xs text-slate-500">
                12 चरणों में संपूर्ण ग्रामीण स्वास्थ्य ट्राइएज प्रक्रिया
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="pt-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>चरण {current.step} / 12</span>
            <span className="text-teal-700">{Math.round((current.step / 12) * 100)}% पूर्ण</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 transition-all duration-300"
              style={{ width: `${(current.step / 12) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content Card */}
        <div className="py-4 space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 mt-0.5">
              {current.icon}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">{current.title}</h3>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                {current.highlight}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed font-medium">
            {current.description}
          </div>

          <div className="p-2 rounded-lg bg-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <span>सक्रिय टेस्ट केस (Active Case):</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {current.caseTarget}
            </span>
          </div>

          {/* Quick Dots */}
          <div className="flex items-center justify-center gap-1 pt-1">
            {STEPS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleJump(idx)}
                className={`w-6 h-6 rounded-full text-[10px] font-bold transition flex items-center justify-center cursor-pointer ${
                  idx === currentStepIndex
                    ? "bg-teal-700 text-white font-black"
                    : idx < currentStepIndex
                    ? "bg-teal-100 text-teal-800 border border-teal-300"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {s.step}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 text-xs font-bold transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            पिछला (Prev)
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <span>{currentStepIndex === STEPS.length - 1 ? "टूर समाप्त करें" : "अगला चरण (Next)"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
