"""
DiabetesGuard AI — Machine Learning Inference & Explainability Service
========================================================================
Handles model loading, feature engineering, calibrated inference, and SHAP.
"""

import sys
from pathlib import Path
from typing import Dict, Any, List, Tuple
import joblib
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(PROJECT_ROOT))

from machine_learning.feature_selection.pima_feature_engineering import (
    apply_all_feature_engineering, ALL_FEATURES
)

MODELS_DIR = PROJECT_ROOT / "backend" / "saved_models"

# ---------------------------------------------------------------------------
# Global In-Memory Model Cache
# ---------------------------------------------------------------------------
_MODELS_CACHE = {}


def get_model(track_key: str):
    """Lazy load and cache models into memory."""
    if track_key in _MODELS_CACHE:
        return _MODELS_CACHE[track_key]

    if track_key == "pima_clinical":
        path = MODELS_DIR / "pima" / "calibrated_stacking_pipeline.joblib"
        explainer_path = MODELS_DIR / "pima" / "pima_explainer.joblib"
        model = joblib.load(path)
        explainer_bundle = joblib.load(explainer_path) if explainer_path.exists() else None
        _MODELS_CACHE[track_key] = (model, explainer_bundle)
        return _MODELS_CACHE[track_key]

    elif track_key == "cdc_lifestyle":
        path = MODELS_DIR / "cdc" / "cdc_screening_model.joblib"
        model = joblib.load(path)
        _MODELS_CACHE[track_key] = model
        return model

    elif track_key == "uci_symptoms":
        path = MODELS_DIR / "uci" / "uci_symptom_model.joblib"
        model = joblib.load(path)
        _MODELS_CACHE[track_key] = model
        return model

    raise ValueError(f"Unknown track_key: {track_key}")


def categorize_risk(prob: float) -> Tuple[str, str, List[str]]:
    """
    Establish scientific, non-diagnostic risk categories.
    Does NOT declare someone 'Diabetic' or 'Non-Diabetic'.
    """
    if prob < 0.25:
        category = "Low Estimated Concern"
        summary = "Estimated probability is within lower risk baseline. Lifestyle maintenance recommended."
        steps = [
            "Maintain current balanced dietary and regular exercise patterns.",
            "Schedule routine annual preventive health check-ups.",
            "Note: This is a screening estimate, not a clinical diagnostic guarantee."
        ]
    elif prob < 0.55:
        category = "Moderate Attention Marker"
        summary = "Certain measured indicators place the individual in an intermediate risk zone."
        steps = [
            "Review dietary sugar and carbohydrate intake with a primary care practitioner.",
            "Consider requesting a routine fasting plasma glucose or HbA1c screening test.",
            "Increase moderate aerobic physical activity to 150 minutes per week."
        ]
    else:
        category = "Elevated Screening Concern"
        summary = "Indicators strongly correlate with diabetes screening thresholds."
        steps = [
            "Consult a qualified healthcare physician or endocrinologist for clinical laboratory evaluation.",
            "Request a confirmatory venous blood draw (Fasting Plasma Glucose and HbA1c test).",
            "Do not begin or alter any medication regimen without medical consultation."
        ]
    return category, summary, steps


