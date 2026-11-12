"""
DiaCare AI — FastAPI Endpoints Router
======================================
Provides interactive chat and multimodal report analysis for the DiabetesGuard AI platform.
"""

import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.diacare.service import (
    chat_with_diacare,
    analyze_report_file,
    get_clinical_fallback_reply
)
from backend.app.diacare.config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES

logger = logging.getLogger("diacare")
router = APIRouter()


class ChatPayload(BaseModel):
    message: str = Field(..., min_length=1, max_length=2500)
    report_context: Optional[str] = None
    language: Optional[str] = "en"
    history: Optional[List[Dict[str, str]]] = None


@router.post("/chat")
async def chat_endpoint(payload: ChatPayload):
    """Interactive conversational diabetes assistant powered by Gemini with resilient clinical fallback."""
    try:
        result = await chat_with_diacare(
            user_message=payload.message,
            history=payload.history,
            report_context=payload.report_context,
            language=payload.language or "en"
        )
        return result
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}. Activating grounded clinical fallback.")
        fallback_reply = get_clinical_fallback_reply(payload.message, payload.report_context, payload.history)
        return {
            "reply": fallback_reply,
            "is_emergency": False,
            "citations": [
                {"organization": "American Diabetes Association (ADA)", "title": "Standards of Care in Diabetes (2024)"},
                {"organization": "Indian Council of Medical Research (ICMR)", "title": "Guidelines for Management of T2D"}
            ]
        }


@router.post("/analyze-report")
async def analyze_report_endpoint(file: UploadFile = File(...)):
    """Upload and analyze a PDF or image diabetes laboratory report."""
    # 1. Validate file extension
    filename = file.filename or "report.pdf"
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Please upload a PDF (.pdf) or image (.jpg, .jpeg, .png)."
        )

    # 2. Read bytes & check size limit
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 15 MB limit. Please upload a smaller document."
        )

    mime_type = file.content_type or ("application/pdf" if ext == ".pdf" else "image/jpeg")

    # 3. Analyze via service
    try:
        analysis = await analyze_report_file(file_bytes, filename, mime_type)
        return {
            "status": "success",
            "filename": filename,
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze medical report: {str(e)}"
        )


@router.get("/health")
def diacare_health():
    return {
        "service": "Medo AI Assistant",
        "status": "online",
        "model": "gemini-3.5-flash",
        "supported_formats": [".pdf", ".jpg", ".jpeg", ".png"]
    }

