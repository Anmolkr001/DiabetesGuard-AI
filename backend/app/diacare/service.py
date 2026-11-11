"""
DiaCare AI — Gemini Healthcare Service & Report Analyzer
=========================================================
Grounded in ADA, ICMR, NIN, and WHO clinical standards.
Uses Gemini 3.5 Flash Lite for fast, accurate multimodal report analysis.
"""

import os
import io
import json
import base64
import logging
from typing import Dict, Any, List, Optional
import httpx
from pypdf import PdfReader

from backend.app.diacare.config import (
    GEMINI_API_KEY, EMERGENCY_TRIGGERS, EMERGENCY_HELPLINES,
    AUTHORITATIVE_SOURCES
)

logger = logging.getLogger("diacare")
GEMINI_MODEL = "gemini-3.5-flash-lite"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

CLINICAL_SYSTEM_INSTRUCTION = """You are DiaCare AI, a compassionate, highly knowledgeable, and responsible Healthcare Information & Diabetes Report Analyzer Assistant. You are part of the DiabetesGuard AI medical research platform.

### MANDATORY CLINICAL SAFETY GUIDELINES:
1. NON-DIAGNOSTIC PROTOCOL: You are an educational and screening assistant, NOT a doctor. Never tell a user "You have diabetes" or "You are in the clear". Frame findings as: "Your lab report shows an HbA1c value of X%, which is above the established clinical threshold of 6.5%."
2. NON-PRESCRIPTIVE PROTOCOL: Never prescribe medicines, change dosages, adjust insulin units, or recommend stopping prescribed treatments. Direct all medication adjustments to their prescribing physician.
3. EMERGENCY INTERCEPTION: If the user reports acute red-flag symptoms (severe confusion, loss of consciousness, fruity breath, chest pain, blood glucose < 54 mg/dL or > 400 mg/dL with vomiting), immediately prioritize emergency care: Direct to 112 (India National Emergency) or 911 (US).
4. CULTURALLY RELEVANT INDIAN NUTRITION: When answering diet questions, provide practical Indian dietary guidance (dal-to-cereal ratios, millets like ragi/jowar/bajra, whole wheat chapati, non-starchy vegetables like karela, lauki, methi, palak, low-fat paneer, sprouts) while dispelling myths that carbs are completely forbidden or that any single food cures diabetes.
5. EXERCISE PHYSIOLOGY: Explain how 150 min/week moderate aerobic activity and 2x/week resistance training activate muscle GLUT4 glucose transporters independently of insulin.
6. LAYPERSON ACCESSIBILITY: Explain medical terms (HbA1c, eGFR, Microalbuminuria, Triglycerides) in clear, simple language with bullet points and friendly formatting. If the user asks in Hindi or requests Hindi, reply fluently in Hindi.
"""


def check_for_emergencies(text: str) -> Optional[Dict[str, str]]:
    """Scan user text for acute medical red flags."""
    lower = text.lower()
    for trigger in EMERGENCY_TRIGGERS:
        if trigger in lower:
            return {
                "is_emergency": True,
                "trigger_matched": trigger,
                "helpline_india": EMERGENCY_HELPLINES["India"],
                "helpline_international": EMERGENCY_HELPLINES["International"]
            }
    return None


async def call_gemini(
    prompt: str,
    system_instruction: str = CLINICAL_SYSTEM_INSTRUCTION,
    image_bytes: Optional[bytes] = None,
    mime_type: Optional[str] = None
) -> str:
    """Invoke Gemini 3.5 Flash Lite via Google's official REST API."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured in .env.")

    parts: List[Dict[str, Any]] = []

    # If image provided, attach as base64 inline data
    if image_bytes and mime_type:
        b64_data = base64.b64encode(image_bytes).decode("utf-8")
        parts.append({
            "inline_data": {
                "mime_type": mime_type,
                "data": b64_data
            }
        })

    parts.append({"text": prompt})

    payload = {
        "contents": [{"parts": parts}],
        "system_instruction": {
            "parts": [{"text": system_instruction}]
        },
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048,
        }
    }

    url = f"{API_URL}?key={GEMINI_API_KEY}"

    async with httpx.AsyncClient(timeout=45.0) as client:
        resp = await client.post(url, json=payload)
        if resp.status_code != 200:
            logger.error(f"Gemini API error ({resp.status_code}): {resp.text}")
            raise RuntimeError(f"Gemini API error: {resp.text}")

        data = resp.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError):
            return "I apologize, but I could not generate a response at this time. Please try again."


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from uploaded PDF report using pypdf."""
    reader = PdfReader(io.BytesIO(file_bytes))
    full_text = []
    for page_idx, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            full_text.append(f"--- PAGE {page_idx + 1} ---\n{text}")
    return "\n\n".join(full_text)


