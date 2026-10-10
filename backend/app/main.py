"""
SEHAT: Human-in-the-loop Multimodal Healthcare Triage Support Backend.
Strictly non-diagnostic educational prototype.
Never prescribes medication, never claims diagnosis, never replaces doctors.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import init_db, get_all_cases, save_case, add_audit_log
from backend.app.seed_data import generate_seed_cases

from backend.app.routers import (
    intake,
    transcription,
    ocr,
    extraction,
    timeline,
    missing_information,
    safety,
    triage,
    review,
    audit,
    privacy
)

app = FastAPI(
    title="SEHAT Triage Support Platform API",
    description="Multimodal, Human-in-the-Loop Clinical Triage & Triage Passport Engine for Indian Public Health facilities.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend (local and production Vercel/custom domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all modular routers matching specifications
app.include_router(intake.router)
app.include_router(transcription.router)
app.include_router(ocr.router)
app.include_router(extraction.router)
app.include_router(timeline.router)
app.include_router(missing_information.router)
app.include_router(safety.router)
app.include_router(triage.router)
app.include_router(review.router)
app.include_router(audit.router)
app.include_router(privacy.router)

@app.on_event("startup")
def startup_event():
    init_db()
    # Populate initial synthetic seed cases if database is empty
    cases = get_all_cases()
    if not cases:
        seed_cases = generate_seed_cases()
        for c in seed_cases:
            save_case(c)
            for log in c.audit_trail:
                add_audit_log(log)

@app.get("/")
def root():
    return {
        "platform": "SEHAT",
        "tagline": "Human-in-the-loop Multimodal Triage Support Engine",
        "responsible_ai_disclaimer": "SEHAT is an educational prototype for triage-support and information organization. It is not a diagnostic system and does not replace qualified medical professionals.",
        "documentation": "/docs",
        "status": "OPERATIONAL",
        "supported_languages": ["en", "hi", "or", "bn", "ta"]
    }

@app.get("/health")
@app.get("/ping")
def ping():
    return {"status": "ok", "message": "SEHAT Backend is awake"}


