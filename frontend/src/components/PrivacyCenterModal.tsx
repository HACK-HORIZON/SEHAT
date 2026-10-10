"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Trash2,
  X,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { fetchPrivacyMetrics, fetchFieldJustifications, purgeAllEphemeral } from "@/services/api";
import { FieldJustifications, FieldJustification } from "@/types";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQueuePurged: () => void;
}

export default function PrivacyCenterModal({
  isOpen,
  onClose,
  onQueuePurged,
}: PrivacyModalProps) {
  const [justifications, setJustifications] = useState<FieldJustifications | null>(null);
  const [activeTab, setActiveTab] = useState<"METRICS" | "JUSTIFICATIONS" | "PURGE">("METRICS");
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPrivacyMetrics().catch(() => {});
      fetchFieldJustifications().then(setJustifications).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePurgeAll = async () => {
    if (confirm("क्या आप सभी अस्थाई टोकन और मरीज डेटा तुरंत नष्ट करना चाहते हैं?")) {
      setIsPurging(true);
      try {
        await purgeAllEphemeral();
        alert("सभी अस्थाई रिकॉर्ड सुरक्षित रूप से हटा दिए गए हैं।");
        onQueuePurged();
        onClose();
      } catch {
        alert("डेटा हटाने में त्रुटि हुई।");
      } finally {
        setIsPurging(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 max-w-xl w-full rounded-2xl shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">गोपनीयता एवं सुरक्षा केंद्र (Privacy)</h2>
              <p className="text-xs text-slate-500">
                डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP Act 2023) अनुपालन
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mt-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab("METRICS")}
            className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
              activeTab === "METRICS"
                ? "border-purple-600 text-purple-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            डेटा सुरक्षा नियम
          </button>
          <button
            onClick={() => setActiveTab("JUSTIFICATIONS")}
            className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
              activeTab === "JUSTIFICATIONS"
                ? "border-purple-600 text-purple-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            जानकारी क्यों ली गई?
          </button>
          <button
            onClick={() => setActiveTab("PURGE")}
            className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
              activeTab === "PURGE"
                ? "border-red-600 text-red-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            डेटा हटाएं (Wipe Data)
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
          {activeTab === "METRICS" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">पहचान सुरक्षा</div>
                  <div className="text-sm font-black text-purple-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-purple-700" />
                    100% अस्थाई टोकन
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    आधार कार्ड, वास्तविक नाम या फोन नंबर स्थायी रूप से नहीं रखा जाता।
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">स्वतः नष्ट होने का समय</div>
                  <div className="text-sm font-black text-teal-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-700" />
                    24 घंटे में ऑटो-डिलीट
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    डॉक्टर से परामर्श के बाद डेटा स्वतः साफ हो जाता है।
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">कानूनी सुरक्षा मानक:</h4>
                <div className="space-y-1.5 text-[11px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span><strong>DPDP Act 2023:</strong> मरीज को अपना डेटा किसी भी समय मिटाने का पूरा अधिकार है।</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span><strong>ऑडियो तुरंत हटाना:</strong> आवाज से टेक्स्ट बनते ही ऑडियो फाइल तुरंत मिटा दी जाती है।</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "JUSTIFICATIONS" && (
            <div className="space-y-2.5">
              <p className="text-slate-600 text-xs">
                कानून के अनुसार, प्रत्येक जानकारी का कारण स्पष्ट होना चाहिए:
              </p>

              {justifications &&
                Object.entries(justifications).map(([key, item]: [string, FieldJustification]) => (
                  <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-purple-900 text-xs font-bold">{item.title}</strong>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                        {item.legal_basis}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs mb-1">
                      <strong>कारण:</strong> {item.why_collected}
                    </p>
                    <div className="text-[11px] text-slate-500">
                      रखने की अवधि: <strong className="text-slate-800">{item.retention}</strong>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {activeTab === "PURGE" && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs space-y-3">
              <div className="flex items-center gap-2 text-red-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                सभी सत्र व टोकन साफ करें (Wipe Data)
              </div>
              <p className="text-slate-700 leading-normal">
                यह बटन दबाने पर सभी कतार, अस्थाई टोकन और जांच रिपोर्ट का डेटा सिस्टम से तुरंत नष्ट हो जाएगा।
              </p>
              <button
                type="button"
                onClick={handlePurgeAll}
                disabled={isPurging}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isPurging ? "डेटा मिटाया जा रहा है..." : "सभी मरीज डेटा अभी मिटाएं (Wipe All)"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
