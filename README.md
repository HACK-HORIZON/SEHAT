# SEHAT: Human-in-the-Loop Multimodal Healthcare Triage Support Platform

> **RESPONSIBLE AI GOVERNANCE DISCLAIMER**  
> **SEHAT is an educational prototype for triage-support and clinical information organization. It is strictly NOT a diagnostic system and does NOT replace qualified medical professionals. It never prescribes medication, never claims disease diagnosis, and never presents AI output as medical certainty.**

---

## 🌟 Executive Product Vision

In overcrowded Indian government hospitals, Primary Health Centers (PHCs), industrial clinics, and community health camps, doctors frequently face massive queues with incomplete, unstructured information presented in diverse regional languages.

**SEHAT** bridges this gap:
- Converts messy patient-provided inputs—**Hindi voice, unstructured text, phone camera captures of paper lab reports, and symptom timelines**—into a structured, reviewer-facing **Triage Passport**.
- Empowers qualified healthcare workers and Medical Officers to **review cases 4x faster**, identify clinical red flags immediately, and prioritize life-threatening emergencies safely.
- **The Human Reviewer remains the final clinical decision-maker.**

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Patient Intake Layer [Multimodal Intake Layer]
        A1[Patient Consent & DPDP Token] --> A2[Multilingual Voice / Text Input (Hindi/English)]
        A2 --> A3[Diagnostic Lab Report / PDF Upload]
        A3 --> A4[Low-Bandwidth Compression (Rural Mode)]
    end

    subgraph AI Extraction & Abstraction Pipeline [Processing Pipeline]
        A2 --> B1[Speech-to-Text & Translation Abstraction]
        A3 --> B2[OCR Extraction & NABL Reference Cross-Check]
        B1 & B2 --> B3[Timeline Engine (Anchored Day -X Progression)]
        B3 --> B4[Missing Information Engine (Clinical Gap Detector)]
    end

    subgraph Deterministic Safety Layer [Explainable Rules Engine]
        B4 --> C1[Deterministic Clinical Safety Triggers]
        C1 -->|Explainable Rule Evaluation| C2{Priority Assignment}
        C2 -->|SpO2 < 90% / Plt < 50k / Chest Pain| RED[RED - Urgent Review]
        C2 -->|Fever + Rash / SpO2 90-93%| ORANGE[ORANGE - Prompt Review]
        C2 -->|Persistent Fever / Abdominal Pain| YELLOW[YELLOW - Priority Review]
        C2 -->|Mild Cold / Prescription Refill| GREEN[GREEN - Routine Review]
    end

    subgraph Triage Engine & Live Queue [Operations Dashboard]
        RED & ORANGE & YELLOW & GREEN --> D1[Live Prioritized Triage Queue]
        D1 --> D2[Signature Triage Passport]
    end

    subgraph Human-in-the-Loop Review [Doctor / Reviewer Controls]
        D2 --> E1[Medical Officer Inspection]
        E1 --> E2[Clinical Override with Mandatory Rationale]
        E1 --> E3[Escalation to Emergency Bay / SMO]
        E1 --> E4[Dispatch Multilingual Follow-Up Questions]
        E1 --> E5[Mark Verified & Completed]
        E2 & E3 & E4 & E5 --> E6[(Immutable Medico-Legal Audit Trail)]
    end

    subgraph Privacy & Governance [DPDP Act 2023 Compliance]
        F1[Single-Session Ephemeral Tokens: TMP-xxxx] --> F2[Zero Permanent PII Storage]
        F2 --> F3[24-Hour TTL Auto-Purge & One-Click Wipe]
    end
