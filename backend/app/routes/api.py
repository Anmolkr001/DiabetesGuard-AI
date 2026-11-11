"""
DiabetesGuard AI — API Routes Implementation
==============================================
Phase 12: Assessment, Models, and System Endpoints
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.entities import (
    User, Assessment, AssessmentFeatures, Prediction, Explanation, ModelVersion
)
from backend.app.schemas.contracts import (
    PimaClinicalInput, CDCLifestyleInput, UCISymptomInput,
    PredictionResult, ModelMetricsResponse, AssessmentHistoryItem,
    UserCreate, UserResponse, Token
)
from backend.app.security.auth import (
    get_password_hash, verify_password, create_access_token, get_current_user_optional
)
from backend.app.services.inference import (
    predict_pima_clinical, predict_cdc_lifestyle, predict_uci_symptoms
)

router = APIRouter()


# ---------------------------------------------------------------------------
# 1. Authentication Routes
# ---------------------------------------------------------------------------
@router.post("/auth/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role="user"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/auth/login", response_model=Token)
def login(form_data: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "user": user}


# ---------------------------------------------------------------------------
# 2. Assessment Inference Endpoints
# ---------------------------------------------------------------------------
@router.post("/assessment/pima", response_model=PredictionResult)
def assess_pima_clinical(
    payload: PimaClinicalInput,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    raw_dict = payload.model_dump()
    res = predict_pima_clinical(raw_dict)

    # Persist in DB
    assessment_uuid = str(uuid.uuid4())
    assessment = Assessment(
        user_id=current_user.id if current_user else None,
        assessment_uuid=assessment_uuid,
        track_code="pima_clinical"
    )
    db.add(assessment)
    db.flush()

    feat = AssessmentFeatures(
        assessment_id=assessment.id,
        raw_inputs_json=raw_dict,
        engineered_inputs_json=res.get("engineered_features")
    )
    db.add(feat)

    pred = Prediction(
        assessment_id=assessment.id,
        calibrated_probability=res["calibrated_probability"],
        risk_category=res["risk_category"],
        binary_label=res["binary_label"],
        disclaimer=res["disclaimer"]
    )
    db.add(pred)
    db.flush()

    if res.get("top_contributing_factors"):
        exp = Explanation(
            prediction_id=pred.id,
            base_value=res.get("shap_base_value"),
            shap_values_json=res["top_contributing_factors"],
            explanation_summary=res["summary"]
        )
        db.add(exp)

    db.commit()

    return {
        "assessment_id": assessment_uuid,
        "track_code": "pima_clinical",
        "model_name": "Calibrated Stacking Ensemble",
        "model_version": "v1.0.0",
        "calibrated_probability": res["calibrated_probability"],
        "probability_percentage": res["probability_percentage"],
        "risk_category": res["risk_category"],
        "binary_label": res["binary_label"],
        "confidence_interval": res["confidence_interval"],
        "disclaimer": res["disclaimer"],
        "recommended_next_steps": res["recommended_next_steps"],
        "created_at": datetime.now(timezone.utc),
        "top_contributing_factors": res.get("top_contributing_factors"),
        "shap_base_value": res.get("shap_base_value")
    }


@router.post("/assessment/cdc", response_model=PredictionResult)
def assess_cdc_lifestyle(
    payload: CDCLifestyleInput,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    raw_dict = payload.model_dump()
    res = predict_cdc_lifestyle(raw_dict)

    assessment_uuid = str(uuid.uuid4())
    assessment = Assessment(
        user_id=current_user.id if current_user else None,
        assessment_uuid=assessment_uuid,
        track_code="cdc_lifestyle"
    )
    db.add(assessment)
    db.flush()

    feat = AssessmentFeatures(assessment_id=assessment.id, raw_inputs_json=raw_dict)
    db.add(feat)

    pred = Prediction(
        assessment_id=assessment.id,
        calibrated_probability=res["calibrated_probability"],
        risk_category=res["risk_category"],
        binary_label=res["binary_label"],
        disclaimer=res["disclaimer"]
    )
    db.add(pred)
    db.commit()

    return {
        "assessment_id": assessment_uuid,
        "track_code": "cdc_lifestyle",
        "model_name": "Calibrated XGBoost Lifestyle Screener",
        "model_version": "v1.0.0",
        "calibrated_probability": res["calibrated_probability"],
        "probability_percentage": res["probability_percentage"],
        "risk_category": res["risk_category"],
        "binary_label": res["binary_label"],
        "confidence_interval": res["confidence_interval"],
        "disclaimer": res["disclaimer"],
        "recommended_next_steps": res["recommended_next_steps"],
        "created_at": datetime.now(timezone.utc)
    }


@router.post("/assessment/uci", response_model=PredictionResult)
def assess_uci_symptoms(
    payload: UCISymptomInput,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    raw_dict = payload.model_dump()
    res = predict_uci_symptoms(raw_dict)

    assessment_uuid = str(uuid.uuid4())
    assessment = Assessment(
        user_id=current_user.id if current_user else None,
        assessment_uuid=assessment_uuid,
        track_code="uci_symptoms"
    )
    db.add(assessment)
    db.flush()

    feat = AssessmentFeatures(assessment_id=assessment.id, raw_inputs_json=raw_dict)
    db.add(feat)

    pred = Prediction(
        assessment_id=assessment.id,
        calibrated_probability=res["calibrated_probability"],
        risk_category=res["risk_category"],
        binary_label=res["binary_label"],
        disclaimer=res["disclaimer"]
    )
    db.add(pred)
    db.commit()

    return {
        "assessment_id": assessment_uuid,
        "track_code": "uci_symptoms",
        "model_name": "Calibrated Random Forest Symptom Classifier",
        "model_version": "v1.0.0",
        "calibrated_probability": res["calibrated_probability"],
        "probability_percentage": res["probability_percentage"],
        "risk_category": res["risk_category"],
        "binary_label": res["binary_label"],
        "confidence_interval": res["confidence_interval"],
        "disclaimer": res["disclaimer"],
        "recommended_next_steps": res["recommended_next_steps"],
        "created_at": datetime.now(timezone.utc)
    }


# ---------------------------------------------------------------------------
# 3. Assessment History & Retrieval
# ---------------------------------------------------------------------------
@router.get("/assessment/history", response_model=List[AssessmentHistoryItem])
def get_assessment_history(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(Assessment).join(Prediction)
    if current_user:
        query = query.filter(Assessment.user_id == current_user.id)
    assessments = query.order_by(Assessment.created_at.desc()).limit(25).all()

    items = []
    for a in assessments:
        if a.prediction:
            items.append({
                "assessment_uuid": a.assessment_uuid,
                "track_code": a.track_code,
                "calibrated_probability": a.prediction.calibrated_probability,
                "risk_category": a.prediction.risk_category,
                "created_at": a.created_at,
                "summary": f"{a.track_code.replace('_', ' ').title()} - {a.prediction.risk_category}"
            })
    return items


@router.get("/assessment/{uuid_str}")
def get_assessment_detail(uuid_str: str, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.assessment_uuid == uuid_str).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment record not found")

    pred = assessment.prediction
    feat = assessment.features

    return {
        "assessment_uuid": assessment.assessment_uuid,
        "track_code": assessment.track_code,
        "created_at": assessment.created_at,
        "inputs": feat.raw_inputs_json if feat else {},
        "prediction": {
            "calibrated_probability": pred.calibrated_probability if pred else None,
            "risk_category": pred.risk_category if pred else None,
            "disclaimer": pred.disclaimer if pred else None
        } if pred else None
    }


# ---------------------------------------------------------------------------
# 4. Model Analytics & Registry
# ---------------------------------------------------------------------------
@router.get("/model/metrics", response_model=List[ModelMetricsResponse])
def get_model_metrics():
    return [
        {
            "track_code": "pima_clinical",
            "model_name": "Calibrated Stacking Ensemble",
            "algorithm": "Stacking (LR + RF + XGB + SVM -> Logistic Regression)",
            "test_roc_auc": 0.8144,
            "test_pr_auc": 0.7054,
            "test_brier_score": 0.1698,
            "test_ece": 0.0653,
            "test_accuracy": 0.7532,
            "test_recall": 0.6111,
            "test_precision": 0.6471,
            "training_sample_size": 614,
            "test_sample_size": 154,
            "task_scope": "Existing Status Classification (Clinical OGTT & Biochemical)"
        },
        {
            "track_code": "cdc_lifestyle",
            "model_name": "Calibrated XGBoost Lifestyle Screener",
            "algorithm": "XGBoost Classifier + Sigmoid Calibrator",
            "test_roc_auc": 0.8273,
            "test_pr_auc": 0.4243,
            "test_brier_score": 0.0975,
            "test_ece": 0.0077,
            "test_accuracy": 0.8655,
            "test_recall": 0.1300,
            "test_precision": 0.5758,
            "training_sample_size": 202944,
            "test_sample_size": 50736,
            "task_scope": "Non-Invasive Community Screening (Demographics & Lifestyle)"
        },
        {
            "track_code": "uci_symptoms",
            "model_name": "Calibrated Random Forest Symptom Classifier",
            "algorithm": "Random Forest + Sigmoid Calibrator",
            "test_roc_auc": 0.9996,
            "test_pr_auc": 0.9998,
            "test_brier_score": 0.0211,
            "test_ece": 0.0150,
            "test_accuracy": 0.9904,
            "test_recall": 0.9844,
            "test_precision": 1.0000,
            "training_sample_size": 416,
            "test_sample_size": 104,
            "task_scope": "Acute Symptom Status Classification (Not Pre-Disease Prediction)"
        }
    ]


@router.get("/model/information")
def get_model_information():
    return {
        "platform": "DiabetesGuard AI",
        "version": "1.0.0-research",
        "scientific_framework": "Multi-Track Explainable Screening Platform",
        "tracks": {
            "pima_clinical": "Clinical lab tests (fasting/post-load glucose, insulin, BMI). Utilizes Stacking Ensemble and live SHAP force values.",
            "cdc_lifestyle": "Non-invasive survey screening. Evaluates 21 population lifestyle indicators without blood draws.",
            "uci_symptoms": "Acute symptom triage classifier. Evaluates hyperglycemia-induced physiological presentation (polyuria, polydipsia)."
        },
        "critical_distinction": "Existing-status screening vs longitudinal future-risk prediction. None of these models are valid as prospective future-risk estimators without multi-year longitudinal follow-up data."
    }

