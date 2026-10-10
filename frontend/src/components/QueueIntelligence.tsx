"use client";

import React from "react";
import { TriageCase, QueueStats, PriorityCategory, ReviewerStatus } from "@/types";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  Flame,
  Zap
} from "lucide-react";
import { UILanguage, translations } from "@/i18n/translations";

interface QueueProps {
  uiLang: UILanguage;
  cases: TriageCase[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  stats: QueueStats | null;
  priorityFilter: string;
  onPriorityFilterChange: (p: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  loading: boolean;
}

export default function QueueIntelligence({
  uiLang,
  cases,
  selectedCaseId,
  onSelectCase,
  stats,
  priorityFilter,
  onPriorityFilterChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  loading,
}: QueueProps) {
  const t = translations[uiLang];

  const getPriorityStyle = (priority: PriorityCategory) => {
    switch (priority) {
      case "RED":
        return {
          border: "border-red-400 bg-red-50 text-red-900",
          badge: "bg-red-600 text-white font-black",
          tag: t.priorityRedTag,
          icon: <Flame className="w-3.5 h-3.5" />,
        };
      case "ORANGE":
        return {
          border: "border-orange-300 bg-orange-50 text-orange-900",
          badge: "bg-orange-500 text-white font-bold",
          tag: t.priorityOrangeTag,
          icon: <Zap className="w-3.5 h-3.5" />,
        };
      case "YELLOW":
        return {
          border: "border-amber-300 bg-amber-50 text-amber-900",
          badge: "bg-amber-400 text-slate-900 font-bold",
          tag: t.priorityYellowTag,
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
      case "GREEN":
      default:
        return {
          border: "border-emerald-300 bg-emerald-50 text-emerald-900",
          badge: "bg-emerald-600 text-white font-bold",
          tag: t.priorityGreenTag,
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
    }
  };

  const getStatusText = (status: ReviewerStatus) => {
    switch (status) {
      case "ESCALATED":
        return t.escalatedStatus;
      case "VERIFIED":
        return t.verifiedStatus;
      case "OVERRIDDEN":
        return uiLang === "or" ? "ଅଗ୍ରାଧିକାର ବଦଳାଗଲା" : uiLang === "hi" ? "प्राथमिकता बदली गई" : "Priority Overridden";
      case "UNDER_REVIEW":
        return t.inReviewStatus;
      case "PENDING":
      default:
        return t.waitingStatus;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black tracking-wide text-slate-800 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              {t.queueTitle}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              ({cases.length} {t.patientsCount})
            </span>
          </div>
          {stats && (
            <div className="flex items-center gap-1 text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium">
              <Clock className="w-3 h-3 text-teal-600" />
              <span>{t.avgWait} <strong className="text-slate-900">{stats.average_wait_minutes} min</strong></span>
            </div>
          )}
        </div>

        {/* 4 Simple Filter Buttons with Active Language */}
        {stats && (
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => onPriorityFilterChange(priorityFilter === "RED" ? "ALL" : "RED")}
              className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                priorityFilter === "RED"
                  ? "bg-red-600 text-white border-red-600 shadow-xs"
                  : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
              }`}
            >
              <div className="text-[10px] font-bold line-clamp-1">
                {uiLang === "or" ? "ଲାଲ" : uiLang === "hi" ? "लाल" : "RED"}
              </div>
              <div className="text-sm font-black">{stats.red_count}</div>
            </button>

            <button
              onClick={() => onPriorityFilterChange(priorityFilter === "ORANGE" ? "ALL" : "ORANGE")}
              className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                priorityFilter === "ORANGE"
                  ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                  : "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100"
              }`}
            >
              <div className="text-[10px] font-bold line-clamp-1">
                {uiLang === "or" ? "କମଳା" : uiLang === "hi" ? "नारंगी" : "ORANGE"}
              </div>
              <div className="text-sm font-black">{stats.orange_count}</div>
            </button>

            <button
              onClick={() => onPriorityFilterChange(priorityFilter === "YELLOW" ? "ALL" : "YELLOW")}
              className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                priorityFilter === "YELLOW"
                  ? "bg-amber-400 text-slate-950 border-amber-400 shadow-xs"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <div className="text-[10px] font-bold line-clamp-1">
                {uiLang === "or" ? "ହଳଦିଆ" : uiLang === "hi" ? "पीला" : "YELLOW"}
              </div>
              <div className="text-sm font-black">{stats.yellow_count}</div>
            </button>

            <button
              onClick={() => onPriorityFilterChange(priorityFilter === "GREEN" ? "ALL" : "GREEN")}
              className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                priorityFilter === "GREEN"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <div className="text-[10px] font-bold line-clamp-1">
                {uiLang === "or" ? "ସବୁଜ" : uiLang === "hi" ? "हरा" : "GREEN"}
              </div>
              <div className="text-sm font-black">{stats.green_count}</div>
            </button>
          </div>
        )}

        {/* Search & Status Filter */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">{t.allStatus}</option>
            <option value="PENDING">{t.waitingStatus}</option>
            <option value="UNDER_REVIEW">{t.inReviewStatus}</option>
            <option value="VERIFIED">{t.verifiedStatus}</option>
            <option value="ESCALATED">{t.escalatedStatus}</option>
          </select>
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Loading queue...
          </div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            {t.noPatients}
          </div>
        ) : (
          cases.map((c) => {
            const pStyle = getPriorityStyle(c.priority_category);
            const isSelected = c.id === selectedCaseId;

            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-white border-teal-600 ring-2 ring-teal-500/20 shadow-md"
                    : `${pStyle.border} bg-white hover:border-slate-400 shadow-xs`
                }`}
              >
                {/* Header Row: Token + Priority Tag */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      {t.tokenLabel}: {c.temp_patient_id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {t.langLabel}: {c.preferred_language === "hi" ? "हिंदी" : c.preferred_language === "or" ? "ଓଡ଼ିଆ" : c.preferred_language}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${pStyle.badge}`}>
                    {pStyle.icon}
                    {pStyle.tag}
                  </span>
                </div>

                {/* Complaint text */}
                <p className="text-xs font-semibold text-slate-800 line-clamp-2 mb-2 leading-relaxed">
                  {c.chief_concern}
                </p>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{c.waiting_time_minutes} {t.minutesWait}</span>
                  </div>

                  <span className="font-medium text-slate-600">
                    {getStatusText(c.reviewer_status)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