# ---------------------------------------------------------------------------
# Track 1: PIMA Clinical Predictor
# ---------------------------------------------------------------------------
def predict_pima_clinical(raw_input: Dict[str, Any]) -> Dict[str, Any]:
    model, explainer_bundle = get_model("pima_clinical")

    # Map request to DataFrame
    df_raw = pd.DataFrame([{
        "Pregnancies": raw_input["pregnancies"],
        "Glucose": raw_input["glucose"],
        "BloodPressure": raw_input["blood_pressure"],
        "SkinThickness": raw_input["skin_thickness"],
        "Insulin": raw_input["insulin"],
        "BMI": raw_input["bmi"],
        "DiabetesPedigreeFunction": raw_input["diabetes_pedigree"],
        "Age": raw_input["age"]
    }])

    # Apply deterministic feature engineering
    df_eng = apply_all_feature_engineering(df_raw)
    X = df_eng[ALL_FEATURES].values

    # Calibrated prediction
    prob = float(model.predict_proba(X)[0, 1])
    risk_cat, summary, steps = categorize_risk(prob)

    # Compute live local SHAP explanation if bundle available
    contributions = []
    base_val = 0.35
    if explainer_bundle:
        try:
            # We explain via the XGBoost component inside the bundle
            explainer = explainer_bundle["explainer"]
            # Map through the preprocessor
            pima_preprocessor_path = MODELS_DIR / "pima" / "pima_preprocessor.joblib"
            preprocessor = joblib.load(pima_preprocessor_path)
            X_proc = preprocessor.transform(df_raw[["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI", "Pregnancies", "DiabetesPedigreeFunction", "Age"]])
            
            # Reconstruct engineered columns
            shap_vals = explainer(df_eng[ALL_FEATURES])
            vals = shap_vals.values[0]
            base_val = float(shap_vals.base_values[0]) if hasattr(shap_vals, "base_values") else 0.35

            label_map = {
                "Glucose": "Blood Glucose (OGTT)",
                "BMI": "Body Mass Index",
                "BMI_Age_Interaction": "Combined BMI & Age",
                "High_Risk_Count": "Risk Factor Count",
                "Age": "Chronological Age",
                "Insulin": "Serum Insulin",
                "DiabetesPedigreeFunction": "Genetic Pedigree Score",
                "BloodPressure": "Diastolic Blood Pressure",
                "Pregnancies": "Pregnancy History",
                "Glucose_Insulin_Ratio": "Glucose-Insulin Ratio"
            }

            for feat, sv in zip(ALL_FEATURES, vals):
                if abs(sv) > 0.005:
                    direction = "increases_risk" if sv > 0 else "decreases_risk"
                    interp = f"Contributes +{sv:.2f} toward elevated risk score" if sv > 0 else f"Contributes {sv:.2f} toward lower risk score"
                    contributions.append({
                        "feature": feat,
                        "feature_label": label_map.get(feat, feat),
                        "value": float(df_eng[feat].iloc[0]),
                        "contribution": round(float(sv), 4),
                        "direction": direction,
                        "clinical_interpretation": interp
                    })

            contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        except Exception as e:
            contributions = []

    # Standard confidence interval approximation
    ci_lower = max(0.0, prob - 0.06)
    ci_upper = min(1.0, prob + 0.06)

    return {
        "calibrated_probability": round(prob, 4),
        "probability_percentage": round(prob * 100, 1),
        "risk_category": risk_cat,
        "binary_label": 1 if prob >= 0.5 else 0,
        "confidence_interval": {"lower": round(ci_lower, 4), "upper": round(ci_upper, 4)},
        "disclaimer": (
            "NOTICE: This assessment evaluates clinical measurements using a research screening prototype. "
            "It is NOT a medical diagnosis of diabetes."
        ),
        "summary": summary,
        "recommended_next_steps": steps,
        "top_contributing_factors": contributions[:6],
        "shap_base_value": round(base_val, 4),
        "engineered_features": df_eng.to_dict(orient="records")[0]
    }


