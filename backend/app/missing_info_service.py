"""
Missing Information Engine for SEHAT Triage Support.
Identifies clinical information gaps necessary for safe triage prioritization,
and generates concise, reviewer-oriented follow-up questions in both English and Hindi.
Strictly non-diagnostic.
"""

from typing import List, Tuple
from backend.app.models import MissingInfoItem, FollowUpQuestion, LabReportValue, SourceType

def detect_missing_information(
    symptoms: List[str],
    chief_concern: str,
    lab_values: List[LabReportValue],
    language: str = "hi"
) -> Tuple[List[MissingInfoItem], List[FollowUpQuestion]]:
    missing_items: List[MissingInfoItem] = []
    questions: List[FollowUpQuestion] = []
    
    text = (chief_concern + " " + " ".join(symptoms)).lower()
    
    # 1. Check for Vitals (Pulse / BP / SpO2)
    has_spo2 = any("spo2" in v.parameter.lower() or "oxygen" in v.parameter.lower() for v in lab_values)
    if not has_spo2 and any(k in text for k in ["breath", "chest", "cough", "सांस", "सीने"]):
        missing_items.append(MissingInfoItem(
            item="Baseline Pulse Oximetry (SpO2)",
            importance="HIGH",
            why_needed="Patient reported respiratory or chest discomfort; baseline peripheral saturation is required for safe triage triage grading.",
            source=SourceType.AI_INFERRED
        ))
        questions.append(FollowUpQuestion(
            question_en="Please check and record the patient's fingertip pulse oximeter (SpO2) reading.",
            question_hi="कृपया मरीज की उंगली पर पल्स ऑक्सीमीटर लगाकर ऑक्सीजन (SpO2) स्तर जांचें।",
            target_info="Pulse Oximetry (SpO2)",
            context="Respiratory risk screening"
        ))

    # 2. Check for Bleeding or Hemorrhagic Tendency if Thrombocytopenia or Fever+Rash
    has_low_plt = any("platelet" in v.parameter.lower() and v.status in ["LOW", "CRITICAL_LOW"] for v in lab_values)
    has_rash = any(k in text for k in ["rash", "चकत्ते", "spots", "दाने", "bleeding"])
    if has_low_plt or has_rash:
        missing_items.append(MissingInfoItem(
            item="Mucocutaneous Bleeding History",
            importance="CRITICAL" if has_low_plt else "HIGH",
            why_needed="Low platelets and skin rash pose acute spontaneous bleeding risks.",
            source=SourceType.AI_INFERRED
        ))
        questions.append(FollowUpQuestion(
            question_en="Have you noticed bleeding from the gums, nosebleeds, black tarry stools, or unusual dark bruising?",
            question_hi="क्या आपने मसूड़ों से खून, नाक से खून, काले दस्त या त्वचा पर गहरे नीले चकत्ते देखे हैं?",
            target_info="Hemorrhagic warning signs",
            context="Thrombocytopenia triage protocol"
        ))

    # 3. Check for Fluid Intake / Oral Hydration tolerance
    if any(k in text for k in ["vomit", "fever", "diarrhea", "उल्टी", "दस्त", "कमजोरी"]):
        missing_items.append(MissingInfoItem(
            item="Oral Hydration Tolerance",
            importance="MEDIUM",
            why_needed="Assess whether patient is able to retain fluids orally to prevent hypovolemic dehydration.",
            source=SourceType.AI_INFERRED
        ))
        questions.append(FollowUpQuestion(
            question_en="Are you able to swallow and keep down water or ORS without immediate vomiting?",
            question_hi="क्या आप बिना उल्टी के पानी या ओआरएस (ORS) घोल पी पा रहे हैं?",
            target_info="Hydration retention capability",
            context="Dehydration risk assessment"
        ))

    # 4. Check for Pre-existing Comorbidities
    missing_items.append(MissingInfoItem(
        item="Known Chronic Comorbidities (Diabetes / Hypertension / Cardiac)",
        importance="MEDIUM",
        why_needed="Underlying systemic conditions significantly alter triage vulnerability and threshold for escalation.",
        source=SourceType.AI_INFERRED
    ))
    questions.append(FollowUpQuestion(
        question_en="Do you have any diagnosed ongoing conditions such as diabetes, high blood pressure, or kidney illness?",
        question_hi="क्या आपको पहले से मधुमेह (शुगर), उच्च रक्तचाप (बीपी) या गुर्दे की कोई पुरानी बीमारी है?",
        target_info="Comorbid risk profile",
        context="Systemic vulnerability triage"
    ))

    # 5. Check for Known Drug Allergies
    missing_items.append(MissingInfoItem(
        item="Known Medication Allergies",
        importance="LOW",
        why_needed="Critical safety context prior to any eventual physician-directed intervention.",
        source=SourceType.AI_INFERRED
    ))
    questions.append(FollowUpQuestion(
        question_en="Do you have any known adverse reactions or allergies to paracetamol, antibiotics, or other medicines?",
        question_hi="क्या आपको पैरासिटामोल, एंटीबायोटिक या किसी अन्य दवा से कोई एलर्जी है?",
        target_info="Medication safety baseline",
        context="Allergy screening"
    ))

    return missing_items, questions

