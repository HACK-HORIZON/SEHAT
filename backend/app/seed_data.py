"""
Synthetic Demo Dataset for SEHAT Triage Support Prototype.
ALL DATA IN THIS FILE IS FICTIONAL AND SYNTHETIC — NOT REAL PATIENT INFORMATION.
Covers:
1. Routine outpatient case (GREEN)
2. Case with incomplete information (YELLOW)
3. Case with safety escalation (RED)
4. Multilingual Hindi case (ORANGE)
5. Uploaded lab report case (RED - severe thrombocytopenia)
"""

from datetime import datetime, timedelta
from typing import List
from backend.app.models import (
    TriageCase, PriorityCategory, ReviewerStatus, SourceType,
    TimelineEvent, LabReportValue, VisualObservation,
    MissingInfoItem, FollowUpQuestion, SafetySignal, AuditLogEntry,
    HumanOverride
)

def generate_seed_cases() -> List[TriageCase]:
    now = datetime.now()

    # CASE 1: Routine Outpatient (GREEN)
    c1_id = "SHN-DEMO-01"
    c1 = TriageCase(
        id=c1_id,
        temp_patient_id="TMP-4012",
        consent_granted=True,
        preferred_language="en",
        facility_name="Khordha District Hospital",
        chief_concern="Mild dry cough and throat irritation for 2 days. No difficulty breathing, no fever.",
        patient_reported_symptoms=["Mild dry cough", "Throat irritation", "Normal appetite"],
        symptom_timeline=[
            TimelineEvent(
                day_label="Day -2",
                title="Onset of throat tickle",
                description="Slight scratchy throat after weather transition.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED
            ),
            TimelineEvent(
                day_label="Today",
                title="Presented to OPD queue",
                description="Patient visited for routine outpatient consultation and lozenge guidance.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED
            )
        ],
        extracted_report_values=[
            LabReportValue(
                parameter="SpO2 Saturation",
                value="98",
                unit="%",
                normal_range="95 - 100 %",
                status="NORMAL",
                ocr_confidence=0.99,
                is_uncertain=False,
                source=SourceType.OCR_EXTRACTED
            ),
            LabReportValue(
                parameter="Hemoglobin (Hb)",
                value="13.8",
                unit="g/dL",
                normal_range="12.0 - 16.0 g/dL",
                status="NORMAL",
                ocr_confidence=0.98,
                is_uncertain=False,
                source=SourceType.OCR_EXTRACTED
            )
        ],
        visual_observations=[],
        missing_information=[
            MissingInfoItem(
                item="Known Medication Allergies",
                importance="LOW",
                why_needed="Standard outpatient medication safety screening.",
                source=SourceType.AI_INFERRED
            )
        ],
        follow_up_questions=[
            FollowUpQuestion(
                question_en="Do you have any known allergy to common medications like paracetamol or antibiotics?",
                question_hi="क्या आपको पैरासिटामोल या एंटीबायोटिक दवाओं से कोई एलर्जी है?",
                target_info="Medication allergies",
                context="General outpatient screening"
            )
        ],
        safety_signals=[],
        priority_category=PriorityCategory.GREEN,
        deterministic_priority=PriorityCategory.GREEN,
        ai_confidence=0.96,
        uncertainty_notes=["Patient reports stable symptoms with zero systemic compromise."],
        reviewer_status=ReviewerStatus.PENDING,
        reviewer_notes=None,
        escalation_status=False,
        escalation_target=None,
        waiting_time_minutes=14,
        completeness_score=85,
        low_bandwidth_mode=False,
        created_at=(now - timedelta(minutes=14)).isoformat(),
        updated_at=(now - timedelta(minutes=14)).isoformat(),
        audit_trail=[
            AuditLogEntry(
                id="AUD-0101",
                case_id=c1_id,
                action_type="INTAKE_CREATED",
                performed_by="TRIAGE_KIOSK_AI",
                role="SYSTEM_AI",
                summary="Routine case created; classified as GREEN under baseline outpatient triage protocol.",
                details={"priority": "GREEN"},
                timestamp=(now - timedelta(minutes=14)).isoformat()
            )
        ],
        is_synthetic_demo=True
    )

    # CASE 2: Incomplete Information Case (YELLOW)
    c2_id = "SHN-DEMO-02"
    c2 = TriageCase(
        id=c2_id,
        temp_patient_id="TMP-5519",
        consent_granted=True,
        preferred_language="hi",
        facility_name="Balipatna Primary Health Centre",
        chief_concern="Patient reports localized abdominal discomfort and dull aching. Exact duration and onset unclear from initial entry.",
        patient_reported_symptoms=["Abdominal pain", "Mild nausea"],
        symptom_timeline=[
            TimelineEvent(
                day_label="Timing Unknown",
                title="Abdominal discomfort onset",
                description="Pain reported by patient; duration could not be determined from intake response.",
                is_exact_time=False,
                source=SourceType.PATIENT_REPORTED
            ),
            TimelineEvent(
                day_label="Today",
                title="Walk-in at PHC",
                description="Patient seeking evaluation.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED
            )
        ],
        extracted_report_values=[],
        visual_observations=[],
        missing_information=[
            MissingInfoItem(
                item="Duration and Location of Abdominal Pain",
                importance="HIGH",
                why_needed="Differentiates acute surgical abdomen (e.g. appendicitis) from benign gastroenteritis.",
                source=SourceType.AI_INFERRED
            ),
            MissingInfoItem(
                item="Last Oral Intake and Hydration Tolerance",
                importance="MEDIUM",
                why_needed="Determines risk of dehydration and need for oral or IV fluids.",
                source=SourceType.AI_INFERRED
            ),
            MissingInfoItem(
                item="Fever or Bowel Alteration History",
                importance="MEDIUM",
                why_needed="Infectious vs obstructive clinical picture.",
                source=SourceType.AI_INFERRED
            )
        ],
        follow_up_questions=[
            FollowUpQuestion(
                question_en="Where exactly is the pain situated (upper, lower, right side), and did it start suddenly or gradually?",
                question_hi="दर्द पेट में ठीक किस जगह है (ऊपर, नीचे या दाईं तरफ), और यह अचानक शुरू हुआ या धीरे-धीरे?",
                target_info="Pain localization & onset velocity",
                context="Abdominal evaluation triage"
            ),
            FollowUpQuestion(
                question_en="Have you had any loose motions, vomiting, or inability to pass gas or urine today?",
                question_hi="क्या आपको आज उल्टी, दस्त या पेशाब करने में कोई रुकावट हुई है?",
                target_info="Gastrointestinal obstruction & dehydration screening",
                context="Incomplete case clarification"
            )
        ],
        safety_signals=[
            SafetySignal(
                rule_code="RULE-BASELINE-TRIAGE",
                severity=PriorityCategory.YELLOW,
                description="Active Abdominal Pain without Red Flags",
                trigger_metric="Chief Concern",
                trigger_value="Abdominal discomfort",
                explainable_reason="Abdominal pain warrants physical palpation by Medical Officer within 1-2 hours.",
                recommended_triage_action="Outpatient examination queue; observe for abdominal guarding or rigidity.",
                source=SourceType.DETERMINISTIC_RULE
            )
        ],
        priority_category=PriorityCategory.YELLOW,
        deterministic_priority=PriorityCategory.YELLOW,
        ai_confidence=0.74,
        uncertainty_notes=[
            "Onset time and pain localization unspecified in initial intake.",
            "Vital sign parameters not yet recorded at intake kiosk."
        ],
        reviewer_status=ReviewerStatus.PENDING,
        reviewer_notes=None,
        escalation_status=False,
        waiting_time_minutes=28,
        completeness_score=45,
        low_bandwidth_mode=False,
        created_at=(now - timedelta(minutes=28)).isoformat(),
        updated_at=(now - timedelta(minutes=28)).isoformat(),
        audit_trail=[
            AuditLogEntry(
                id="AUD-0201",
                case_id=c2_id,
                action_type="INTAKE_CREATED",
                performed_by="AI_EXTRACTION_ENGINE",
                role="SYSTEM_AI",
                summary="Case flagged as YELLOW with 3 critical information gaps identified.",
                details={"completeness_score": 45},
                timestamp=(now - timedelta(minutes=28)).isoformat()
            )
        ],
        is_synthetic_demo=True
    )

    # CASE 3: Safety Escalation Case (RED)
    c3_id = "SHN-DEMO-03"
    c3 = TriageCase(
        id=c3_id,
        temp_patient_id="TMP-9011",
        consent_granted=True,
        preferred_language="en",
        facility_name="Rourkela Steel Plant Clinic",
        chief_concern="Crushing retrosternal chest heaviness radiating to left shoulder with acute shortness of breath and cold perspiration.",
        patient_reported_symptoms=["Retrosternal chest heaviness", "Left shoulder pain radiation", "Shortness of breath", "Cold diaphoresis"],
        symptom_timeline=[
            TimelineEvent(
                day_label="Today (06:30 AM)",
                title="Sudden onset crushing chest pain",
                description="Patient woke with severe retrosternal pressure like a heavy weight on the chest.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED
            ),
            TimelineEvent(
                day_label="Today (07:15 AM)",
                title="Onset of dyspnea and cold sweats",
                description="Breathlessness worsened rapidly upon attempting to walk.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED
            ),
            TimelineEvent(
                day_label="Today (Now)",
                title="Immediate triage arrival",
                description="Arrived at clinic emergency gate.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED
            )
        ],
        extracted_report_values=[
            LabReportValue(
                parameter="SpO2 Saturation",
                value="88",
                unit="%",
                normal_range="95 - 100 %",
                status="CRITICAL_LOW",
                ocr_confidence=0.99,
                is_uncertain=False,
                source=SourceType.OCR_EXTRACTED
            ),
            LabReportValue(
                parameter="Random Blood Sugar",
                value="210",
                unit="mg/dL",
                normal_range="70 - 140 mg/dL",
                status="HIGH",
                ocr_confidence=0.95,
                is_uncertain=False,
                source=SourceType.OCR_EXTRACTED
            )
        ],
        visual_observations=[
            VisualObservation(
                finding="Visual observation: Profuse cold diaphoresis with visible tachypneic breathing pattern.",
                confidence=0.93,
                is_advisory_only=True,
                source=SourceType.AI_INFERRED,
                visual_cue="Diaphoresis & Respiratory Distress"
            )
        ],
        missing_information=[
            MissingInfoItem(
                item="Immediate 12-Lead ECG",
                importance="CRITICAL",
                why_needed="Exclude acute coronary syndrome (STEMI/NSTEMI) within the golden hour.",
                source=SourceType.AI_INFERRED
            ),
            MissingInfoItem(
                item="Prior Ischemic Cardiac History",
                importance="HIGH",
                why_needed="Establish prior stenting, MI history, or antiplatelet therapy.",
                source=SourceType.AI_INFERRED
            )
        ],
        follow_up_questions=[
            FollowUpQuestion(
                question_en="Immediate Reviewer Action: Wheel patient to ECG room; apply high-flow oxygen; notify on-call Physician.",
                question_hi="मरीज को तुरंत ईसीजी कक्ष में ले जाएं और आपातकालीन डॉक्टर को सूचित करें।",
                target_info="Immediate bedside response",
                context="Red Code Triage Alert"
            )
        ],
        safety_signals=[
            SafetySignal(
                rule_code="RULE-SPO2-CRITICAL",
                severity=PriorityCategory.RED,
                description="Critical Hypoxemia (SpO2 88% < 90%)",
                trigger_metric="SpO2",
                trigger_value="88%",
                explainable_reason="Severe peripheral oxygen desaturation requiring immediate supplemental oxygen therapy.",
                recommended_triage_action="Place on high-flow oxygen (target SpO2 > 94%); immediate medical officer notification.",
                source=SourceType.DETERMINISTIC_RULE
            ),
            SafetySignal(
                rule_code="RULE-RESP-CARDIO-ACUTE",
                severity=PriorityCategory.RED,
                description="Acute Cardiopulmonary Risk Cluster",
                trigger_metric="Symptom Cluster",
                trigger_value="Chest pain radiating to shoulder + Dyspnea + Sweating",
                explainable_reason="Classic high-risk cluster indicative of potential acute myocardial infarction or pulmonary embolism.",
                recommended_triage_action="Immediate transfer to Resuscitation Bay; Stat 12-lead ECG within 10 minutes.",
                source=SourceType.DETERMINISTIC_RULE
            )
        ],
        priority_category=PriorityCategory.RED,
        deterministic_priority=PriorityCategory.RED,
        ai_confidence=0.95,
        uncertainty_notes=["High confidence in critical safety signals. Immediate bedside physician review mandated."],
        reviewer_status=ReviewerStatus.ESCALATED,
        reviewer_notes="Immediate red priority validated by Medical Officer Dr. Mohapatra. High flow O2 administered.",
        escalation_status=True,
        escalation_target="Senior Medical Officer - Emergency Resuscitation Bay",
        waiting_time_minutes=6,
        completeness_score=90,
        low_bandwidth_mode=False,
        created_at=(now - timedelta(minutes=6)).isoformat(),
        updated_at=(now - timedelta(minutes=2)).isoformat(),
        audit_trail=[
            AuditLogEntry(
                id="AUD-0301",
                case_id=c3_id,
                action_type="INTAKE_CREATED",
                performed_by="AI_SAFETY_ENGINE",
                role="SYSTEM_AI",
                summary="Deterministic Rule RULE-SPO2-CRITICAL and RULE-RESP-CARDIO-ACUTE triggered Priority RED.",
                details={"signals": ["RULE-SPO2-CRITICAL", "RULE-RESP-CARDIO-ACUTE"]},
                timestamp=(now - timedelta(minutes=6)).isoformat()
            ),
            AuditLogEntry(
                id="AUD-0302",
                case_id=c3_id,
                action_type="ESCALATION",
                performed_by="Dr. S. K. Mohapatra",
                role="DOCTOR",
                summary="Doctor confirmed urgent triage escalation to Emergency Resuscitation Bay.",
                details={"target": "Emergency Resuscitation Bay"},
                timestamp=(now - timedelta(minutes=2)).isoformat()
            )
        ],
        is_synthetic_demo=True
    )

    # CASE 4: Multilingual Hindi Case (ORANGE)
    c4_id = "SHN-DEMO-04"
    c4 = TriageCase(
        id=c4_id,
        temp_patient_id="TMP-7823",
        consent_granted=True,
        preferred_language="hi",
        facility_name="IIT Campus Health Centre",
        chief_concern="मरीज को 3 दिन से बहुत तेज बुखार और कंपकंपी आ रही है। कल रात से दोनों पैरों पर लाल चकत्ते भी दिखने लगे हैं। (High fever with rigors for 3 days; petechial rash observed on lower extremities since last night)",
        patient_reported_symptoms=["High-grade fever", "Chills and rigors", "Petechial rash on lower limbs", "Severe generalized weakness"],
        symptom_timeline=[
            TimelineEvent(
                day_label="Day -3",
                title="Fever and chills began",
                description="Patient reported sudden onset high fever with severe shivering.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED,
                detected_keywords=["3 दिन से बहुत तेज बुखार", "कंपकंपी"]
            ),
            TimelineEvent(
                day_label="Day -2",
                title="Worsening myalgia & headache",
                description="Patient unable to attend classes; severe retro-orbital headache.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED
            ),
            TimelineEvent(
                day_label="Day -1",
                title="Cutaneous rash appeared",
                description="Appearance of petechial spots on lower limbs.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED,
                detected_keywords=["कल रात से लाल चकत्ते"]
            ),
            TimelineEvent(
                day_label="Today",
                title="Presenting to Campus Health Centre",
                description="Assisted to triage counter by peer due to extreme lethargy.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED
            )
        ],
        extracted_report_values=[
            LabReportValue(
                parameter="Platelet Count",
                value="72,000",
                unit="/ μL",
                normal_range="150,000 - 450,000 / μL",
                status="LOW",
                ocr_confidence=0.95,
                is_uncertain=False,
                source=SourceType.OCR_EXTRACTED
            ),
            LabReportValue(
                parameter="SpO2 Saturation",
                value="96",
                unit="%",
                normal_range="95 - 100 %",
                status="NORMAL",
                ocr_confidence=0.99,
                is_uncertain=False,
                source=SourceType.OCR_EXTRACTED
            )
        ],
        visual_observations=[
            VisualObservation(
                finding="Cutaneous macular erythematous rash over pretibial area.",
                confidence=0.88,
                is_advisory_only=True,
                source=SourceType.AI_INFERRED,
                visual_cue="Lower extremity petechiae"
            )
        ],
        missing_information=[
            MissingInfoItem(
                item="Bleeding History (Gums / Urine / Epistaxis)",
                importance="CRITICAL",
                why_needed="Assess clinical hemorrhagic progression in setting of fever and low platelets.",
                source=SourceType.AI_INFERRED
            ),
            MissingInfoItem(
                item="Recent Mosquito Exposure / Travel History",
                importance="MEDIUM",
                why_needed="Dengue/vector-borne cluster tracking within campus hostels.",
                source=SourceType.AI_INFERRED
            )
        ],
        follow_up_questions=[
            FollowUpQuestion(
                question_en="Have you noticed any bleeding from gums while brushing, nosebleeds, or dark black stools?",
                question_hi="क्या मंजन करते समय मसूड़ों से खून, नाक से खून या गहरे काले रंग का मल आया है?",
                target_info="Hemorrhagic warning indicators",
                context="Vector-borne / thrombocytopenia triage"
            ),
            FollowUpQuestion(
                question_en="Are any of your hostel roommates or coworkers suffering from high fever?",
                question_hi="क्या आपके हॉस्टल के कमरे में या आसपास किसी और को भी तेज बुखार है?",
                target_info="Vector cluster epidemiological screening",
                context="Public health outbreak alert"
            )
        ],
        safety_signals=[
            SafetySignal(
                rule_code="RULE-FEVER-RASH",
                severity=PriorityCategory.ORANGE,
                description="Febrile Illness with Cutaneous Manifestation",
                trigger_metric="Symptom Cluster",
                trigger_value="Fever + Petechial Rash",
                explainable_reason="Co-occurrence of sustained fever and cutaneous rash requires prompt physician inspection to rule out dengue or meningococcal syndrome.",
                recommended_triage_action="Prompt clinician review within 30 minutes; check tourniquet test and hydration.",
                source=SourceType.DETERMINISTIC_RULE
            ),
            SafetySignal(
                rule_code="RULE-PLT-MODERATE",
                severity=PriorityCategory.ORANGE,
                description="Moderate Thrombocytopenia (72,000 / μL)",
                trigger_metric="Platelet Count",
                trigger_value="72,000 / μL",
                explainable_reason="Platelets between 50,000 and 100,000 with fever warrant active monitoring for rapid downward trend.",
                recommended_triage_action="Evaluate hematocrit; order Dengue NS1/IgM rapid card test.",
                source=SourceType.DETERMINISTIC_RULE
            )
        ],
        priority_category=PriorityCategory.ORANGE,
        deterministic_priority=PriorityCategory.ORANGE,
        ai_confidence=0.91,
        uncertainty_notes=[
            "Speech input in Hindi transcribed and translated into English case card.",
            "Visual rash finding is supportive; requires direct touch blanching test."
        ],
        reviewer_status=ReviewerStatus.PENDING,
        reviewer_notes=None,
        escalation_status=False,
        waiting_time_minutes=19,
        completeness_score=75,
        low_bandwidth_mode=False,
        created_at=(now - timedelta(minutes=19)).isoformat(),
        updated_at=(now - timedelta(minutes=19)).isoformat(),
        audit_trail=[
            AuditLogEntry(
                id="AUD-0401",
                case_id=c4_id,
                action_type="SPEECH_TRANSCRIBED",
                performed_by="SPEECH_ENGINE_HI",
                role="SYSTEM_AI",
                summary="Hindi voice transcript processed; English translation generated for reviewer.",
                details={"source_language": "hi", "confidence": 0.94},
                timestamp=(now - timedelta(minutes=19)).isoformat()
            ),
            AuditLogEntry(
                id="AUD-0402",
                case_id=c4_id,
                action_type="SAFETY_EVALUATED",
                performed_by="SAFETY_ENGINE",
                role="SYSTEM_AI",
                summary="Assigned ORANGE priority based on RULE-FEVER-RASH and RULE-PLT-MODERATE.",
                details={"priority": "ORANGE"},
                timestamp=(now - timedelta(minutes=19)).isoformat()
            )
        ],
        is_synthetic_demo=True
    )

    # CASE 5: Uploaded Lab Report Case (RED - severe thrombocytopenia)
    c5_id = "SHN-DEMO-05"
    c5 = TriageCase(
        id=c5_id,
        temp_patient_id="TMP-3304",
        consent_granted=True,
        preferred_language="en",
        facility_name="Khordha District Hospital",
        chief_concern="Referred from peripheral clinic with high fever, vomiting, extreme dizziness, and urgent abnormal CBC lab report.",
        patient_reported_symptoms=["High fever", "Persistent vomiting", "Extreme postural dizziness", "Petechiae on forearms"],
        symptom_timeline=[
            TimelineEvent(
                day_label="Day -4",
                title="Fever and severe retro-orbital headache",
                description="High fever onset, initially treated with home hydration.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED
            ),
            TimelineEvent(
                day_label="Day -2",
                title="Frequent bilious vomiting",
                description="Unable to retain oral fluids, leading to marked weakness.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED
            ),
            TimelineEvent(
                day_label="Day -1",
                title="CBC sample collected at local path lab",
                description="Lab report generated this morning showing precipitous platelet drop.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED
            ),
            TimelineEvent(
                day_label="Today",
                title="Referred to District Hospital Triage",
                description="Patient brought in wheelchair with uploaded paper lab report.",
                is_exact_time=True,
                source=SourceType.PATIENT_REPORTED
            )
        ],
        extracted_report_values=[
            LabReportValue(
                parameter="Platelet Count",
                value="24,000",
                unit="/ μL",
                normal_range="150,000 - 450,000 / μL",
                status="CRITICAL_LOW",
                ocr_confidence=0.96,
                is_uncertain=False,
                source=SourceType.OCR_EXTRACTED,
                bounding_box={"x": 45, "y": 168, "width": 420, "height": 26}
            ),
            LabReportValue(
                parameter="Hemoglobin (Hb)",
                value="11.2",
                unit="g/dL",
                normal_range="12.0 - 16.0 g/dL",
                status="LOW",
                ocr_confidence=0.98,
                is_uncertain=False,
                source=SourceType.OCR_EXTRACTED,
                bounding_box={"x": 45, "y": 140, "width": 420, "height": 26}
            ),
            LabReportValue(
                parameter="Total Leukocyte Count (WBC)",
                value="3,200",
                unit="/ μL",
                normal_range="4,000 - 11,000 / μL",
                status="LOW",
                ocr_confidence=0.94,
                is_uncertain=False,
                source=SourceType.OCR_EXTRACTED,
                bounding_box={"x": 45, "y": 196, "width": 420, "height": 26}
            ),
            LabReportValue(
                parameter="SpO2 Saturation",
                value="96",
                unit="%",
                normal_range="95 - 100 %",
                status="NORMAL",
                ocr_confidence=0.99,
                is_uncertain=False,
                source=SourceType.OCR_EXTRACTED,
                bounding_box={"x": 45, "y": 224, "width": 420, "height": 26}
            )
        ],
        visual_observations=[
            VisualObservation(
                finding="Visual advisory: Significant petechial purpura visible on bilateral forearms.",
                confidence=0.89,
                is_advisory_only=True,
                source=SourceType.AI_INFERRED,
                visual_cue="Purpuric cutaneous lesions"
            )
        ],
        missing_information=[
            MissingInfoItem(
                item="Active Mucosal Bleeding Check",
                importance="CRITICAL",
                why_needed="Platelets 24,000 / μL carries severe imminent risk of spontaneous hemorrhage.",
                source=SourceType.AI_INFERRED
            ),
            MissingInfoItem(
                item="Current Hematocrit / Hemoconcentration Level",
                importance="HIGH",
                why_needed="Assessing plasma leakage stage in suspected severe dengue.",
                source=SourceType.AI_INFERRED
            ),
            MissingInfoItem(
                item="Blood Grouping & Crossmatch Availability",
                importance="HIGH",
                why_needed="Platelet concentrate readiness in event of acute bleeding.",
                source=SourceType.AI_INFERRED
            )
        ],
        follow_up_questions=[
            FollowUpQuestion(
                question_en="Have you had any bleeding from your gums, nosebleeds, red-tinged urine, or dark black stools today?",
                question_hi="क्या आज आपके मसूड़ों से खून, नाक से खून, पेशाब में लाली या गहरे काले रंग का मल आया है?",
                target_info="Active hemorrhage screening",
                context="Severe thrombocytopenia critical protocol"
            ),
            FollowUpQuestion(
                question_en="Reviewer Check: Does the hospital blood bank have O+ / compatible single donor platelets (SDP) available?",
                question_hi="रक्त बैंक में प्लेटलेट उपलब्धता की स्थिति जांचें।",
                target_info="Blood product readiness",
                context="Inpatient emergency preparedness"
            )
        ],
        safety_signals=[
            SafetySignal(
                rule_code="RULE-PLT-CRITICAL",
                severity=PriorityCategory.RED,
                description="Critical Thrombocytopenia Alert (24,000 / μL < 50,000 / μL)",
                trigger_metric="Platelet Count",
                trigger_value="24,000 / μL",
                explainable_reason="Platelet levels below 50,000 / μL present acute danger of spontaneous internal and mucosal hemorrhage.",
                recommended_triage_action="Immediate Bedside Medical Officer evaluation; strict rest; avoid intramuscular injections; prepare repeat stat count and blood bank alert.",
                source=SourceType.DETERMINISTIC_RULE
            )
        ],
        priority_category=PriorityCategory.RED,
        deterministic_priority=PriorityCategory.RED,
        ai_confidence=0.94,
        uncertainty_notes=[
            "OCR scan of lab report confirmed with high confidence (0.96) for platelet count token 24000.",
            "Patient is at elevated risk; requires immediate senior physician review."
        ],
        reviewer_status=ReviewerStatus.PENDING,
        reviewer_notes=None,
        escalation_status=True,
        escalation_target="Senior Medical Officer - Emergency Triage / Inpatient Ward",
        waiting_time_minutes=9,
        completeness_score=95,
        low_bandwidth_mode=False,
        created_at=(now - timedelta(minutes=9)).isoformat(),
        updated_at=(now - timedelta(minutes=9)).isoformat(),
        audit_trail=[
            AuditLogEntry(
                id="AUD-0501",
                case_id=c5_id,
                action_type="OCR_EXTRACTED",
                performed_by="OCR_ENGINE_v2",
                role="SYSTEM_AI",
                summary="Extracted 4 parameters from uploaded CBC lab report image. Critical platelet count 24,000 / μL flagged.",
                details={"platelets": "24,000", "hb": "11.2", "wbc": "3,200"},
                timestamp=(now - timedelta(minutes=9)).isoformat()
            ),
            AuditLogEntry(
                id="AUD-0502",
                case_id=c5_id,
                action_type="SAFETY_EVALUATED",
                performed_by="SAFETY_ENGINE",
                role="SYSTEM_AI",
                summary="RULE-PLT-CRITICAL triggered Priority RED with urgent escalation flag.",
                details={"priority": "RED"},
                timestamp=(now - timedelta(minutes=9)).isoformat()
            )
        ],
        is_synthetic_demo=True
    )

    return [c3, c5, c4, c2, c1]

