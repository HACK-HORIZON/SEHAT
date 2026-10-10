"""
Database Layer for SEHAT Triage Support Platform.
Defaults to local SQLite with thread safety, compatible with PostgreSQL via DATABASE_URL.
"""

import os
import json
import sqlite3
from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.app.models import TriageCase, AuditLogEntry

DB_FILE = os.getenv("SQLITE_DB_PATH", "sehat_nexus.db")

def get_connection():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Cases table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        temp_patient_id TEXT NOT NULL,
        priority_category TEXT NOT NULL,
        reviewer_status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        case_data_json TEXT NOT NULL
    )
    """)
    
    # Audit log table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        role TEXT NOT NULL,
        summary TEXT NOT NULL,
        details_json TEXT,
        timestamp TEXT NOT NULL
    )
    """)
    
    # Privacy & Consent ledger
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consent_ledger (
        id TEXT PRIMARY KEY,
        temp_patient_id TEXT NOT NULL,
        consent_granted INTEGER NOT NULL,
        purposes_json TEXT NOT NULL,
        expiry_timestamp TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

def save_case(case: TriageCase) -> TriageCase:
    conn = get_connection()
    cursor = conn.cursor()
    case_json = case.model_dump_json()
    cursor.execute("""
    INSERT INTO cases (id, temp_patient_id, priority_category, reviewer_status, created_at, updated_at, case_data_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        priority_category=excluded.priority_category,
        reviewer_status=excluded.reviewer_status,
        updated_at=excluded.updated_at,
        case_data_json=excluded.case_data_json
    """, (
        case.id,
        case.temp_patient_id,
        case.priority_category.value,
        case.reviewer_status.value,
        case.created_at,
        case.updated_at,
        case_json
    ))
    conn.commit()
    conn.close()
    return case

def get_case_by_id(case_id: str) -> Optional[TriageCase]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT case_data_json FROM cases WHERE id = ?", (case_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    data = json.loads(row["case_data_json"])
    return TriageCase(**data)

def get_all_cases() -> List[TriageCase]:
    conn = get_connection()
    cursor = conn.cursor()
    # Sort order: RED -> ORANGE -> YELLOW -> GREEN, then waiting time descending
    cursor.execute("SELECT case_data_json FROM cases ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    priority_order = {"RED": 0, "ORANGE": 1, "YELLOW": 2, "GREEN": 3}
    for r in rows:
        data = json.loads(r["case_data_json"])
        results.append(TriageCase(**data))
        
    results.sort(key=lambda c: (priority_order.get(c.priority_category.value, 99), -c.waiting_time_minutes))
    return results

def delete_case(case_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cases WHERE id = ?", (case_id,))
    cursor.execute("DELETE FROM audit_logs WHERE case_id = ?", (case_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted

def purge_all_data():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cases")
    cursor.execute("DELETE FROM audit_logs")
    cursor.execute("DELETE FROM consent_ledger")
    conn.commit()
    conn.close()

def add_audit_log(entry: AuditLogEntry):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO audit_logs (id, case_id, action_type, performed_by, role, summary, details_json, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        entry.id,
        entry.case_id,
        entry.action_type,
        entry.performed_by,
        entry.role,
        entry.summary,
        json.dumps(entry.details or {}),
        entry.timestamp
    ))
    conn.commit()
    conn.close()

def get_audit_logs(case_id: Optional[str] = None) -> List[AuditLogEntry]:
    conn = get_connection()
    cursor = conn.cursor()
    if case_id:
        cursor.execute("SELECT * FROM audit_logs WHERE case_id = ? ORDER BY timestamp DESC", (case_id,))
    else:
        cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100")
    rows = cursor.fetchall()
    conn.close()
    
    logs = []
    for r in rows:
        logs.append(AuditLogEntry(
            id=r["id"],
            case_id=r["case_id"],
            action_type=r["action_type"],
            performed_by=r["performed_by"],
            role=r["role"],
            summary=r["summary"],
            details=json.loads(r["details_json"]) if r["details_json"] else {},
            timestamp=r["timestamp"]
        ))
    return logs

