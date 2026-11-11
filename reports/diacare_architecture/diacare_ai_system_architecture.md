# DiaCare AI — System Architecture & Engineering Specification
## AI-Powered Diabetes Medical Report Analyzer and Health Education Chatbot

**Module of:** DiabetesGuard AI — Explainable Diabetes Risk Assessment Platform  
**Author:** DiabetesGuard AI Development Team  
**Date:** November 2026  
**Status:** Phase 1 Design Completed (Pending Approval for Phase 2)

---

## 1. Executive Summary & Design Philosophy

**DiaCare AI** is an advanced, evidence-grounded healthcare assistant module integrated into the **DiabetesGuard AI** platform. While DiabetesGuard AI focuses on multi-track machine learning risk assessment (calibrated Stacking Ensemble, XGBoost, Random Forest with local SHAP explainability), **DiaCare AI** addresses the crucial need for **comprehensible patient education, automated medical report understanding, and culturally relevant diabetes guidance**.

### Core Philosophy
1. **Responsible Healthcare AI:** Operates strictly as an educational and screening companion. It **never diagnoses**, **never prescribes or alters medication dosages**, and **never claims a patient is medically safe**.
2. **Zero Information Invention:** If a laboratory value is unreadable, missing, or obscured in an uploaded document, the system explicitly marks it as missing and requests a clearer scan or user verification.
3. **Rigorous Semantic Grounding (RAG):** All clinical claims and physiological explanations are backed by peer-reviewed, authoritative sources (ADA, ICMR, WHO, NIN, CDC/NIDDK) with verifiable citations.
4. **Culturally Relevant Indian Nutrition:** Provides realistic, culturally adapted guidance for Indian diets (dal-to-roti ratios, millets, local non-starchy vegetables like karela and methi, healthy cooking mediums) rather than western-only generic advice.
5. **Deterministic Safety Guardrails:** Implements a rule-based clinical emergency triage filter that intercepts life-threatening symptoms (DKA, severe hypoglycemia, chest pain) and prioritizes immediate emergency response (112 in India / 911 globally).

---

## 2. Integration with DiabetesGuard AI Ecosystem

DiaCare AI integrates seamlessly into the existing full-stack architecture without modifying or disrupting the core ML prediction tracks:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DIABETESGUARD AI                                │
├──────────────────────────────────────┬──────────────────────────────────────┤
│      EXISTING ML PREDICTION TRACKS   │          DIACARE AI MODULE           │
│                                      │                                      │
│ • Track 1: Clinical (PIMA Stacking)  │ • Multi-format Report Upload         │
│ • Track 2: Lifestyle (CDC XGBoost)   │ • PyMuPDF & Tesseract OCR Pipeline   │
│ • Track 3: Symptoms (UCI RF)         │ • Biomarker Extraction & Validation  │
│ • Platt Probability Calibration      │ • RAG Knowledge Engine (ADA/ICMR)    │
│ • Live SHAP Waterfall Attributions   │ • Gemini / Multi-LLM Service         │
│ • Subgroup Fairness Audits           │ • Indian Nutrition & Lifestyle Guide │
│                                      │ • Red-Flag Emergency Triage (112)    │
├──────────────────────────────────────┴──────────────────────────────────────┤
│                        SHARED CORE INFRASTRUCTURE                           │
│                                                                             │
│ • Database: SQLAlchemy ORM (MySQL Schema with SQLite Local Fallback)         │
│ • API Layer: FastAPI Router Architecture (`/api/*` and `/api/diacare/*`)     │
│ • Frontend: React 18 + Vite + Tailwind CSS + Lucide Icons (`/diacare-ai`)    │
│ • Security: JWT Authentication, Input Validation (Pydantic v2), CORS         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. End-to-End System Processing Pipeline

```
[ User Upload (PDF / Image) ]
               │
               ▼
[ 1. Document Ingestion & Validation ]
       ├── File type whitelist (.pdf, .jpg, .jpeg, .png)
       └── Size verification (<= 15 MB)
               │
               ▼
[ 2. OCR & Text Extraction Engine ]
       ├── PDF: PyMuPDF (fitz) text and layout extraction
       └── Images: OpenCV pre-processing + Tesseract OCR
               │
               ▼
[ 3. Medical Parameter Extraction & Normalization ]
       ├── Regex pattern matchers with biomarker alias dictionary
       ├── Unit normalization & preservation (mg/dL, %, mmol/L)
       └── Extraction confidence scoring (0.0 – 1.0)
               │
               ▼
[ 4. Clinical Reference Auditing ]
       ├── Laboratory reference range parsing
       └── Guideline classification (Normal, Impaired/Prediabetic, Elevated)
               │
               ▼
[ 5. RAG Semantic Knowledge Retrieval ]
       ├── User query / report summary embedding (all-MiniLM-L6-v2)
       ├── Vector search against ADA, ICMR, NIN, WHO guidelines
       └── Source citation bundle creation
               │
               ▼
[ 6. Clinical Safety & Emergency Triage Filter ]
       ├── Scan for red-flag acute symptoms (confusion, DKA, sugar < 54)
       └── If triggered: Return immediate emergency hotline (112 / 108)
               │
               ▼
[ 7. LLM Educational Synthesis ]
       ├── System prompt enforcement (non-diagnostic, empathetic, clear)
       ├── Plain-language explanation of findings
       └── Suggested doctor consultation questions
               │
               ▼
[ 8. Interactive UI & Conversation Memory ]
       ├── Rendered in React frontend (`/diacare-ai`)
       └── Session conversation history stored in database
```

