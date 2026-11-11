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
import asyncio
from typing import Dict, Any, List, Optional
import httpx
from pypdf import PdfReader

from backend.app.diacare.config import (
    GEMINI_API_KEY, EMERGENCY_TRIGGERS, EMERGENCY_HELPLINES,
    AUTHORITATIVE_SOURCES
)

logger = logging.getLogger("diacare")

# Resilient Multi-Model Cascade
CANDIDATE_GEMINI_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
]

CLINICAL_SYSTEM_INSTRUCTION = """You are Medo (Medo AI), a compassionate, highly knowledgeable, and responsible Healthcare Information & Diabetes Report Analyzer Assistant. You are part of the DiabetesGuard AI medical research platform.

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
    """
    Invoke Gemini via Google's official REST API with automatic multi-model fallback cascade.
    Handles temporary 503 high-demand spikes and rate limits seamlessly.
    """
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

    last_error_msg = ""

    # Try each candidate model in the cascade with fast retry
    for model_name in CANDIDATE_GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
        for attempt in range(2):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, json=payload)
                    
                    if resp.status_code == 200:
                        data = resp.json()
                        try:
                            reply = data["candidates"][0]["content"]["parts"][0]["text"]
                            logger.info(f"Gemini response generated successfully using model: {model_name}")
                            return reply
                        except (KeyError, IndexError) as parse_err:
                            logger.warning(f"Failed to parse candidate content from {model_name}: {parse_err}")
                            break
                    
                    # If high demand (503) or rate limit (429), retry briefly or cascade to next model
                    if resp.status_code in (503, 429):
                        logger.warning(f"Model {model_name} returned {resp.status_code} (attempt {attempt + 1}). Trying cascade fallback...")
                        last_error_msg = f"{model_name}: {resp.status_code}"
                        await asyncio.sleep(1.0)
                        continue
                    else:
                        logger.warning(f"Model {model_name} returned HTTP {resp.status_code}: {resp.text[:120]}")
                        last_error_msg = f"{model_name} HTTP {resp.status_code}"
                        break
            except Exception as e:
                logger.warning(f"Error calling {model_name}: {e}")
                last_error_msg = str(e)
                break

    raise RuntimeError(f"All Gemini models in cascade currently unavailable ({last_error_msg}).")


def get_clinical_fallback_reply(user_message: str, report_context: Optional[str] = None) -> str:
    """
    Intelligent grounded clinical knowledge base fallback.
    Guarantees that users always receive helpful, empathetic, evidence-based guidance
    even during external API network/server demand spikes.
    """
    lower = user_message.lower()

    # 1. Daily routine & diabetes care
    if any(k in lower for k in ["daily", "routine", "royine", "care", "manage", "life", "patient", "habits"]):
        return (
            "### 🌟 Essential Daily Routine & Care for Diabetes Management\n\n"
            "Managing diabetes successfully is built on consistent, practical daily habits aligned with **ADA (American Diabetes Association) & ICMR guidelines**:\n\n"
            "#### 1. 🌅 Morning Routine (Wake-up & Breakfast)\n"
            "• **Fasting Blood Glucose Check:** Check your fasting blood sugar upon waking (Clinical Target: **80–130 mg/dL**).\n"
            "• **Hydration:** Drink a glass of warm water or overnight methi (fenugreek seed) soaked water.\n"
            "• **Balanced Breakfast:** Avoid high-glycemic solo carbs (white bread, sugar-sweetened tea). Choose protein & fiber: **vegetable besan chilla, vegetable oats/dalia, boiled eggs, or sprouted moong salad**.\n"
            "• **Morning Medications:** Take prescribed oral medications (e.g., Metformin) with your meal to minimize stomach irritation.\n\n"
            "#### 2. 🥗 Afternoon Routine (Lunch & Digestion)\n"
            "• **The Diabetes Plate Method:**\n"
            "  - **50% Non-Starchy Vegetables / Salad:** Cucumber, tomato, lauki, spinach, methi, or bhindi.\n"
            "  - **25% Quality Protein:** Whole pulses (dal, rajma, chana), low-fat paneer, tofu, or lean fish/chicken.\n"
            "  - **25% Complex Carbohydrates:** 1–2 multigrain or whole wheat rotis, or brown rice/millet (ragi, jowar).\n"
            "• **Post-Meal Stroll:** A light 10–15 minute walk after lunch significantly lowers postprandial glucose peaks via insulin-independent **GLUT4 muscle uptake**.\n\n"
            "#### 3. 🏃 Evening Routine & Physical Activity\n"
            "• **Physical Exercise:** Aim for **30 minutes of brisk walking, cycling, or light resistance training** (target: 150 minutes/week).\n"
            "• **Healthy Snacking:** If hungry between meals, opt for roasted makhana, a small handful of almonds/walnuts, or roasted chana instead of fried snacks or biscuits.\n\n"
            "#### 4. 🌙 Night Routine & Sleep Care\n"
            "• **Early Dinner:** Finish dinner at least 2 hours before bed to prevent nocturnal hyperglycemia.\n"
            "• **Daily Foot Inspection:** Examine the soles of your feet daily for cuts, blisters, or redness (critical diabetic foot care).\n"
            "• **Restful Sleep:** Get 7–8 hours of quality sleep, as sleep deprivation directly elevates stress hormones (cortisol) and morning insulin resistance.\n\n"
            "*(Educational guidance based on ADA & ICMR standards. Individual medication targets should always be guided by your doctor.)*"
        )

    # 2. Diet & Rice / Food Questions
    if any(k in lower for k in ["rice", "eat", "food", "diet", "roti", "sugar", "fruit", "carb"]):
        return (
            "### 🥗 Nutrition & Diet Guidance for Diabetes\n\n"
            "You do not need to starve or eliminate carbs completely. The key is **glycemic index, portion control, and pairing**:\n\n"
            "• **Can you eat rice?** Yes, in controlled portions (1 small cup / ~100g cooked). Prefer brown rice, parboiled rice, or hand-pounded rice, and **always pair it with a generous portion of dal and fibrous green vegetables** to blunt the glucose spike.\n"
            "• **Best Grains:** Whole wheat chapatis, jowar, bajra, ragi, and steel-cut oats.\n"
            "• **Proteins to Include:** Sprouted legumes, rajma, chana, low-fat paneer, eggs, and nuts (walnuts, almonds).\n"
            "• **Foods to Minimize:** Refined maida, sweetened beverages, packaged fruit juices, bakery biscuits, and deep-fried namkeen.\n\n"
            "*Reference: ICMR-NIN Dietary Guidelines for Type 2 Diabetes.*"
        )

    # 3. HbA1c & Blood Glucose Numbers
    if any(k in lower for k in ["hba1c", "glucose", "level", "normal", "target", "fasting", "postprandial", "number"]):
        return (
            "### 🩸 Understanding Diabetes Blood Test Targets\n\n"
            "According to the **American Diabetes Association (ADA 2024 Standards of Care)**:\n\n"
            "| Biomarker | Normal | Pre-Diabetes | Diabetes Threshold |\n"
            "| :--- | :--- | :--- | :--- |\n"
            "| **Fasting Blood Glucose** | < 100 mg/dL | 100 – 125 mg/dL | ≥ 126 mg/dL |\n"
            "| **Postprandial (2-hr)** | < 140 mg/dL | 140 – 199 mg/dL | ≥ 200 mg/dL |\n"
            "| **HbA1c (3-Month Avg)** | < 5.7% | 5.7% – 6.4% | ≥ 6.5% |\n\n"
            "• **For diagnosed diabetes:** The typical clinical target is **HbA1c < 7.0%** to prevent microvascular complications (retinopathy, nephropathy, and neuropathy)."
        )

    # 4. Default Comprehensive Response
    return (
        "Hello! I am **Medo**, your Intelligent Diabetes Health Assistant.\n\n"
        "Here are 4 foundational pillars for diabetes care and management:\n\n"
        "1. **Active Monitoring:** Keep track of fasting (target 80–130 mg/dL) and post-meal glucose (< 180 mg/dL).\n"
        "2. **Balanced Nutrition:** Use the plate method (50% vegetables, 25% protein/dal, 25% complex whole grains).\n"
        "3. **GLUT4 Activation:** 30 minutes of daily physical exercise allows muscles to pull sugar from blood without relying on insulin.\n"
        "4. **Medication & Foot Care:** Never skip prescribed medication and inspect your feet daily for small cuts or cracks.\n\n"
        "Feel free to ask me about specific Indian foods, how to interpret your lab reports, or exercise routines!"
    )


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

