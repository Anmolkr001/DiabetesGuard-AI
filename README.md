# DiabetesGuard AI
### Explainable, Intelligent and Reliable Diabetes Risk Assessment Platform
*Final-Year B.Tech Information Technology Capstone Project*

---

## 📌 Executive Overview
**DiabetesGuard AI** is a modular, research-oriented healthcare machine learning platform designed to address critical limitations in conventional diabetes classification projects. Unlike naive models that conflate existing diagnosis with future risk or deploy uncalibrated classifiers, DiabetesGuard AI prioritizes:

1. **Scientific Correctness:** Strict separation between cross-sectional existing-status classification and longitudinal future-risk prediction.
2. **Multi-Track Screening:** Three dedicated clinical, non-invasive lifestyle, and acute symptom-based pipelines.
3. **Probability Calibration:** Platt Sigmoid scaling to reduce Expected Calibration Error (ECE) below 0.05.
4. **Explainable AI (XAI):** Game-theoretic SHAP (SHapley Additive exPlanations) for both global population trends and real-time local patient explanations.
5. **Zero Data Leakage:** Imputation, scaling, feature engineering, and resampling strictly confined to training cross-validation folds.
6. **Demographic Fairness:** Rigorous disparity audits across age cohorts and BMI categories.

---

## 🏛️ System Architecture

```
DiabetesGuard-AI/
├── frontend/                  # Modern React + Tailwind CSS Dashboard
│   ├── src/
│   │   ├── components/        # RiskGauge, ShapWaterfallChart, Navbar, Footer
│   │   ├── pages/             # Landing, Clinical, Lifestyle, Symptoms, Results, History, Analytics, About
│   │   └── services/          # Axios API Service
│   └── package.json
│
├── backend/                   # Production-Ready FastAPI Backend
│   ├── app/
│   │   ├── main.py            # FastAPI Application Entry
│   │   ├── routes/            # REST API Endpoints (/assessment/*, /model/*, /auth/*)
│   │   ├── schemas/           # Pydantic Input/Output Validation Contracts
│   │   ├── services/          # Model Inference & Live SHAP Generation Service
│   │   ├── database/          # SQLAlchemy Session & DB Engine
│   │   ├── models/            # Database Entities (Users, Assessments, Predictions, Explanations)
│   │   └── security/          # JWT Token Generation & Password Hashing
│   ├── saved_models/          # Serialized Pipelines (.joblib)
│   │   ├── pima/              # Stacking Classifier + SHAP TreeExplainer Bundle
│   │   ├── cdc/               # Calibrated XGBoost Lifestyle Screener
│   │   └── uci/               # Calibrated Random Forest Symptom Classifier
│   └── requirements.txt
│
├── machine_learning/          # Full Research & Development Pipeline
│   ├── datasets/              # Raw & Cleaned Data, Registry, Downloaders
│   ├── preprocessing/         # Loaders, EDA, Deterministic Cleaning, Train/Test Splits
│   ├── feature_selection/     # Domain Engineering & RFECV Selection
│   ├── training/              # Model Tuning, Stacking Ensemble, Probability Calibration
│   ├── evaluation/            # Locked Test Evaluation & Fairness Audits
│   ├── explainability/        # Global & Local SHAP Analysis
│   └── experiments/           # Cross-Dataset Generalizability Studies
│
├── database/
│   └── schema.sql             # Relational MySQL Schema Definition
│
├── reports/                   # Publication-Quality Plots & JSON Analytics
│   ├── dataset_analysis/      # EDA visualisations and profiles (PIMA, CDC, UCI)
│   ├── model_evaluation/      # ROC/PR curves, reliability diagrams, fairness bars
│   └── research_documentation/# Cross-dataset transferability & viva preparation guide
│
├── tests/                     # Automated Test Suite (Pytest + HTTPX)
│   └── api/                   # Integration tests for all endpoints and inference logic
├── .env.example
└── README.md
```

---

## 🔬 The Three Screening Tracks

| Dimension | Track 1: Clinical (PIMA) | Track 2: Lifestyle (CDC BRFSS) | Track 3: Symptoms (UCI) |
|---|---|---|---|
| **Assessment Scope** | Clinical Lab Diagnostics | Non-Invasive Community Screening | Acute Outpatient Triage |
| **Primary Inputs** | Fasting/OGTT Glucose, Insulin, BMI, Diastolic BP | GenHlth, HighBP, BMI, Age, PhysActivity | Polyuria, Polydipsia, Sudden Weight Loss |
| **Invasiveness** | Laboratory Blood Draw Required | **100% Non-Invasive** (Survey) | Non-Invasive (Symptom Checklist) |
| **Dataset Size** | 768 records | 253,680 survey respondents | 520 hospital patients |
| **Best Model** | **Calibrated Stacking Ensemble** | **Calibrated XGBoost** | **Calibrated Random Forest** |
| **Test ROC-AUC** | **0.8144** | **0.8273** | **0.9996** |
| **Brier Score** | **0.1698** (ECE: 0.0653) | **0.0975** (ECE: 0.0077) | **0.0211** (ECE: 0.0150) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- MySQL (Optional: automatically falls back to self-contained SQLite for local execution)

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/DiabetesGuard-AI.git
cd DiabetesGuard-AI

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install npm dependencies
npm install

# Start development server
npm run dev
```
Dashboard will be live at: `http://localhost:3000`

### 4. Running the Pytest Suite
```bash
pytest tests/api/test_api_endpoints.py -v
```

---

## 📊 Scientific & Research Contributions

1. **Stacking Ensemble Learning:**
   Synthesized base predictions from Logistic Regression, Random Forest, XGBoost, and Support Vector Machines via an L2 regularized meta-classifier using out-of-fold probability vectors.
2. **Probability Calibration:**
   Applied Sigmoid (Platt Scaling) to counter overconfident raw model predictions, reducing Expected Calibration Error (ECE) to under $0.05$.
3. **Game-Theoretic SHAP Interpretability:**
   Implemented TreeExplainer to deconstruct predictions into risk-increasing forces (red) and risk-reducing forces (green).
4. **Subgroup Fairness Audit:**
   Evaluated sensitivity and false positive disparities across age ($<35$ vs $\ge 35$) and BMI ($<30$ vs $\ge 30$) strata, demonstrating the necessity of calibrated risk communication rather than discrete diagnostic labels.
5. **Indian Population Data Availability Study:**
   Documented why foreign datasets (e.g. Pima indigenous women in Arizona) cannot be carelessly generalized to Indian demographic profiles without institutional clinical cohort data (such as ICMR-INDIAB).

---

## ⚖️ Ethical & Medical Disclaimer
DiabetesGuard AI is an academic machine learning prototype developed strictly for educational, research, and screening demonstration purposes. It does not provide clinical diagnoses, medical advice, or treatment plans. Users exhibiting symptoms of diabetes or metabolic disorders should seek immediate clinical evaluation and diagnostic laboratory testing from a qualified physician.

---
*Developed with rigorous data science principles, zero data leakage, and responsible AI communication.*

