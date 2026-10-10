"use client";

import React, { useState } from "react";
import { AlertTriangle, X, ShieldCheck } from "lucide-react";
import { UILanguage, translations } from "@/i18n/translations";

interface BannerProps {
  uiLang: UILanguage;
}

export default function ResponsibleAIBanner({ uiLang }: BannerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const t = translations[uiLang];

  return (
    <>
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-full bg-amber-200 text-amber-800 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-950 mr-1">
              {t.responsibleNotice}
            </span>
            <span className="font-medium text-amber-900">
              {t.responsibleNoticeDetail}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(true)}
          className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-300 transition cursor-pointer"
        >
          {t.safetyRulesBtn}
        </button>
      </div>

      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl shadow-xl p-6 relative">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {uiLang === "or" ? "ସୁରକ୍ଷା ନିୟମାବଳୀ" : uiLang === "hi" ? "सुरक्षा नियम" : "Safety Principles"}
                </h3>
                <p className="text-xs text-slate-500">
                  {uiLang === "or" ? "ଗ୍ରାମୀଣ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର ସୁରକ୍ଷା ମାନକ" : uiLang === "hi" ? "ग्रामीण स्वास्थ्य केंद्र सुरक्षा मानक" : "Rural Healthcare Standards"}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">
                  {uiLang === "or" ? "୧. କୌଣସି ଡାକ୍ତରୀ ନିଦାନ ବା ଔଷଧ ନୁହେଁ:" : uiLang === "hi" ? "1. कोई दवा या निदान नहीं:" : "1. Non-Diagnostic Support:"}
                </strong>
                {uiLang === "or"
                  ? "ଏହି ସିଷ୍ଟମ୍ ରୋଗୀର ଅଗ୍ରାଧିକାର ନିର୍ଣ୍ଣୟ କରେ। ଏହା କୌଣସି ଔଷଧ ଦିଏ ନାହିଁ।"
                  : uiLang === "hi"
                  ? "यह ऐप बीमारी का नाम नहीं बताता और न ही दवा लिखता है। केवल प्राथमिकता तय करता है।"
                  : "The system assists queue prioritization. It never prescribes drugs or claims a definitive disease diagnosis."}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">
                  {uiLang === "or" ? "୨. ଡାକ୍ତରଙ୍କ ନିଷ୍ପତ୍ତି ସର୍ବୋପରି:" : uiLang === "hi" ? "2. डॉक्टर का निर्णय सर्वोपरि:" : "2. Doctor Supreme Authority:"}
                </strong>
                {uiLang === "or"
                  ? "ଚିକିତ୍ସକ ଯେକୌଣସି ସମୟରେ ଅଗ୍ରାଧିକାର ବଦଳାଇ ପାରିବେ।"
                  : uiLang === "hi"
                  ? "डॉक्टर या नर्स किसी भी प्राथमिकता को अपने अनुभव से बदल सकते हैं।"
                  : "Medical Officers retain unconditional authority to override or modify any triage category."}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">
                  {uiLang === "or" ? "୩. ସମ୍ପୂର୍ଣ୍ଣ ଗୋପନୀୟତା (DPDP 2023):" : uiLang === "hi" ? "3. गोपनीयता व सुरक्षा:" : "3. Strict Privacy Protection:"}
                </strong>
                {uiLang === "or"
                  ? "ରୋଗୀଙ୍କ ବ୍ୟକ୍ତିଗତ ପରିଚୟ ସଂରକ୍ଷିତ ନୁହେଁ, କେବଳ ଅସ୍ଥାୟୀ ଟୋକନ୍ ବ୍ୟବହୃତ ହୁଏ।"
                  : uiLang === "hi"
                  ? "मरीज का नाम या आधार स्टोर नहीं होता; केवल अस्थायी टोकन दिया जाता है।"
                  : "Zero permanent PII storage; single-session ephemeral tokens protect patient identities."}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition cursor-pointer"
              >
                {uiLang === "or" ? "ବୁଝିଲି (Close)" : uiLang === "hi" ? "समझ गया (Close)" : "Acknowledge & Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