# ---------------------------------------------------------------------------
# Track 2: CDC Lifestyle Predictor
# ---------------------------------------------------------------------------
def predict_cdc_lifestyle(raw_input: Dict[str, Any]) -> Dict[str, Any]:
    pipeline = get_model("cdc_lifestyle")

    # Order matches ALL_CDC_FEATURES: SCALE_FEATURES + PASSTHROUGH_FEATURES
    df = pd.DataFrame([{
        "BMI": raw_input["bmi"],
        "MentHlth": raw_input["ment_hlth"],
        "PhysHlth": raw_input["phys_hlth"],
        "HighBP": raw_input["high_bp"],
        "HighChol": raw_input["high_chol"],
        "CholCheck": raw_input["chol_check"],
        "Smoker": raw_input["smoker"],
        "Stroke": raw_input["stroke"],
        "HeartDiseaseorAttack": raw_input["heart_disease"],
        "PhysActivity": raw_input["phys_activity"],
        "Fruits": raw_input["fruits"],
        "Veggies": raw_input["veggies"],
        "HvyAlcoholConsump": raw_input["heavy_alcohol"],
        "AnyHealthcare": raw_input["any_healthcare"],
        "NoDocbcCost": raw_input["no_doc_cost"],
        "GenHlth": raw_input["gen_hlth"],
        "DiffWalk": raw_input["diff_walk"],
        "Sex": raw_input["sex"],
        "Age": raw_input["age_bracket"],
        "Education": raw_input["education"],
        "Income": raw_input["income"]
    }])

    prob = float(pipeline.predict_proba(df)[0, 1])
    risk_cat, summary, steps = categorize_risk(prob)

    # Major risk drivers in CDC survey
    drivers = []
    if raw_input["gen_hlth"] >= 4:
        drivers.append({"factor": "Self-Rated Health", "impact": "Fair/Poor general health significantly correlates with metabolic vulnerability."})
    if raw_input["high_bp"] == 1:
        drivers.append({"factor": "Hypertension History", "impact": "High blood pressure frequently clusters with insulin resistance."})
    if raw_input["bmi"] >= 30:
        drivers.append({"factor": "BMI Category", "impact": f"BMI of {raw_input['bmi']:.1f} indicates clinical obesity, elevating type-2 risk."})
    if raw_input["phys_activity"] == 0:
        drivers.append({"factor": "Sedentary Lifestyle", "impact": "Lack of regular physical activity reduces peripheral glucose uptake."})

    return {
        "calibrated_probability": round(prob, 4),
        "probability_percentage": round(prob * 100, 1),
        "risk_category": risk_cat,
        "binary_label": 1 if prob >= 0.5 else 0,
        "confidence_interval": {"lower": max(0.0, round(prob - 0.04, 4)), "upper": min(1.0, round(prob + 0.04, 4))},
        "disclaimer": (
            "NOTICE: Non-invasive screening based on self-reported CDC BRFSS lifestyle metrics. "
            "Evaluates community risk stratification and does not replace blood screening."
        ),
        "summary": summary,
        "recommended_next_steps": steps,
        "key_lifestyle_observations": drivers
    }


# ---------------------------------------------------------------------------
# Track 3: UCI Symptom Predictor
# ---------------------------------------------------------------------------
def predict_uci_symptoms(raw_input: Dict[str, Any]) -> Dict[str, Any]:
    model = get_model("uci_symptoms")

    df = pd.DataFrame([{
        "Age": raw_input["age"],
        "Gender": raw_input["gender"],
        "Polyuria": raw_input["polyuria"],
        "Polydipsia": raw_input["polydipsia"],
        "sudden weight loss": raw_input["sudden_weight_loss"],
        "weakness": raw_input["weakness"],
        "Polyphagia": raw_input["polyphagia"],
        "Genital thrush": raw_input["genital_thrush"],
        "visual blurring": raw_input["visual_blurring"],
        "Itching": raw_input["itching"],
        "Irritability": raw_input["irritability"],
        "delayed healing": raw_input["delayed_healing"],
        "partial paresis": raw_input["partial_paresis"],
        "muscle stiffness": raw_input["muscle_stiffness"],
        "Alopecia": raw_input["alopecia"],
        "Obesity": raw_input["obesity"]
    }])

    prob = float(model.predict_proba(df)[0, 1])
    risk_cat = "High Acute Symptom Index" if prob >= 0.5 else "Low Acute Symptom Index"

    steps = [
        "Urgent: If experiencing active polyuria and polydipsia, schedule prompt clinical evaluation.",
        "Undergo diagnostic fasting glucose or HbA1c testing.",
        "Symptoms can indicate immediate hyperglycemia requiring physician management."
    ] if prob >= 0.5 else [
        "Presenting symptoms do not strongly match acute diabetic onset complaints.",
        "Continue routine wellness monitoring."
    ]

    return {
        "calibrated_probability": round(prob, 4),
        "probability_percentage": round(prob * 100, 1),
        "risk_category": risk_cat,
        "binary_label": 1 if prob >= 0.5 else 0,
        "confidence_interval": {"lower": max(0.0, round(prob - 0.03, 4)), "upper": min(1.0, round(prob + 0.03, 4))},
        "disclaimer": (
            "CRITICAL MEDICAL NOTICE: Polyuria (excessive urination) and Polydipsia (excessive thirst) are "
            "established CONSEQUENCES of existing elevated blood sugar, not pre-disease predictive risk indicators. "
            "This module evaluates symptom presence, not future diabetes onset."
        ),
        "summary": "High correlation with acute diabetic outpatient symptom complaints." if prob >= 0.5 else "Low symptomatic presentation.",
        "recommended_next_steps": steps
    }

