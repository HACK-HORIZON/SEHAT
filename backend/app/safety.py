"""
Deterministic Safety Engine for SEHAT Triage Support.
Strictly non-diagnostic. Evaluates clinical safety triggers using deterministic, transparent rules.
Priority levels:
- RED: Urgent professional review (immediate clinical attention recommended)
- ORANGE: Prompt review (within 30-60 mins)
- YELLOW: Priority review (within 1-2 hours)
- GREEN: Routine outpatient review
"""

from typing import List, Tuple, Dict, Any
from backend.app.models import (
    PriorityCategory, SafetySignal, LabReportValue, SourceType
)

def evaluate_safety_rules(
    symptoms: List[str],
    lab_values: List[LabReportValue],
    chief_concern: str,
    duration_days: int = 0
) -> Tuple[PriorityCategory, List[SafetySignal]]:
    """
    Evaluates factual inputs against explainable deterministic clinical safety rules.
    Returns (highest_severity, list_of_signals).
    """
    signals: List[SafetySignal] = []
    text_corpus = (chief_concern + " " + " ".join(symptoms)).lower()

    # --- RULE SET 1: OXYGENATION & RESPIRATORY COMPROMISE (RED / ORANGE) ---
    spo2_val = None
    for val in lab_values:
        if "spo2" in val.parameter.lower() or "oxygen" in val.parameter.lower() or "pulse oximetry" in val.parameter.lower():
            try:
                clean_num = "".join([c for c in val.value if c.isdigit() or c == '.'])
                spo2_val = float(clean_num)
            except ValueError:
                pass

    if spo2_val is not None:
        if spo2_val < 90.0:
            signals.append(SafetySignal(
                rule_code="RULE-SPO2-CRITICAL",
                severity=PriorityCategory.RED,
                description="Hypoxemia Alert: Measured SpO2 is below 90%",
                trigger_metric="SpO2",
                trigger_value=f"{spo2_val}%",
                explainable_reason="SpO2 < 90% indicates severe peripheral oxygen desaturation requiring urgent airway and clinical oxygen evaluation.",
                recommended_triage_action="Immediate transfer to emergency triage bay for supplemental oxygen assessment by Medical Officer.",
                source=SourceType.DETERMINISTIC_RULE
            ))
        elif spo2_val < 94.0:
            signals.append(SafetySignal(
                rule_code="RULE-SPO2-BORDERLINE",
                severity=PriorityCategory.ORANGE,
                description="Sub-optimal Oxygen Saturation (90-93%)",
                trigger_metric="SpO2",
                trigger_value=f"{spo2_val}%",
                explainable_reason="SpO2 between 90% and 93% indicates mild-to-moderate respiratory compromise needing prompt review.",
                recommended_triage_action="Place in priority observation bay; verify with second pulse oximeter probe.",
                source=SourceType.DETERMINISTIC_RULE
            ))

    # Respiratory distress keywords
    if any(k in text_corpus for k in ["shortness of breath", "difficulty breathing", "सांस फूलना", "सांस लेने में तकलीफ", "gasping", "breathlessness"]):
        if any(k in text_corpus for k in ["chest pain", "chest tightness", "सीने में दर्द", "सीने में भारीपन", "sweating", "cold sweat"]):
            signals.append(SafetySignal(
                rule_code="RULE-RESP-CARDIO-ACUTE",
                severity=PriorityCategory.RED,
                description="Acute Cardiorespiratory Distress Cluster",
                trigger_metric="Symptom Cluster",
                trigger_value="Chest pain/tightness + Dyspnea",
                explainable_reason="Combination of chest tightness and dyspnea presents acute cardiopulmonary risk requiring immediate physician triage and ECG evaluation.",
                recommended_triage_action="Direct to Emergency Resuscitation Area; notify On-Duty Medical Officer for immediate triage.",
                source=SourceType.DETERMINISTIC_RULE
            ))
        else:
            signals.append(SafetySignal(
                rule_code="RULE-DYSPNEA-SOLITARY",
                severity=PriorityCategory.ORANGE,
                description="Reported Acute Breathlessness / Dyspnea",
                trigger_metric="Patient-reported symptom",
                trigger_value="Dyspnea / Breathlessness",
                explainable_reason="Active difficulty breathing warrants prompt clinical auscultation and vital verification.",
                recommended_triage_action="Prompt clinician review within 30 minutes; check respiratory rate and auscultate lungs.",
                source=SourceType.DETERMINISTIC_RULE
            ))

    # --- RULE SET 2: HEMATOLOGIC / BLEEDING RISK (RED / ORANGE / YELLOW) ---
    for val in lab_values:
        p_name = val.parameter.lower()
        clean_num_str = "".join([c for c in val.value.replace(",", "") if c.isdigit() or c == '.'])
        
        # Platelets
        if "platelet" in p_name or "plt" in p_name:
            try:
                plt = float(clean_num_str)
                # handle if value in lakhs/thousands (e.g. 24 or 24000)
                if plt < 200 and plt > 5:  # e.g., 24 thousand
                    plt = plt * 1000
                    
                if plt < 50000:
                    signals.append(SafetySignal(
                        rule_code="RULE-PLT-CRITICAL",
                        severity=PriorityCategory.RED,
                        description="Severe Thrombocytopenia (< 50,000 / μL)",
                        trigger_metric="Platelet Count",
                        trigger_value=f"{int(plt):,} / μL",
                        explainable_reason="Platelet levels under 50,000 / μL carry elevated spontaneous mucosal and internal hemorrhage risk.",
                        recommended_triage_action="Bedside physician review; screen for active bleeding signs (petechiae, hematuria, melena); prepare repeat stat count.",
                        source=SourceType.DETERMINISTIC_RULE
                    ))
                elif plt < 100000:
                    signals.append(SafetySignal(
                        rule_code="RULE-PLT-MODERATE",
                        severity=PriorityCategory.ORANGE,
                        description="Moderate Thrombocytopenia (50,000 - 100,000 / μL)",
                        trigger_metric="Platelet Count",
                        trigger_value=f"{int(plt):,} / μL",
                        explainable_reason="Moderate platelet reduction requires prompt medical review and fluid/hydration assessment, especially in endemic vector-borne zones.",
                        recommended_triage_action="Prompt review by triage officer; evaluate hematocrit and warning signs.",
                        source=SourceType.DETERMINISTIC_RULE
                    ))
            except ValueError:
                pass

        # Hemoglobin
        if "hemoglobin" in p_name or "hb" in p_name:
            try:
                hb = float(clean_num_str)
                if hb < 7.0:
                    signals.append(SafetySignal(
                        rule_code="RULE-HB-SEVERE",
                        severity=PriorityCategory.RED,
                        description="Severe Anemia (Hb < 7.0 g/dL)",
                        trigger_metric="Hemoglobin",
                        trigger_value=f"{hb} g/dL",
                        explainable_reason="Severe anemia may precipitate hemodynamics instability, severe tachycardia, or tissue hypoxia.",
                        recommended_triage_action="Urgent medical review for blood grouping, cross-match readiness, and hemodynamic evaluation.",
                        source=SourceType.DETERMINISTIC_RULE
                    ))
                elif hb < 9.0:
                    signals.append(SafetySignal(
                        rule_code="RULE-HB-MODERATE",
                        severity=PriorityCategory.YELLOW,
                        description="Moderate Anemia (Hb 7.0 - 9.0 g/dL)",
                        trigger_metric="Hemoglobin",
                        trigger_value=f"{hb} g/dL",
                        explainable_reason="Substantial reduction in oxygen carrying capacity requiring prioritized outpatient workup.",
                        recommended_triage_action="Include in prioritized queue; check for postural dizziness.",
                        source=SourceType.DETERMINISTIC_RULE
                    ))
            except ValueError:
                pass

        # Blood Glucose
        if any(g in p_name for g in ["glucose", "sugar", "rbs", "fbs", "ppbs"]):
            try:
                glu = float(clean_num_str)
                if glu < 60:
                    signals.append(SafetySignal(
                        rule_code="RULE-GLU-HYPO",
                        severity=PriorityCategory.RED,
                        description="Severe Hypoglycemia (< 60 mg/dL)",
                        trigger_metric="Blood Glucose",
                        trigger_value=f"{glu} mg/dL",
                        explainable_reason="Acute neuroglycopenic risk and loss of consciousness.",
                        recommended_triage_action="Immediate nurse/doctor assessment; stat oral or IV dextrose intervention as per protocol.",
                        source=SourceType.DETERMINISTIC_RULE
                    ))
                elif glu > 350:
                    signals.append(SafetySignal(
                        rule_code="RULE-GLU-HYPER",
                        severity=PriorityCategory.RED,
                        description="Marked Hyperglycemia (> 350 mg/dL)",
                        trigger_metric="Blood Glucose",
                        trigger_value=f"{glu} mg/dL",
                        explainable_reason="Risk of acute metabolic crisis (diabetic ketoacidosis or hyperosmolar hyperglycemic state).",
                        recommended_triage_action="Urgent doctor review; assess urine ketones and hydration status.",
                        source=SourceType.DETERMINISTIC_RULE
                    ))
            except ValueError:
                pass

    # --- RULE SET 3: NEUROLOGICAL & CONSCIOUSNESS ALERTS (RED) ---
    if any(k in text_corpus for k in ["unconscious", "altered mental", "fainting", "syncope", "seizure", "fit", "बेहोश", "दौरा", "अचेत", "stiff neck", "گردن अकड़ना"]):
        signals.append(SafetySignal(
            rule_code="RULE-NEURO-CRITICAL",
            severity=PriorityCategory.RED,
            description="Neurological or Sensorium Impairment Alert",
            trigger_metric="Patient-reported presentation",
            trigger_value="Altered consciousness / Seizure / Stiff neck",
            explainable_reason="Altered sensorium or meningeal signs represent red-flag emergency symptoms.",
            recommended_triage_action="Immediate bedside trauma/neuro triage by Emergency Medical Officer.",
            source=SourceType.DETERMINISTIC_RULE
        ))

    # --- RULE SET 4: FEVER DURATION & VECTOR-BORNE / INFECTION SIGNALS (ORANGE / YELLOW) ---
    has_fever = any(k in text_corpus for k in ["fever", "बुखार", "ताप", "temperature", "chills", "कम्पकंपी"])
    has_rash = any(k in text_corpus for k in ["rash", "चकत्ते", "spots", "लाल दाने", "petechiae", "bruise"])
    
    if has_fever and has_rash:
        signals.append(SafetySignal(
            rule_code="RULE-FEVER-RASH",
            severity=PriorityCategory.ORANGE,
            description="Febrile Illness with Cutaneous / Petechial Manifestation",
            trigger_metric="Symptom Cluster",
            trigger_value="Fever + Rash",
            explainable_reason="Co-occurrence of fever and cutaneous lesions warrants prompt inspection to exclude hemorrhagic or severe systemic infectious etiologies.",
            recommended_triage_action="Prompt clinician assessment; assess skin lesions for blanching under light touch.",
            source=SourceType.DETERMINISTIC_RULE
        ))
    elif has_fever and duration_days >= 4:
        signals.append(SafetySignal(
            rule_code="RULE-FEVER-PROLONGED",
            severity=PriorityCategory.YELLOW,
            description="Prolonged Febrile State (≥ 4 Days)",
            trigger_metric="Duration",
            trigger_value=f"{duration_days} days",
            explainable_reason="Unresolved fever beyond 3 days warrants formal peripheral blood smear, rapid diagnostic tests, and hydration evaluation.",
            recommended_triage_action="Assign to priority outpatient examination; prepare for routine malaria/dengue/typhoid screening.",
            source=SourceType.DETERMINISTIC_RULE
        ))

    # --- RULE SET 5: DEHYDRATION & PERSISTENT LOSSES (ORANGE / YELLOW) ---
    if any(k in text_corpus for k in ["vomiting constantly", "cannot keep fluids", "उल्टी रुक नहीं रही", "no urine", "पेशाब नहीं आ रहा", "extreme thirst"]):
        signals.append(SafetySignal(
            rule_code="RULE-DEHYDRATION-HIGH",
            severity=PriorityCategory.ORANGE,
            description="Acute Fluid Loss & Dehydration Warning",
            trigger_metric="Patient symptom report",
            trigger_value="Intractable vomiting / Anuria",
            explainable_reason="Inability to retain oral liquids and reduced urine output predispose to hypovolemia and renal strain.",
            recommended_triage_action="Prompt physician evaluation for oral rehydration failure and consideration of IV fluid therapy.",
            source=SourceType.DETERMINISTIC_RULE
        ))

    # --- DEFAULT ASSIGNMENT ---
    if not signals:
        # Check mild or routine
        if any(k in text_corpus for k in ["routine", "checkup", "refill", "mild cough", "समान्य जांच", "दवा नवीनीकरण", "mild throat"]):
            final_priority = PriorityCategory.GREEN
        else:
            final_priority = PriorityCategory.YELLOW
            signals.append(SafetySignal(
                rule_code="RULE-BASELINE-TRIAGE",
                severity=PriorityCategory.YELLOW,
                description="Standard Outpatient Medical Review Needed",
                trigger_metric="Intake Complaint",
                trigger_value=chief_concern[:30],
                explainable_reason="Patient presenting with active discomfort without explicit red-flag markers.",
                recommended_triage_action="Standard queue review by Medical Officer.",
                source=SourceType.DETERMINISTIC_RULE
            ))
    else:
        # Pick the highest severity among signals
        severity_rank = {PriorityCategory.RED: 4, PriorityCategory.ORANGE: 3, PriorityCategory.YELLOW: 2, PriorityCategory.GREEN: 1}
        final_priority = max(signals, key=lambda s: severity_rank[s.severity]).severity

    return final_priority, signals

