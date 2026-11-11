"""
DiaCare AI — Configuration & Clinical Reference Architecture
============================================================
Phase 1: Architecture & System Parameters
"""

import os
from pathlib import Path
from typing import Dict, Any, List
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Base Directories & Environment Loading
# ---------------------------------------------------------------------------
DIACARE_DIR = Path(__file__).resolve().parent
APP_DIR = DIACARE_DIR.parent
BACKEND_DIR = APP_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

# Attempt loading .env from PROJECT_ROOT, BACKEND_DIR, or current working directory
for candidate in [PROJECT_ROOT / ".env", BACKEND_DIR / ".env", Path(".env").resolve()]:
    if candidate.exists():
        load_dotenv(candidate, override=False)
        break

UPLOAD_DIR = BACKEND_DIR / os.getenv("DIACARE_UPLOAD_DIR", "app/diacare/uploads")
VECTOR_STORE_DIR = BACKEND_DIR / os.getenv("DIACARE_VECTOR_DIR", "app/diacare/vector_store")
KNOWLEDGE_BASE_DIR = DIACARE_DIR / "knowledge_base"

# Ensure runtime directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
KNOWLEDGE_BASE_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# File Upload Constraints
# ---------------------------------------------------------------------------
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB

# ---------------------------------------------------------------------------
# LLM Provider Configuration
# ---------------------------------------------------------------------------
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini").lower()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("LLM_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-1.5-flash")
LLM_TEMPERATURE = 0.1  # Low temperature to guarantee grounded, non-hallucinating clinical answers
LLM_MAX_OUTPUT_TOKENS = 1500

# ---------------------------------------------------------------------------
# Embedding & RAG Parameters
# ---------------------------------------------------------------------------
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
RAG_TOP_K = 4
RAG_SIMILARITY_THRESHOLD = 0.65