---

## 4. Key Architectural Modules

### 4.1 Document Ingestion & OCR Subsystem
- **PDF Documents:** Processed through `PyMuPDF` (`fitz`), parsing both raw paragraph text and structured tabular lab rows.
- **Scanned Images (JPG/PNG):** Processed via `OpenCV` (grayscale conversion, Otsu thresholding, morphological noise removal) followed by `Tesseract OCR` engine.
- **Fallback Capability:** In poor-quality scans, if confidence drops below 0.60, the system triggers a `"Partial / Unclear Document"` status and prompts the user to verify the extracted numeric parameters manually before proceeding.

### 4.2 Biomarker Recognition & Validation Engine
The extraction engine recognizes 11 standardized clinical parameters:
1. **HbA1c** (Glycated Hemoglobin, %)
2. **Fasting Plasma Glucose** (FPG / FBS, mg/dL)
3. **Postprandial Blood Glucose** (PPBS / 2-hr, mg/dL)
4. **Random Blood Glucose** (RBS, mg/dL)
5. **Total Cholesterol** (mg/dL)
6. **HDL Cholesterol** (mg/dL)
7. **LDL Cholesterol** (mg/dL)
8. **Triglycerides** (mg/dL)
9. **Serum Creatinine** (mg/dL)
10. **eGFR** (Glomerular Filtration Rate, mL/min/1.73m²)
11. **Urine Albumin / Microalbumin** (mg/g or mg/L)

**Validation Directives:**
- Strict unit tracking: Never compare a mmol/L value against a mg/dL threshold without explicit unit conversion.
- No phantom values: Zero values are never imputed or hallucinated.

### 4.3 RAG Knowledge Base Architecture
- **Knowledge Sources:**
  - *American Diabetes Association (ADA):* Standards of Care in Diabetes 2024.
  - *Indian Council of Medical Research (ICMR):* Guidelines for Management of T2D.
  - *National Institute of Nutrition (NIN - ICMR):* Dietary Guidelines for Indians 2024.
  - *World Health Organization (WHO):* Technical Reports on Diabetes.
  - *NIDDK / NIH:* Microvascular and macrovascular complication mechanisms.
- **Chunking Strategy:** Recursive character splitting with heading preservation (350 tokens per chunk with 50-token overlap).
- **Embedding:** `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional vector space).
- **Vector Index:** ChromaDB / FAISS index persisted on disk with metadata filters (`organization`, `topic`, `source_url`).

### 4.4 LLM Service Layer
- **Provider Interface:** Factory pattern abstracting the underlying LLM provider.
- **Default Engine:** Google Gemini API (`gemini-1.5-flash`) initialized using the secure environment variable `GEMINI_API_KEY`.
- **Deterministic Settings:** `temperature = 0.1` and `top_p = 0.9` to minimize creative variation and eliminate medical hallucinations.
- **Multilingual Support:** Dynamic language adaptation to provide responses in English and Hindi upon request.

### 4.5 Indian Nutrition & Lifestyle Engine
- **Grain Guidance:** Portions and benefits of millets (ragi, jowar, bajra), whole-wheat chapati, brown rice, steel-cut oats vs refined maida and white rice.
- **Vegetable Guidance:** Abundant leafy greens (palak, methi, sarson), functional vegetables (karela, lauki), non-starchy cruciferous options.
- **Protein Balancing:** Optimizing dal-to-cereal ratios, paneer, tofu, sprouts, eggs, and lean fish.
- **Physical Activity:** Educational guidance on the insulin-independent **GLUT4 translocation mechanism** triggered by 150 min/week moderate aerobic activity + 2x/week resistance exercises + 15-minute post-meal walks.

### 4.6 Clinical Safety & Emergency Triage
- If user input matches acute red-flag patterns:
  - Diabetic Ketoacidosis symptoms (fruity breath, deep breathing, persistent vomiting)
  - Severe hypoglycemia (blood glucose < 54 mg/dL, confusion, slurred speech)
  - Cardiovascular acute events (crushing chest pain, severe shortness of breath)
- The system immediately interrupts conversational flow and presents an emergency intervention card directing the user to **112 (National Emergency Helpline in India)** or local medical emergency services.

---

## 5. Database Schema Extensions

Integrated with existing `diabetesguard_db`:

```sql
-- 1. Uploaded Medical Reports
CREATE TABLE medical_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes INT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_status VARCHAR(30) DEFAULT 'pending',
    error_message TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_report_user (user_id),
    INDEX idx_report_status (processing_status)
);

