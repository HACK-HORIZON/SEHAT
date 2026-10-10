"""
Timeline Router for SEHAT.
Converts free-form history into an anchored relative timeline.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from backend.app.models import TimelineEvent
from backend.app.timeline_service import extract_timeline_events

router = APIRouter(prefix="/timeline", tags=["Timeline Engine"])

class TimelineRequest(BaseModel):
    narrative_text: str
    symptoms: List[str] = []
    duration_days: Optional[int] = 0

@router.post("/generate", response_model=List[TimelineEvent])
def generate_timeline(req: TimelineRequest):
    return extract_timeline_events(req.narrative_text, req.symptoms, req.duration_days or 0)