# ---------------------------------------------------------------------------
# Recognized Clinical Biomarkers & Reference Standards
# Based on ADA Standards of Care (2024) & ICMR Guidelines
# ---------------------------------------------------------------------------
RECOGNIZED_BIOMARKERS: Dict[str, Dict[str, Any]] = {
    "HbA1c": {
        "aliases": ["hba1c", "glycated hemoglobin", "glycosylated hemoglobin", "a1c", "hemoglobin a1c"],
        "unit": "%",
        "normal_range": "< 5.7%",
        "prediabetes_range": "5.7% – 6.4%",
        "diabetes_threshold": ">= 6.5%",
        "category": "glycemic",
        "description": "Measures 3-month average blood glucose bound to red blood cells."
    },
    "Fasting Blood Glucose": {
        "aliases": ["fasting blood glucose", "fasting plasma glucose", "fpg", "fbs", "fasting blood sugar"],
        "unit": "mg/dL",
        "normal_range": "70 – 99 mg/dL",
        "prediabetes_range": "100 – 125 mg/dL (Impaired Fasting Glucose)",
        "diabetes_threshold": ">= 126 mg/dL",
        "category": "glycemic",
        "description": "Baseline glucose concentration after minimum 8–10 hours overnight fasting."
    },
    "Postprandial Blood Glucose": {
        "aliases": ["postprandial glucose", "post prandial", "ppbs", "2-hr post meal", "post glucose", "pp blood sugar"],
        "unit": "mg/dL",
        "normal_range": "< 140 mg/dL",
        "prediabetes_range": "140 – 199 mg/dL (Impaired Glucose Tolerance)",
        "diabetes_threshold": ">= 200 mg/dL",
        "category": "glycemic",
        "description": "Glucose measured exactly 2 hours after a standardized meal or 75g glucose load."
    },
    "Random Blood Glucose": {
        "aliases": ["random blood glucose", "random blood sugar", "rbs", "casual plasma glucose"],
        "unit": "mg/dL",
        "normal_range": "< 140 mg/dL",
        "prediabetes_range": "140 – 199 mg/dL",
        "diabetes_threshold": ">= 200 mg/dL (with classic hyperglycemic symptoms)",
        "category": "glycemic",
        "description": "Blood glucose sampled at any arbitrary time regardless of prior meals."
    },
    "Total Cholesterol": {
        "aliases": ["total cholesterol", "serum cholesterol", "cholesterol total"],
        "unit": "mg/dL",
        "normal_range": "< 200 mg/dL",
        "prediabetes_range": "200 – 239 mg/dL (Borderline High)",
        "diabetes_threshold": ">= 240 mg/dL (High)",
        "category": "lipid",
        "description": "Overall circulating cholesterol including HDL, LDL, and VLDL."
    },
    "HDL Cholesterol": {
        "aliases": ["hdl", "hdl cholesterol", "high density lipoprotein", "good cholesterol"],
        "unit": "mg/dL",
        "normal_range": ">= 40 mg/dL (Male), >= 50 mg/dL (Female)",
        "prediabetes_range": "N/A",
        "diabetes_threshold": "< 40 mg/dL (Major Cardiovascular Risk Factor)",
        "category": "lipid",
        "description": "High-density protective lipoprotein scavenging peripheral arterial cholesterol."
    },
    "LDL Cholesterol": {
        "aliases": ["ldl", "ldl cholesterol", "low density lipoprotein", "bad cholesterol"],
        "unit": "mg/dL",
        "normal_range": "< 100 mg/dL (Optimal)",
        "prediabetes_range": "100 – 129 mg/dL (Near Optimal), 130 – 159 mg/dL (Borderline)",
        "diabetes_threshold": ">= 160 mg/dL (High)",
        "category": "lipid",
        "description": "Atherogenic lipoprotein that forms arterial plaques."
    },
    "Triglycerides": {
        "aliases": ["triglycerides", "serum triglycerides", "tg", "trigs"],
        "unit": "mg/dL",
        "normal_range": "< 150 mg/dL",
        "prediabetes_range": "150 – 199 mg/dL (Borderline High)",
        "diabetes_threshold": ">= 200 mg/dL (High)",
        "category": "lipid",
        "description": "Main form of circulating fat stored in adipose tissue, highly responsive to dietary sugars."
    },
    "Serum Creatinine": {
        "aliases": ["serum creatinine", "creatinine", "s. creatinine", "creat"],
        "unit": "mg/dL",
        "normal_range": "0.7 – 1.3 mg/dL (Male), 0.6 – 1.1 mg/dL (Female)",
        "prediabetes_range": "N/A",
        "diabetes_threshold": "> 1.3 mg/dL (Indicates Impaired Renal Clearance)",
        "category": "renal",
        "description": "Metabolic breakdown product filtered by kidneys; marker of renal function."
    },
    "eGFR": {
        "aliases": ["egfr", "estimated gfr", "glomerular filtration rate"],
        "unit": "mL/min/1.73m²",
        "normal_range": ">= 90 mL/min/1.73m²",
        "prediabetes_range": "60 – 89 (Mild Reduction)",
        "diabetes_threshold": "< 60 (Established Chronic Kidney Disease Threshold)",
        "category": "renal",
        "description": "Calculated rate of kidney filtration per unit body surface area."
    },
    "Urine Albumin": {
        "aliases": ["urine albumin", "microalbumin", "uacr", "urine microalbumin", "albumin creatinine ratio"],
        "unit": "mg/g",
        "normal_range": "< 30 mg/g",
        "prediabetes_range": "30 – 300 mg/g (Microalbuminuria / Early Nephropathy)",
        "diabetes_threshold": "> 300 mg/g (Clinical Macroalbuminuria)",
        "category": "renal",
        "description": "Early detection marker for diabetic microvascular nephropathy."
    }
}

# ---------------------------------------------------------------------------
# Emergency Red-Flag Triage Indicators
# ---------------------------------------------------------------------------
EMERGENCY_TRIGGERS: List[str] = [
    "unconscious", "passed out", "fainting", "fainted",
    "severe confusion", "disoriented", "slurred speech",
    "trouble breathing", "shortness of breath", "chest pain",
    "persistent vomiting", "cannot keep fluids down",
    "fruity breath", "deep rapid breathing",
    "blood sugar below 50", "blood sugar below 54", "severe hypoglycemia",
    "blood sugar above 400", "ketoacidosis", "dka"
]