```

---

## 🪪 Signature Feature: The Triage Passport

Every patient case card contains a unified, audit-backed **Triage Passport** displaying:

1. **Temporary Patient ID (`TMP-xxxx`)**: Single-session token protecting patient identity under the Digital Personal Data Protection (DPDP) Act 2023.
2. **Consent Status**: Explicit verified consent banner with timestamped recording.
3. **Preferred Language**: Source patient language indicator (Hindi, English, Odia, etc.).
4. **Chief Concern**: Verbatim patient narrative alongside clinical medical English translation.
5. **Reported Symptoms**: Structured discrete symptom tags extracted from speech and text.
6. **Symptom Timeline Engine**: Chronologically anchored progression (Day -4, Day -3, Day -2, Day -1, Today) with explicit **"Timing Unknown"** labels for unanchored events.
7. **Extracted Lab Values**: Tabular lab metrics (Platelets, Hb, SpO2, TLC, Glucose) with certified reference ranges, critical threshold alerts, and interactive **OCR Bounding Box Inspector**.
8. **Visual Observations Advisory**: Assistive cutaneous cues (e.g. petechial rash, cold diaphoresis) explicitly stamped as *advisory requiring human palpation*.
9. **Missing Information Engine**: &ldquo;Information Still Needed&rdquo; cards highlighting clinical parameters missing for safe triage.
10. **Multilingual Follow-up Questions**: Concise, reviewer-oriented prompts returned in **both Hindi and English**.
11. **Deterministic Safety Signals**: Explainable rule triggers showing exact metric values, clinical reasons, and recommended actions.
12. **Priority Category**: Standardized color-coded urgency (**RED, ORANGE, YELLOW, GREEN**).
13. **AI Confidence & Uncertainty Disclosure**: Percentage confidence with transparent uncertainty notes.
14. **Source Provenance Badging**: Every data item is tagged with its source:
    - 🔵 `Patient-Reported`
    - 🟣 `OCR-Extracted`
    - 🟡 `AI-Inferred Organization`
    - 🔴 `Deterministic Safety Rule`
    - 🟢 `Human-Confirmed`
15. **Reviewer Status & Clinical Override**: Real-time doctor verification state with auditable override history.
16. **Immutable Audit Ledger**: Medico-legal event stream tracking all AI inferences and doctor decisions.

---

## 🧪 Built-in Synthetic Demo Dataset

The platform includes **5 realistic synthetic test cases** clearly labeled:  
`"SYNTHETIC DEMO DATA — NOT REAL PATIENT INFORMATION"`

| Case ID | Patient Token | Facility | Symptoms & Presentation | Priority | Trigger Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHN-DEMO-03** | `TMP-9011` | Rourkela Steel Plant Clinic | Crushing retrosternal chest pain + SpO2 88% + diaphoresis | **RED** | `RULE-SPO2-CRITICAL`, `RULE-RESP-CARDIO-ACUTE` |
| **SHN-DEMO-05** | `TMP-3304` | Khordha District Hospital | Severe Thrombocytopenia (Platelets 24,000 / μL) + fever | **RED** | `RULE-PLT-CRITICAL` |
| **SHN-DEMO-04** | `TMP-7823` | IIT Campus Health Centre | Hindi Spoken: 3-day high fever + rigors + petechial rash | **ORANGE** | `RULE-FEVER-RASH`, `RULE-PLT-MODERATE` |
| **SHN-DEMO-02** | `TMP-5519` | Balipatna Rural PHC | Incomplete Case: Dull abdominal ache, missing duration/vitals | **YELLOW** | `RULE-BASELINE-TRIAGE` |
| **SHN-DEMO-01`** | `TMP-4012` | Khordha District Hospital | Routine Outpatient: Mild dry cough, normal SpO2 98% | **GREEN** | Standard Routine Protocol |

---

## 🚀 Quick Setup & Run Commands

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### 1. Start the Backend API (FastAPI)
```bash
# From workspace root
python backend/run.py
```
*Backend API will run on `http://127.0.0.1:8088` (Interactive Swagger docs: `http://127.0.0.1:8088/docs`)*

### 2. Start the Frontend (Next.js + Tailwind CSS)
```bash
cd frontend
npm run dev
# Or for optimized production server:
npm run build && npm run start -- -p 3000
```
*Open `http://localhost:3000` in any web browser.*

### 3. Run Automated End-to-End Integration Suite
```bash
python test_e2e.py
```

---

## 🎬 Hackathon Judge 1-Click Guided Tour

Click the glowing **"Judge Demo Walkthrough"** button in the top navigation header:
1. **Patient Speaks in Hindi**: Transcribes acoustic speech into structured clinical English.
2. **Lab Report Upload**: Ingests paper CBC report image.
3. **OCR Extraction**: Flags critical Platelet Count: 24,000 / μL with bounding box highlight.
4. **Timeline Synthesis**: Chronologically anchors progression from Day -4 to Today.
5. **Missing Information Discovery**: Generates follow-up questions in Hindi and English.
6. **Deterministic Safety Rules**: Triggers `RULE-PLT-CRITICAL` -> Assigns Priority RED.
7. **Live Queue Prioritization**: Vaults urgent case to the top of the Doctor's Queue.
8. **Triage Passport Inspection**: Doctor views all 16 triage elements with source provenance.
9. **Doctor Override & Escalation**: Doctor updates priority, adds clinical rationale, escalates to SMO.
10. **Audit Ledger Logging**: Immutable audit record captures the timestamped action.
11. **Privacy Center Inspection**: Verifies DPDP compliance and executes session wipe.