async def analyze_report_file(file_bytes: bytes, filename: str, mime_type: str) -> Dict[str, Any]:
    """
    Extracts laboratory biomarkers and produces a structured clinical breakdown.
    Supports PDF reports (via pypdf text extraction) and Images (via multimodal vision).
    """
    is_pdf = "pdf" in mime_type.lower() or filename.lower().endswith(".pdf")

    extraction_prompt = """Analyze this uploaded medical laboratory report carefully.
Extract all diabetes and metabolic-related biomarkers present in the document.

Respond STRICTLY in valid JSON matching this exact structure:
{
  "extracted_parameters": [
    {
      "parameter_name": "Standard Name (e.g. HbA1c, Fasting Blood Glucose, Postprandial Glucose, Total Cholesterol, HDL, LDL, Triglycerides, Serum Creatinine, eGFR, Urine Albumin)",
      "extracted_value": 7.2,
      "unit": "%",
      "reference_range": "< 5.7%",
      "is_abnormal": true,
      "clinical_status": "Elevated / Normal / Impaired",
      "layperson_explanation": "1-2 simple sentences explaining what this number means for the patient."
    }
  ],
  "overall_summary": "A friendly 3-4 sentence summary of the patient's report in plain English.",
  "foods_to_consume": ["Specific item 1", "Specific item 2", "Specific item 3"],
  "foods_to_avoid": ["Specific item 1", "Specific item 2", "Specific item 3"],
  "suggested_doctor_questions": [
    "Question 1 for doctor",
    "Question 2 for doctor",
    "Question 3 for doctor"
  ],
  "limitations": "This automated analysis is for educational purposes and does not replace medical consultation with a qualified doctor."
}

CRITICAL RULES:
- Never hallucinate missing values. Only include parameters that are explicitly present in the document.
- Preserve original units exactly as stated in the report.
- Do NOT wrap response in markdown code blocks if possible; return pure JSON.
"""

    if is_pdf:
        # Extract text from PDF first
        pdf_text = extract_text_from_pdf(file_bytes)
        if not pdf_text.strip():
            # Scanned PDF with no embedded text: explain limitation
            return {
                "extracted_parameters": [],
                "overall_summary": "The uploaded PDF appears to be a flat scanned image without embedded text layers. For best results, please upload as a JPG or PNG image, or provide a text-searchable digital PDF.",
                "foods_to_consume": ["High-fiber vegetables (spinach, methi)", "Whole oats & legumes", "Lean proteins (eggs, paneer, fish)"],
                "foods_to_avoid": ["Sugary beverages & sodas", "Refined flour (maida)", "Deep fried snacks"],
                "suggested_doctor_questions": ["What is my latest HbA1c target?", "Should I take a fasting plasma glucose test?"],
                "limitations": "Document text could not be extracted directly."
            }

        prompt = f"{extraction_prompt}\n\nDOCUMENT TEXT EXTRACTED FROM PDF:\n{pdf_text[:6000]}"
        raw_result = await call_gemini(prompt)
    else:
        # Image file (JPG/PNG): Pass image bytes directly to Gemini Vision
        prompt = extraction_prompt
        raw_result = await call_gemini(prompt, image_bytes=file_bytes, mime_type=mime_type)

    # Clean JSON output from potential markdown backticks
    cleaned = raw_result.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        parsed = json.loads(cleaned)
        return parsed
    except Exception as e:
        logger.warning(f"Failed to parse JSON from Gemini: {e}. Raw response: {raw_result[:200]}")
        return {
            "extracted_parameters": [],
            "overall_summary": raw_result,
            "foods_to_consume": ["Leafy vegetables", "Whole pulses (dals)", "Nuts & seeds"],
            "foods_to_avoid": ["Refined sugars", "White bread & maida", "Fried snacks"],
            "suggested_doctor_questions": ["Can you review my recent blood report?", "What lifestyle targets should I focus on?"],
            "limitations": "Could not format strictly as JSON, but the summary above provides medical findings."
        }


async def chat_with_diacare(
    user_message: str,
    history: Optional[List[Dict[str, str]]] = None,
    report_context: Optional[str] = None,
    language: str = "en"
) -> Dict[str, Any]:
    """Conversational assistant for diabetes education, diet, exercise, and report explanation."""
    
    # 1. Check for emergency red flags
    emergency = check_for_emergencies(user_message)
    if emergency:
        emergency_reply = (
            "🚨 **URGENT MEDICAL NOTICE:**\n\n"
            "The symptoms you described can indicate an acute medical emergency (such as severe hypoglycemia, diabetic ketoacidosis, or cardiovascular stress).\n\n"
            f"**Please seek immediate emergency medical care:**\n"
            f"• **India Emergency Helpline:** {emergency['helpline_india']}\n"
            f"• **International:** Call 911 (US), 999 (UK), or your nearest local hospital ambulance immediately.\n\n"
            "Do not wait or rely on an AI chat assistant for acute, severe medical emergencies."
        )
        return {
            "reply": emergency_reply,
            "is_emergency": True,
            "citations": []
        }

    # 2. Build conversation context
    context_blocks = []
    if report_context:
        context_blocks.append(f"PATIENT'S RECENT MEDICAL REPORT CONTEXT:\n{report_context}")

    if language == "hi" or any("\u0900" <= c <= "\u097f" for c in user_message):
        context_blocks.append("LANGUAGE INSTRUCTION: Please reply fluently in friendly, clear Hindi (Devanagari script or Hinglish as appropriate).")

    full_prompt = ""
    if context_blocks:
        full_prompt += "\n\n".join(context_blocks) + "\n\n"

    # Add conversation history if available
    if history:
        full_prompt += "PREVIOUS CONVERSATION:\n"
        for turn in history[-6:]:  # Last 3 turns
            role = "User" if turn.get("sender") == "user" else "Assistant"
            full_prompt += f"{role}: {turn.get('message', '')}\n"
        full_prompt += "\n"

    full_prompt += f"User Question: {user_message}\n\nPlease provide a clear, empathetic, source-backed answer with practical diabetes guidance:"

    ai_reply = await call_gemini(full_prompt)

    # Attach relevant citations
    citations = [
        {"organization": "American Diabetes Association (ADA)", "title": "Standards of Care in Diabetes (2024)"},
        {"organization": "Indian Council of Medical Research (ICMR)", "title": "Guidelines for Management of T2D"}
    ]

    return {
        "reply": ai_reply,
        "is_emergency": False,
        "citations": citations
    }