EMERGENCY_HELPLINES: Dict[str, str] = {
    "India": "112 (National Emergency Helpline) or 108 (Emergency Medical Ambulance)",
    "United States": "911",
    "United Kingdom": "999",
    "International": "Call your local emergency medical service immediately."
}

# ---------------------------------------------------------------------------
# Authoritative Medical Knowledge Sources (RAG Citations)
# ---------------------------------------------------------------------------
AUTHORITATIVE_SOURCES: List[Dict[str, str]] = [
    {
        "organization": "American Diabetes Association (ADA)",
        "document_title": "Standards of Care in Diabetes — 2024",
        "document_version": "Vol. 47, Suppl. 1",
        "source_url": "https://diabetes.org/",
        "scope": "Diagnostic criteria, glycemic targets, pharmacotherapy principles"
    },
    {
        "organization": "Indian Council of Medical Research (ICMR)",
        "document_title": "ICMR Guidelines for Management of Type 2 Diabetes",
        "document_version": "2023 Edition",
        "source_url": "https://www.icmr.gov.in/",
        "scope": "Asian-Indian specific BMI cuts (>=23), carbohydrate targets, dietary cultural context"
    },
    {
        "organization": "World Health Organization (WHO)",
        "document_title": "Diagnosis and Management of Type 2 Diabetes",
        "document_version": "Technical Report 2023",
        "source_url": "https://www.who.int/health-topics/diabetes",
        "scope": "Global epidemiological standards, non-communicable disease prevention"
    },
    {
        "organization": "National Institute of Nutrition (NIN - ICMR)",
        "document_title": "Dietary Guidelines for Indians",
        "document_version": "2024 Updated Guidelines",
        "source_url": "https://www.nin.res.in/",
        "scope": "Indian balanced meal composition, whole grains, pulse-to-cereal ratios, oil quality"
    },
    {
        "organization": "CDC & NIDDK (NIH)",
        "document_title": "Diabetes Education and Complications Overview",
        "document_version": "2024 Clinical Overview",
        "source_url": "https://www.niddk.nih.gov/health-information/diabetes",
        "scope": "Microvascular (retinopathy, neuropathy, nephropathy) and macrovascular complication education"
    }
]

# ---------------------------------------------------------------------------
# Chatbot Prompt Architecture
# ---------------------------------------------------------------------------
SYSTEM_PROMPT_TEMPLATE = """You are DiaCare AI, a compassionate, evidence-based, and highly responsible Diabetes Health Information & Report Analysis Assistant. You operate as part of the DiabetesGuard AI academic healthcare platform.

### MANDATORY CLINICAL SAFETY DIRECTIVES:
1. NON-DIAGNOSTIC PROTOCOL: You do NOT provide medical diagnoses. Never state "You have diabetes" or "You are cured". Frame findings as: "Your lab report shows an HbA1c value of X%, which is above the established clinical screening threshold of 6.5%."
2. NON-PRESCRIPTIVE PROTOCOL: You NEVER prescribe medicines, adjust insulin doses, recommend changing medications, or advise stopping prescribed treatments. Always direct personal treatment questions to the prescribing doctor.
3. EMERGENCY DETECTION: If the user mentions acute red-flag symptoms (severe confusion, loss of consciousness, fruity breath, chest pain, blood glucose < 54 mg/dL or > 400 mg/dL with vomiting), prioritize immediate emergency care (call 112 in India / 911 in US) above any ordinary conversation.
4. CULTURALLY RELEVANT NUTRITION: For dietary questions, provide practical Indian dietary guidance (e.g., dal-to-roti ratios, millets, methi, bitter gourd, paneer, sprouts) while discouraging demonizing entire food groups.
5. SOURCE GROUNDING: Cite authoritative medical guidelines (ADA, ICMR, WHO, NIN, NIDDK) whenever providing factual clinical targets.
6. CLARITY & EMPATHY: Explain complex terms (e.g. HbA1c, eGFR, Glycation, GLUT4, Insulin Resistance) in simple, encouraging layperson language. Support Hindi explanations when requested.

Report Context (if provided by user):
{report_context}

Authoritative RAG Context:
{rag_context}
"""

