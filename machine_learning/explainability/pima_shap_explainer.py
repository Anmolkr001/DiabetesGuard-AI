"""
DiabetesGuard AI — PIMA Explainable AI with SHAP
==================================================
Phase 9: Explainable AI (SHAP)

Global Explainability:
  - Feature Importance (mean |SHAP| values)
  - SHAP Summary (Beeswarm) Plot
  - SHAP Bar Plot

Local Explainability:
  - Individual prediction waterfall / force explanation logic
  - Deconstruction into positive (risk-increasing) and negative (risk-reducing) forces
  - Frontend-compatible JSON formatting for local explanations

Scientific and Communication Integrity:
  - Explains STATISTICAL feature contributions toward the model score.
  - Does NOT claim causal medical etiology.
  - Explanations are calculated on the preprocessed feature representation
    and mapped back to original human-interpretable feature names.

Output:
  - reports/model_evaluation/pima_shap_summary.png
  - reports/model_evaluation/pima_shap_bar.png
  - reports/model_evaluation/pima_shap_waterfall_example.png
  - reports/model_evaluation/pima_global_shap_importance.json
  - backend/saved_models/pima/pima_explainer.joblib

Author: DiabetesGuard AI Project
"""

import sys
import json
import logging
from pathlib import Path
from datetime import datetime

import pandas as pd
import numpy as np
import joblib
import shap

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from machine_learning.feature_selection.pima_feature_engineering import (
    apply_all_feature_engineering,
    ALL_FEATURES,
    TARGET_COL
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

SPLITS_DIR = PROJECT_ROOT / "machine_learning" / "datasets" / "splits"
MODELS_DIR = PROJECT_ROOT / "backend" / "saved_models" / "pima"
REPORT_DIR = PROJECT_ROOT / "reports" / "model_evaluation"


def generate_shap_analysis():
    logger.info("=" * 60)
    logger.info("Phase 9: PIMA Explainable AI (SHAP)")
    logger.info("=" * 60)

    # 1. Load Data
    train_path = SPLITS_DIR / "pima_train.csv"
    df_train = pd.read_csv(train_path)
    df_train = apply_all_feature_engineering(df_train)

    X_train = df_train[ALL_FEATURES]
    y_train = df_train[TARGET_COL]

    # 2. Load Model Pipeline
    # Using the tuned XGBoost model from the ensemble for high-fidelity TreeExplainer
    xgb_pipeline_path = MODELS_DIR / "xgboost_pipeline.joblib"
    if not xgb_pipeline_path.exists():
        raise FileNotFoundError(f"Missing XGBoost model at {xgb_pipeline_path}")

    xgb_pipeline = joblib.load(xgb_pipeline_path)
    preprocessor = xgb_pipeline.named_steps["imputer"] # SimpleImputer
    scaler = xgb_pipeline.named_steps["scaler"]       # StandardScaler
    xgb_model = xgb_pipeline.named_steps["classifier"] # XGBClassifier

    # Transform X_train to match model input representation
    logger.info("Transforming X_train through imputer and scaler for SHAP analysis...")
    X_imputed = preprocessor.transform(X_train)
    X_scaled = scaler.transform(X_imputed)
    X_scaled_df = pd.DataFrame(X_scaled, columns=ALL_FEATURES)

    # 3. Create SHAP TreeExplainer
    logger.info("Initializing SHAP TreeExplainer...")
    explainer = shap.TreeExplainer(xgb_model)
    shap_values = explainer(X_scaled_df)

    # 4. Global Explainability Visualizations
    logger.info("Generating Global SHAP visualizations...")

    # A. Summary Plot (Beeswarm)
    fig, ax = plt.subplots(figsize=(10, 7))
    shap.summary_plot(shap_values, X_scaled_df, show=False)
    plt.title("PIMA Dataset — Global SHAP Summary (Feature Impact Distribution)\n"
              "Higher SHAP values indicate positive push toward diabetes status", fontsize=11, fontweight="bold")
    plt.tight_layout()
    summary_path = REPORT_DIR / "pima_shap_summary.png"
    plt.savefig(summary_path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"Saved: {summary_path}")

    # B. Feature Importance Bar Plot (Mean |SHAP|)
    fig, ax = plt.subplots(figsize=(10, 6))
    shap.plots.bar(shap_values, max_display=14, show=False)
    plt.title("PIMA Dataset — Global SHAP Mean Feature Importance (|SHAP value|)", fontsize=11, fontweight="bold")
    plt.tight_layout()
    bar_path = REPORT_DIR / "pima_shap_bar.png"
    plt.savefig(bar_path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"Saved: {bar_path}")

    # C. Local Prediction Example (Waterfall Plot)
    fig, ax = plt.subplots(figsize=(9, 6))
    shap.plots.waterfall(shap_values[0], max_display=10, show=False)
    plt.title("PIMA Sample Local Explanation — Waterfall Representation", fontsize=11, fontweight="bold")
    plt.tight_layout()
    waterfall_path = REPORT_DIR / "pima_shap_waterfall_example.png"
    plt.savefig(waterfall_path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"Saved: {waterfall_path}")

    # 5. Extract Feature Importance Rankings
    mean_abs_shap = np.abs(shap_values.values).mean(axis=0)
    importance_df = pd.DataFrame({
        "feature": ALL_FEATURES,
        "mean_abs_shap": mean_abs_shap
    }).sort_values(by="mean_abs_shap", ascending=False)

    print("\n" + "=" * 60)
    print("GLOBAL SHAP FEATURE IMPORTANCE RANKINGS")
    print("=" * 60)
    for idx, row in importance_df.iterrows():
        print(f"  {row['feature']:<25}: {row['mean_abs_shap']:.4f}")

    # 6. Save Explainer and Metadata for Backend Inference
    explainer_bundle = {
        "explainer": explainer,
        "feature_names": ALL_FEATURES,
        "reference_medians": dict(zip(ALL_FEATURES, [float(v) for v in preprocessor.statistics_])),
        "task_note": (
            "SHAP values compute statistical attribution to model output score. "
            "They do not signify clinical etiology."
        )
    }

    bundle_path = MODELS_DIR / "pima_explainer.joblib"
    joblib.dump(explainer_bundle, bundle_path)
    logger.info(f"Saved Explainer Bundle: {bundle_path}")

    # 7. Save JSON Summary Report
    json_report = {
        "generated_at": datetime.now().isoformat(),
        "phase": "Phase 9 — Explainable AI using SHAP",
        "dataset": "PIMA",
        "global_importance_rankings": importance_df.to_dict(orient="records"),
        "top_features": importance_df["feature"].head(5).tolist(),
        "interpretability_guidelines": {
            "caution": "SHAP feature importances reflect statistical predictive power in this model.",
            "non_causal": "High SHAP value does NOT prove that changing this variable cures or causes diabetes.",
            "patient_communication": "Frame features as risk markers and health indicators rather than absolute diagnoses."
        }
    }

    report_path = REPORT_DIR / "pima_global_shap_importance.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(json_report, f, indent=2)
    logger.info(f"Saved JSON report: {report_path}")

    logger.info("\n" + "=" * 60)
    logger.info("Phase 9 — COMPLETE")
    logger.info("Next: Phase 10 — Comprehensive Model Evaluation & Fairness on Locked Test Set")
    logger.info("=" * 60)


if __name__ == "__main__":
    generate_shap_analysis()

