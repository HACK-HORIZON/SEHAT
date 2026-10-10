"use client";

import React from "react";
import {
  Activity,
  Wifi,
  WifiOff,
  Shield,
  UserPlus,
  PlayCircle,
  RotateCcw,
  Building2,
  UserCheck,
  Languages
} from "lucide-react";
import { UILanguage, translations } from "@/i18n/translations";

interface HeaderProps {
  uiLang: UILanguage;
  onChangeUILang: (lang: UILanguage) => void;
  lowBandwidth: boolean;
  onToggleLowBandwidth: () => void;
  selectedFacility: string;
  onSelectFacility: (fac: string) => void;
  userRole: string;
  onSelectRole: (role: string) => void;
  onOpenIntake: () => void;
  onOpenPrivacy: () => void;
  onStartDemoTour: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export default function Header({
  uiLang,
  onChangeUILang,
  lowBandwidth,
  onToggleLowBandwidth,
  selectedFacility,
  onSelectFacility,
  userRole,
  onSelectRole,
  onOpenIntake,
  onOpenPrivacy,
  onStartDemoTour,
  onResetDemo,
  isResetting,
}: HeaderProps) {
  const t = translations[uiLang];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-3 sm:px-4 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-xl shadow-xs shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-900">
                {t.appName}
              </h1>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {t.facilityTag}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium line-clamp-1">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls & Language Switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* PROMINENT FRONT LANGUAGE SWITCHER BUTTONS */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-300">
            <div className="px-1.5 text-slate-500 hidden sm:flex items-center">
              <Languages className="w-3.5 h-3.5 text-teal-700" />
            </div>
            <button
              onClick={() => onChangeUILang("en")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                uiLang === "en"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              English
            </button>
            <button
              onClick={() => onChangeUILang("hi")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                uiLang === "hi"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => onChangeUILang("or")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                uiLang === "or"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              ଓଡ଼ିଆ
            </button>
          </div>

          {/* Facility Selector */}
          <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-teal-600 mr-1.5 shrink-0" />
            <select
              value={selectedFacility}
              onChange={(e) => onSelectFacility(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">{t.allFacilities}</option>
              <option value="Khordha District Hospital">{t.khordhaHospital}</option>
              <option value="Balipatna Primary Health Centre">{t.balipatnaPHC}</option>
              <option value="Rourkela Steel Plant Clinic">{t.rourkelaClinic}</option>
              <option value="IIT Campus Health Centre">{t.iitCampus}</option>
            </select>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-teal-600 mr-1.5 shrink-0" />
            <select
              value={userRole}
              onChange={(e) => onSelectRole(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="DOCTOR">{t.doctorRole}</option>
              <option value="HEALTH_WORKER">{t.nurseRole}</option>
              <option value="ADMIN">{t.adminRole}</option>
            </select>
          </div>

          {/* Low Bandwidth Rural Mode */}
          <button
            onClick={onToggleLowBandwidth}
            title={uiLang === "or" ? "କମ୍ ଡାଟା ମୋଡ୍" : "कम इंटरनेट मोड"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
              lowBandwidth
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100"
            }`}
          >
            {lowBandwidth ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.lowDataOn}</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.lowDataOff}</span>
              </>
            )}
          </button>

          {/* Privacy Center Button */}
          <button
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-teal-700" />
            <span>{t.privacyBtn}</span>
          </button>

          {/* New Patient Intake Button */}
          <button
            onClick={onOpenIntake}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-black bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.newPatientBtn}</span>
          </button>

          {/* ONE-CLICK JUDGE DEMO WALKTHROUGH BUTTON */}
          <button
            onClick={onStartDemoTour}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{t.demoTourBtn}</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-teal-600" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
