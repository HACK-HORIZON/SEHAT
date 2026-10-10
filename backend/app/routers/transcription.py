"""
Transcription & Speech Translation Router for SEHAT.
Processes spoken audio, returns verbatim transcript and reviewer translation.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.app.transcription_service import SpeechTranscriptionService, PRESET_TRANSCRIPTS

router = APIRouter(prefix="/transcription", tags=["Speech & Transcription"])
stt_service = SpeechTranscriptionService()

class TranscribeRequest(BaseModel):
    audio_preset_key: Optional[str] = "hindi_fever_chills"
    target_language: str = "hi"
    custom_transcript: Optional[str] = None

@router.get("/presets")
def get_preset_audio_transcripts() -> Dict[str, Any]:
    """Returns available audio presets for one-click demo testing without requiring live mic."""
    return PRESET_TRANSCRIPTS

@router.post("/process")
def process_audio_transcription(req: TranscribeRequest) -> Dict[str, Any]:
    if req.custom_transcript:
        translation = stt_service.translate_patient_text(req.custom_transcript, req.target_language)
        return {
            "language": req.target_language,
            "raw_transcript": req.custom_transcript,
            "english_translation": translation,
            "confidence": 0.95
        }
    return stt_service.transcribe_audio(audio_name=req.audio_preset_key, language=req.target_language)

