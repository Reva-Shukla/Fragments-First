import os
import re
import uuid
from pathlib import Path
from fastapi import HTTPException, UploadFile, status
from app.core.config import settings

ALLOWED_EXTENSIONS = {
    "pdf": "pdf",
    "docx": "docx",
    "doc": "docx",
    "txt": "txt",
    "csv": "txt",
    "log": "txt",
    "png": "image",
    "jpg": "image",
    "jpeg": "image",
    "webp": "image",
    "mp3": "audio",
    "wav": "audio",
    "m4a": "audio",
    "ogg": "audio",
    "webm": "audio",   # Browser MediaRecorder default format
    "flac": "audio",
    "mp4": "video",
}


def sanitize_filename(filename: str) -> str:
    """Removes unsafe characters from filenames to avoid path traversal."""
    filename = os.path.basename(filename)
    filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
    return filename


def validate_file_size(file_size_bytes: int) -> None:
    """Validates that uploaded file does not exceed maximum configured size."""
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )


def save_upload_file(
    file: UploadFile,
    case_id: int,
    subfolder: str = "",
) -> tuple[str, str, str, int]:
    """
    Saves an uploaded file to secure storage directory under case subdirectory.
    subfolder: optional sub-directory name (e.g. 'voice') within the uploads dir.
    Returns: (saved_relative_path, original_filename, detected_file_type, file_size)
    """
    original_filename = file.filename or "uploaded_file"
    safe_name = sanitize_filename(original_filename)

    ext = safe_name.split(".")[-1].lower() if "." in safe_name else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' is not supported. Allowed extensions: {list(ALLOWED_EXTENSIONS.keys())}"
        )

    file_type = ALLOWED_EXTENSIONS[ext]

    # Save into uploads[/subfolder]/case_<id>/<uuid>_<filename>
    base_dir = os.path.join(settings.UPLOAD_DIR, subfolder) if subfolder else settings.UPLOAD_DIR
    case_folder = os.path.join(base_dir, f"case_{case_id}")
    os.makedirs(case_folder, exist_ok=True)

    unique_prefix = uuid.uuid4().hex[:8]
    stored_filename = f"{unique_prefix}_{safe_name}"
    target_path = os.path.join(case_folder, stored_filename)

    content = file.file.read()
    file_size = len(content)
    validate_file_size(file_size)

    with open(target_path, "wb") as f:
        f.write(content)

    return target_path, original_filename, ext, file_size
