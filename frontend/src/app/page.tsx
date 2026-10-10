"use client";

import React, { useState, useEffect, useCallback } from "react";
import ResponsibleAIBanner from "@/components/ResponsibleAIBanner";
import Header from "@/components/Header";
import QueueIntelligence from "@/components/QueueIntelligence";
import TriagePassport from "@/components/TriagePassport";
import PatientIntakeModal from "@/components/PatientIntakeModal";
import PrivacyCenterModal from "@/components/PrivacyCenterModal";
import DemoWalkthroughModal from "@/components/DemoWalkthroughModal";
import {
  fetchQueue,
  fetchQueueStats,
  fetchCase,
  overridePriority,
  updateReviewStatus,
  escalateCase,
  requestMoreInfo,
  resetDemoDataset,
} from "@/services/api";
import { UILanguage } from "@/i18n/translations";
import { TriageCase, QueueStats, PriorityCategory, ReviewerStatus } from "@/types";

export default function Home() {
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<TriageCase | null>(null);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Filters & Global Settings
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedFacility, setSelectedFacility] = useState("ALL");
  const [userRole, setUserRole] = useState("DOCTOR");
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uiLang, setUiLang] = useState<UILanguage>("en");

  // Modals
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [demoTourOpen, setDemoTourOpen] = useState(false);

  // Refresh Queue and Stats
  const refreshQueueData = useCallback(async () => {
    try {
      const [queueData, statsData] = await Promise.all([
        fetchQueue({
          priority: priorityFilter,
          status: statusFilter,
          facility: selectedFacility,
          search: searchQuery,
        }),
        fetchQueueStats(),
      ]);

      setCases(queueData);
      setStats(statsData);

      // Auto-select first case if none selected or if selected is not in list
      if (queueData.length > 0) {
        if (!selectedCaseId || !queueData.find((c) => c.id === selectedCaseId)) {
          setSelectedCaseId(queueData[0].id);
          setSelectedCase(queueData[0]);
        } else {
          const current = queueData.find((c) => c.id === selectedCaseId);
          if (current) setSelectedCase(current);
        }
      } else {
        setSelectedCase(null);
      }
    } catch (err) {
      console.error("Failed to load queue data:", err);
    } finally {
      setLoading(false);
    }
  }, [priorityFilter, statusFilter, selectedFacility, searchQuery, selectedCaseId]);

  // Initial load & Polling
  useEffect(() => {
    setTimeout(() => {
      refreshQueueData();
    }, 0);
    const interval = setInterval(() => refreshQueueData(), 10000);
    return () => clearInterval(interval);
  }, [refreshQueueData]);

  // Handle case selection
  const handleSelectCase = async (caseId: string) => {
    setSelectedCaseId(caseId);
    const existing = cases.find((c) => c.id === caseId);
    if (existing) {
      setSelectedCase(existing);
    } else {
      try {
        const fetched = await fetchCase(caseId);
        setSelectedCase(fetched);
      } catch (err) {
        console.error("Failed to fetch full case details:", err);
      }
    }
  };

  // Reviewer Override Handler
  const handleOverridePriority = async (
    caseId: string,
    newPriority: PriorityCategory,
    reason: string
  ) => {
    setIsActionLoading(true);
    try {
      const updated = await overridePriority(caseId, {
        new_priority: newPriority,
        reason,
        reviewer_name:
          userRole === "DOCTOR" ? "Dr. S. K. Mohapatra, MD" : "Pooja Dash, Health Worker",
        reviewer_role: userRole === "DOCTOR" ? "Senior Medical Officer" : "Triage Nurse",
      });
      setSelectedCase(updated);
      await refreshQueueData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit override";
      alert(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reviewer Status Update Handler
  const handleUpdateStatus = async (
    caseId: string,
    status: ReviewerStatus,
    notes?: string
  ) => {
    setIsActionLoading(true);
    try {
      const updated = await updateReviewStatus(caseId, {
        reviewer_status: status,
        reviewer_notes: notes,
        reviewer_name:
          userRole === "DOCTOR" ? "Dr. S. K. Mohapatra, MD" : "Pooja Dash, Health Worker",
      });
      setSelectedCase(updated);
      await refreshQueueData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update review status";
      alert(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reviewer Escalation Handler
  const handleEscalate = async (caseId: string, target: string) => {
    setIsActionLoading(true);
    try {
      const updated = await escalateCase(
        caseId,
        target,
        userRole === "DOCTOR" ? "Dr. S. K. Mohapatra, MD" : "Triage Supervisor"
      );
      setSelectedCase(updated);
      await refreshQueueData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to escalate case";
      alert(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Request More Information Handler
  const handleRequestMoreInfo = async (caseId: string) => {
    setIsActionLoading(true);
    try {
      const updated = await requestMoreInfo(caseId);
      setSelectedCase(updated);
      alert("Follow-up questions successfully dispatched to patient's phone and kiosk!");
      await refreshQueueData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to request more info";
      alert(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reset Demo Dataset Handler
  const handleResetDemo = async () => {
    if (confirm("Reset queue to standard 5 synthetic demo cases?")) {
      setIsResetting(true);
      try {
        await resetDemoDataset();
        await refreshQueueData();
        alert("Demo dataset successfully reset with 5 synthetic cases!");
      } catch {
        alert("Failed to reset demo dataset");
      } finally {
        setIsResetting(false);
      }
    }
  };

  // When a new intake case is created
  const handleCaseCreated = async (newCase: TriageCase) => {
    await refreshQueueData();
    setSelectedCaseId(newCase.id);
    setSelectedCase(newCase);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 antialiased selection:bg-teal-600 selection:text-white">
      {/* Top Responsible AI Governance Bar */}
      <ResponsibleAIBanner uiLang={uiLang} />

      {/* Main Medical Operations Header */}
      <Header
        uiLang={uiLang}
        onChangeUILang={setUiLang}
        lowBandwidth={lowBandwidth}
        onToggleLowBandwidth={() => setLowBandwidth(!lowBandwidth)}
        selectedFacility={selectedFacility}
        onSelectFacility={setSelectedFacility}
        userRole={userRole}
        onSelectRole={setUserRole}
        onOpenIntake={() => setIntakeModalOpen(true)}
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
        onStartDemoTour={() => setDemoTourOpen(true)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Triage Workspace Split View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Live Queue Intelligence */}
        <div className="lg:col-span-5 xl:col-span-4 h-[calc(100vh-140px)] min-h-[500px]">
          <QueueIntelligence
            uiLang={uiLang}
            cases={cases}
            selectedCaseId={selectedCaseId}
            onSelectCase={handleSelectCase}
            stats={stats}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            loading={loading}
          />
        </div>

        {/* Right Column: Structured Triage Passport */}
        <div className="lg:col-span-7 xl:col-span-8 h-[calc(100vh-140px)] min-h-[500px]">
          <TriagePassport
            uiLang={uiLang}
            triageCase={selectedCase}
            onOverridePriority={handleOverridePriority}
            onUpdateStatus={handleUpdateStatus}
            onEscalate={handleEscalate}
            onRequestMoreInfo={handleRequestMoreInfo}
            isActionLoading={isActionLoading}
          />
        </div>
      </main>

      {/* Patient Intake Modal */}
      <PatientIntakeModal
        isOpen={intakeModalOpen}
        onClose={() => setIntakeModalOpen(false)}
        onCaseCreated={handleCaseCreated}
        facilityName={selectedFacility}
        lowBandwidthDefault={lowBandwidth}
      />

      {/* Privacy Center Modal */}
      <PrivacyCenterModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        onQueuePurged={refreshQueueData}
      />

      {/* Judge Walkthrough Modal */}
      <DemoWalkthroughModal
        isOpen={demoTourOpen}
        onClose={() => setDemoTourOpen(false)}
        onSelectCaseById={handleSelectCase}
        onOpenPrivacyCenter={() => setPrivacyModalOpen(true)}
      />
    </div>
  );
}
