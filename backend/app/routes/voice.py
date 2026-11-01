"""
Voice Transcription Route — Fragment First 2.0

Provides audio-to-text transcription for victim voice statements.

Architecture:
  Primary path: Browser Web Speech API (live speech-to-text in frontend, no backend needed)
  Secondary path: POST /api/voice/transcribe — upload a saved audio blob and get back text

Transcription strategy (no faster-whisper installed):
  - We accept the audio blob from the browser
  - Return a structured response the frontend expects
  - The browser's MediaRecorder captures audio; if Web Speech API was used in parallel,
    the live transcript is sent alongside for backend storage.

If faster-whisper or another STT library is installed later, swap in the
_transcribe_with_whisper() method without changing the API contract.
"""
import os
import hashlib
import tempfile
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.user import User
from app.models.statement import Statement
from app.models.case import Case
from app.utils.file_storage import save_upload_file
from app.routes.deps import check_case_access

router = APIRouter(prefix="/voice", tags=["Voice & Transcription"])

AUDIO_EXTENSIONS = {".webm", ".mp3", ".mp4", ".ogg", ".wav", ".m4a", ".flac"}


def _sha256(file_path: str) -> str:
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


@router.post(
    "/transcribe",
    summary="Transcribe an audio recording to text",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
def transcribe_audio(
    request: Request,
    case_id: int = Form(...),
    language: str = Form(default="en-IN"),
    live_transcript: Optional[str] = Form(
        default=None,
        description=(
            "Live transcript produced by the browser Web Speech API. "
            "When provided, this IS the transcription — no server-side STT is needed. "
            "The audio file is still stored for evidence integrity."
        ),
    ),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Store a voice recording and return its transcription.

    Two modes:
    1. live_transcript provided — browser already transcribed via Web Speech API.
       We store the audio file for integrity and return the transcript.
    2. live_transcript absent — server-side STT attempted.
       Currently returns a placeholder; install faster-whisper for full server STT.

    The original audio file is NEVER modified or deleted.
    Transcription is stored separately so the original is always recoverable.
    """
    # Validate case access
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    check_case_access(case, current_user, write_access=True)

    # Validate file type
    suffix = os.path.splitext(audio_file.filename or "recording.webm")[1].lower()
    if suffix not in AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format '{suffix}'. Accepted: {', '.join(AUDIO_EXTENSIONS)}",
        )

    # Save audio to secure storage
    file_path, original_filename, file_type, file_size = save_upload_file(
        audio_file, case_id, subfolder="voice"
    )
    audio_hash = _sha256(file_path)

    # Determine transcript
    if live_transcript and live_transcript.strip():
        transcript = live_transcript.strip()
        transcript_method = "browser_web_speech_api"
        confidence = 0.85
    else:
        # Server-side STT placeholder — install faster-whisper for real STT
        transcript = None
        transcript_method = "unavailable_no_stt_engine"
        confidence = 0.0

    create_audit_log(
        db=db,
        action="VOICE_RECORDING_UPLOADED",
        target_type="VoiceRecording",
        target_id=None,
        user_id=current_user.id,
        details=(
            f"Voice recording uploaded for case #{case_id}. "
            f"File: {original_filename} ({file_size} bytes). "
            f"Transcript method: {transcript_method}."
        ),
        ip_address=request.client.host if request.client else None,
    )

    return {
        "success": True,
        "audio_stored": True,
        "file_path": file_path,
        "original_filename": original_filename,
        "file_size_bytes": file_size,
        "file_hash_sha256": audio_hash,
        "transcript": transcript,
        "transcript_method": transcript_method,
        "language": language,
        "confidence": confidence,
        "case_id": case_id,
        "stt_note": (
            "Transcription provided by browser Web Speech API."
            if transcript
            else (
                "No server-side speech-to-text engine is configured. "
                "Install 'faster-whisper' for automatic server-side transcription. "
                "The audio file has been securely stored."
            )
        ),
    }


@router.post(
    "/statement",
    summary="Submit a voice-originated statement",
    status_code=status.HTTP_201_CREATED,
)
def submit_voice_statement(
    request: Request,
    case_id: int = Form(...),
    transcript_text: str = Form(...),
    language: str = Form(default="en"),
    audio_file_path: Optional[str] = Form(default=None),
    is_draft: bool = Form(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creates a Statement record from a voice transcript.
    The transcript becomes the immutable original_text.
    The audio file path is stored for reference.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    check_case_access(case, current_user, write_access=True)

    version = db.query(Statement).filter(Statement.case_id == case_id).count() + 1

    statement = Statement(
        case_id=case_id,
        victim_id=case.victim_id,
        original_text=transcript_text.strip(),
        is_draft=is_draft,
        version=version,
        audio_file_path=audio_file_path,
        language=language,
        transcript_source="voice_live",
        status="draft" if is_draft else "submitted",
    )
    db.add(statement)
    db.commit()
    db.refresh(statement)

    create_audit_log(
        db=db,
        action="VOICE_STATEMENT_SUBMITTED",
        target_type="Statement",
        target_id=statement.id,
        user_id=current_user.id,
        details=f"Voice statement #{statement.id} v{version} submitted for case #{case_id} in language={language}",
        ip_address=request.client.host if request.client else None,
    )

    return {
        "id": statement.id,
        "case_id": case_id,
        "version": version,
        "language": language,
        "transcript_source": "voice_live",
        "status": statement.status,
        "original_text": statement.original_text,
        "audio_file_path": audio_file_path,
        "created_at": statement.created_at.isoformat(),
    }
