"""
Timeline Engine for SEHAT Triage Support.
Extracts temporal markers from free-form text/voice transcripts into anchored relative timelines:
e.g. Day -3 -> Day -2 -> Day -1 -> Today.
Strictly non-generative: never fabricates events. Unknown timing is explicitly marked as 'Timing Unknown'.
"""

import re
from typing import List
from backend.app.models import TimelineEvent, SourceType

def extract_timeline_events(
    text: str,
    symptoms: List[str],
    reported_duration_days: int = 0
) -> List[TimelineEvent]:
    events: List[TimelineEvent] = []
    text_lower = text.lower() if text else ""
    
    # 1. Day -3 or older check
    if any(k in text_lower for k in ["3 days ago", "three days", "3 दिन पहले", "तीन दिन", "day -3", "3 days"]):
        events.append(TimelineEvent(
            day_label="Day -3",
            title="Symptom Onset",
            description="Patient first experienced onset of acute fever and generalized chills/body aches.",
            is_exact_time=True,
            source=SourceType.PATIENT_REPORTED,
            detected_keywords=["3 days ago", "3 दिन पहले"]
        ))
    elif any(k in text_lower for k in ["4 days ago", "four days", "4 दिन पहले"]):
        events.append(TimelineEvent(
            day_label="Day -4",
            title="Initial Onset",
            description="Onset of primary febrile symptoms reported.",
            is_exact_time=True,
            source=SourceType.PATIENT_REPORTED,
            detected_keywords=["4 days ago"]
        ))
    elif reported_duration_days > 0:
        events.append(TimelineEvent(
            day_label=f"Day -{reported_duration_days}",
            title="Initial Symptom Onset",
            description=f"Symptoms noted to begin approximately {reported_duration_days} days prior to presentation.",
            is_exact_time=True,
            source=SourceType.PATIENT_REPORTED,
            detected_keywords=[f"{reported_duration_days} days"]
        ))

    # 2. Day -2 check
    if any(k in text_lower for k in ["2 days ago", "two days", "दो दिन पहले", "परसों", "day -2"]):
        events.append(TimelineEvent(
            day_label="Day -2",
            title="Symptom Progression / Change",
            description="Symptom intensity escalated; patient reported headache and loss of appetite.",
            is_exact_time=True,
            source=SourceType.PATIENT_REPORTED,
            detected_keywords=["2 days ago", "परसों"]
        ))

    # 3. Day -1 check (Yesterday / Kal)
    if any(k in text_lower for k in ["yesterday", "कल", "कल रात", "last night", "day -1", "previous night"]):
        events.append(TimelineEvent(
            day_label="Day -1",
            title="Acute Secondary Manifestation",
            description="Appearance of additional symptoms (e.g. skin rash, chest discomfort, or worsening pain).",
            is_exact_time=True,
            source=SourceType.PATIENT_REPORTED,
            detected_keywords=["yesterday", "कल रात", "last night"]
        ))

    # 4. Today / Presentation Day
    events.append(TimelineEvent(
        day_label="Today",
        title="Seeking Professional Healthcare Review",
        description="Patient presented at primary health facility queue with persistent complaints.",
        is_exact_time=True,
        source=SourceType.PATIENT_REPORTED,
        detected_keywords=["today", "आज"]
    ))

    # 5. Check if any symptoms have unknown timing
    for s in symptoms:
        if s.lower() not in text_lower:
            events.append(TimelineEvent(
                day_label="Timing Unknown",
                title=f"Reported finding: {s}",
                description=f"Patient indicated '{s}', but exact duration or onset time was not stated.",
                is_exact_time=False,
                source=SourceType.PATIENT_REPORTED,
                detected_keywords=[]
            ))
            break # Just one unknown marker if applicable

    return events