-- 2. Extracted Biomarker Parameters
CREATE TABLE extracted_medical_values (
    extraction_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    parameter_name VARCHAR(100) NOT NULL,
    extracted_value FLOAT NOT NULL,
    unit VARCHAR(30) NOT NULL,
    reference_range VARCHAR(50) NULL,
    is_abnormal BOOLEAN DEFAULT FALSE,
    report_date DATE NULL,
    extraction_confidence FLOAT DEFAULT 1.0,
    source_page_location VARCHAR(100) NULL,
    FOREIGN KEY (report_id) REFERENCES medical_reports(report_id) ON DELETE CASCADE,
    INDEX idx_extracted_report (report_id)
);

-- 3. Chat Conversations
CREATE TABLE chat_conversations (
    conversation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    report_id INT NULL,
    title VARCHAR(150) DEFAULT 'Diabetes Consultation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (report_id) REFERENCES medical_reports(report_id) ON DELETE SET NULL
);

-- 4. Chat Messages & Citations
CREATE TABLE chat_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    citations_json JSON NULL,
    is_emergency BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(conversation_id) ON DELETE CASCADE
);

-- 5. Curated Medical Knowledge Sources
CREATE TABLE medical_knowledge_sources (
    source_id INT AUTO_INCREMENT PRIMARY KEY,
    organization VARCHAR(100) NOT NULL,
    document_title VARCHAR(255) NOT NULL,
    document_version VARCHAR(50) NULL,
    source_url VARCHAR(500) NOT NULL,
    last_verified DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. REST API Specifications

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/diacare/upload-report` | Validates and stores user PDF/image report file |
| `POST` | `/api/diacare/analyze-report` | Runs OCR and extracts structured biomarker parameters |
| `POST` | `/api/diacare/chat` | Conversational RAG endpoint returning evidence-grounded answers |
| `GET` | `/api/diacare/conversations` | Lists user's active and archived chat sessions |
| `GET` | `/api/diacare/conversations/{id}` | Retrieves full message history and report context |
| `DELETE`| `/api/diacare/conversations/{id}` | Deletes a conversation session |
| `DELETE`| `/api/diacare/reports/{id}` | Clears stored report context and uploaded file |
| `GET` | `/api/diacare/sources` | Returns metadata on all indexed medical guideline sources |

---

## 7. Frontend UI Design (`/diacare-ai`)

The DiaCare AI page features a modern, accessible, and responsive two-panel layout:
1. **Left Panel — Medical Report Hub:**
   - Drag-and-drop file upload zone (PDF, PNG, JPG).
   - Real-time extraction preview card showing detected HbA1c, Fasting Glucose, Lipids, etc.
   - Normal vs Abnormal parameter badge indicators.
   - List of customized questions to ask your physician based on the uploaded numbers.
2. **Right Panel — Interactive AI Health Chatbot:**
   - Natural language conversational feed with message bubbles.
   - Suggested quick-question prompts (e.g., *"Explain my HbA1c"*, *"Can I eat rice?"*, *"What are good breakfast options?"*, *"Explain in Hindi"*).
   - Collapsible **Source Citation cards** showing verified references (ADA 2024, ICMR, WHO).
   - High-visibility red-flag emergency alert banner when urgent medical symptoms are detected.
3. **Top Navigation Tab Integration:**
   - Added directly to the main navbar (`DiaCare AI` link with Bot icon).

---

## 8. Development Roadmap (13 Phases)

- [x] **Phase 1: Chatbot Architecture & Specification** *(COMPLETED)*
- [ ] **Phase 2: Medical Document Upload Engine**
- [ ] **Phase 3: PDF and Image OCR Processing**
- [ ] **Phase 4: Structured Medical Parameter Extraction & Unit Validation**
- [ ] **Phase 5: Medical Knowledge Collection & RAG Vector Store**
- [ ] **Phase 6: LLM Integration (Gemini Service Adapter)**
- [ ] **Phase 7: Chatbot Interface Scaffolding (React)**
- [ ] **Phase 8: Indian Diabetes Nutrition & Lifestyle Engine**
- [ ] **Phase 9: Conversation Memory & Session History**
- [ ] **Phase 10: Medical Safety Controls & Emergency Triage Filters**
- [ ] **Phase 11: FastAPI Endpoints & Database Integration**
- [ ] **Phase 12: Comprehensive Testing & Evaluation**
- [ ] **Phase 13: Dashboard Integration & End-to-End Verification**

---

*Phase 1 is complete. Awaiting user approval to proceed to Phase 2.*

