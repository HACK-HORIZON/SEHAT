import urllib.request
import json

BASE = "http://127.0.0.1:8088"

def get(path):
    with urllib.request.urlopen(BASE + path) as res:
        return json.loads(res.read().decode())

def post(path, data):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode())

def main():
    print("=== 1. TEST ROOT HEALTH ===")
    root = get("/")
    print("Status:", root["status"])
    print("Tagline:", root["tagline"])
    assert root["status"] == "OPERATIONAL"

    print("\n=== 2. TEST QUEUE & STATS ===")
    stats = get("/triage/stats")
    print("Queue stats:", stats)
    assert stats["total_cases"] >= 5

    cases = get("/triage/queue")
    print(f"Retrieved {len(cases)} cases in queue")
    c_red = next(c for c in cases if c["priority_category"] == "RED")
    print(f"Verified RED case {c_red['id']} with {len(c_red['safety_signals'])} safety signals")

    print("\n=== 3. TEST INTAKE (HINDI SPEECH + CBC OCR) ===")
    new_case_payload = {
        "facility_name": "Khordha District Hospital",
        "preferred_language": "hi",
        "consent_granted": True,
        "chief_concern": "मरीज को 3 दिन से तेज बुखार, कंपकंपी और लाल चकत्ते आ रहे हैं।",
        "spoken_audio_transcript": "मरीज ने 3 दिन से तेज बुखार बताया है।",
        "input_text": "Fever for 3 days with chills and petechial rash",
        "symptoms": ["High-grade fever", "Chills and rigors", "Petechial rash on lower limbs"],
        "duration_days": 3,
        "raw_lab_text": "Platelet Count: 24,000 / mcL (Reference: 150000 - 450000)\nHemoglobin: 11.2 g/dL\nSpO2: 96 %",
        "low_bandwidth_mode": True
    }
    created_case = post("/intake/submit", new_case_payload)
    print(f"Created Case ID: {created_case['id']}")
    print(f"Assigned Priority: {created_case['priority_category']}")
    print(f"Timeline steps: {len(created_case['symptom_timeline'])}")
    print(f"Safety signals triggered: {[s['rule_code'] for s in created_case['safety_signals']]}")
    print(f"Missing info items: {[m['item'] for m in created_case['missing_information']]}")
    assert created_case["priority_category"] == "RED"

    print("\n=== 4. TEST CLINICAL OVERRIDE ===")
    override_payload = {
        "new_priority": "ORANGE",
        "reason": "Patient responsive; vital signs stabilized under supervised fluid bolus",
        "reviewer_name": "Dr. S. K. Mohapatra, MD",
        "reviewer_role": "Senior Medical Officer"
    }
    overridden = post(f"/review/{created_case['id']}/override", override_payload)
    print("Overridden Priority:", overridden["priority_category"])
    print("Reviewer Status:", overridden["reviewer_status"])
    assert overridden["priority_category"] == "ORANGE"

    print("\n=== 5. TEST ESCALATION ===")
    escalated = post(f"/review/{created_case['id']}/escalate?target=ICU_Triage", {})
    print("Escalation Status:", escalated["escalation_status"])
    print("Escalation Target:", escalated["escalation_target"])
    assert escalated["escalation_status"] is True

    print("\n=== 6. TEST AUDIT LOG ===")
    logs = get(f"/audit/logs?case_id={created_case['id']}")
    print(f"Audit trail contains {len(logs)} entries")
    for l in logs:
        print(f"  [{l['action_type']}] by {l['performed_by']}: {l['summary']}")
    assert len(logs) >= 3

    print("\n=== 7. TEST PRIVACY METRICS ===")
    priv = get("/privacy/metrics")
    print("Privacy Compliance:", priv["compliance_standards"])
    print("Active Consent Rate:", priv["active_consent_rate"])

    print("\n>>> ALL SEHAT SYSTEM VALIDATION TESTS PASSED! <<<")

if __name__ == "__main__":
    main()
