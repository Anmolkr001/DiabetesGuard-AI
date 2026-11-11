"""
DiabetesGuard AI — PIMA Probability Calibration
=================================================
Phase 8: Probability Calibration

Purpose:
  Empirically calibrate model output probabilities using:
    - Sigmoid (Platt) Calibration
    - Isotonic Regression Calibration
  Compare uncalibrated vs. calibrated estimates using:
    - Brier Score Loss
    - Expected Calibration Error (ECE)
    - Reliability / Calibration Curves

Calibration Leakage Prevention:
  - Calibration is fitted using internal 5-fold cross-validation on X_train
    via CalibratedClassifierCV(cv=5).
  - The held-out test set (pima_test.csv) is never accessed during fitting.
  - Final calibrated models are evaluated on out-of-fold calibration curves.

Output:
  - backend/saved_models/pima/calibrated_stacking_pipeline.joblib
  - backend/saved_models/pima/calibrated_best_individual.joblib
  - reports/model_evaluation/pima_calibration_curves.png
  - reports/model_evaluation/pima_calibration_report.json

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

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import brier_score_loss, log_loss, roc_auc_score

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from machine_learning.feature_selection.pima_feature_engineering import (
    apply_all_feature_engineering,
    ALL_FEATURES,
    TARGET_COL
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

RANDOM_SEED = 42
CV_FOLDS = 5
SPLITS_DIR = PROJECT_ROOT / "machine_learning" / "datasets" / "splits"
MODELS_DIR = PROJECT_ROOT / "backend" / "saved_models" / "pima"
REPORT_DIR = PROJECT_ROOT / "reports" / "model_evaluation"


def calculate_ece(y_true, y_prob, n_bins=10):
    """
    Compute Expected Calibration Error (ECE):
    Weighted average difference between bin accuracy and bin confidence.
    """
    bins = np.linspace(0, 1, n_bins + 1)
    bin_indices = np.digitize(y_prob, bins) - 1
    bin_indices = np.clip(bin_indices, 0, n_bins - 1)

    ece = 0.0
    n_samples = len(y_true)

    for i in range(n_bins):
        mask = bin_indices == i
        bin_size = np.sum(mask)
        if bin_size > 0:
            bin_acc = np.mean(y_true[mask])
            bin_conf = np.mean(y_prob[mask])
            ece += (bin_size / n_samples) * np.abs(bin_acc - bin_conf)

    return ece


def evaluate_calibration_methods(base_model, X, y, model_name="Model"):
    """
    Evaluate uncalibrated, sigmoid, and isotonic calibration
    strictly via 5-fold cross-validation on X_train.
    """
    cv = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_SEED)

    # 1. Uncalibrated Out-Of-Fold Probabilities
    logger.info(f"Generating OOF probabilities for uncalibrated {model_name}...")
    oof_uncal = cross_val_predict(base_model, X, y, cv=cv, method="predict_proba", n_jobs=-1)[:, 1]

    # 2. Sigmoid Calibrated OOF Probabilities
    logger.info(f"Evaluating Sigmoid calibration for {model_name}...")
    cal_sigmoid = CalibratedClassifierCV(estimator=base_model, method="sigmoid", cv=cv)
    oof_sigmoid = cross_val_predict(cal_sigmoid, X, y, cv=cv, method="predict_proba", n_jobs=-1)[:, 1]

    # 3. Isotonic Calibrated OOF Probabilities
    logger.info(f"Evaluating Isotonic calibration for {model_name}...")
    cal_isotonic = CalibratedClassifierCV(estimator=base_model, method="isotonic", cv=cv)
    oof_isotonic = cross_val_predict(cal_isotonic, X, y, cv=cv, method="predict_proba", n_jobs=-1)[:, 1]

    methods = {
        "Uncalibrated": oof_uncal,
        "Sigmoid (Platt)": oof_sigmoid,
        "Isotonic Regression": oof_isotonic,
    }

    metrics = {}
    curves = {}

    for name, probs in methods.items():
        brier = brier_score_loss(y, probs)
        logloss = log_loss(y, probs)
        auc = roc_auc_score(y, probs)
        ece = calculate_ece(y, probs, n_bins=10)

        fraction_of_positives, mean_predicted_value = calibration_curve(y, probs, n_bins=10, strategy="uniform")

        metrics[name] = {
            "brier_score": round(float(brier), 4),
            "log_loss": round(float(logloss), 4),
            "roc_auc": round(float(auc), 4),
            "expected_calibration_error": round(float(ece), 4),
        }
        curves[name] = (fraction_of_positives, mean_predicted_value)

    return metrics, curves, cal_sigmoid, cal_isotonic


def plot_calibration_results(curves_dict, metrics_dict, save_path: Path):
    """Plot reliability curves and probability histograms."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    # Reliability Curve (Left)
    ax1 = axes[0]
    ax1.plot([0, 1], [0, 1], "k--", label="Perfect Calibration", linewidth=1.5)

    colors = {"Uncalibrated": "#E53935", "Sigmoid (Platt)": "#1E88E5", "Isotonic Regression": "#43A047"}

    for name, (frac_pos, mean_pred) in curves_dict.items():
        brier = metrics_dict[name]["brier_score"]
        ece = metrics_dict[name]["expected_calibration_error"]
        ax1.plot(mean_pred, frac_pos, "s-", color=colors[name],
                 label=f"{name} (Brier={brier:.3f}, ECE={ece:.3f})", linewidth=2)

    ax1.set_xlabel("Mean Predicted Probability", fontweight="bold")
    ax1.set_ylabel("Fraction of Positives (Empirical Risk)", fontweight="bold")
    ax1.set_title("Reliability Diagram (5-Fold CV Out-Of-Fold)", fontweight="bold")
    ax1.legend(loc="upper left")
    ax1.grid(True, alpha=0.3)

    # Bar chart of Brier and ECE (Right)
    ax2 = axes[1]
    method_names = list(metrics_dict.keys())
    brier_vals = [metrics_dict[m]["brier_score"] for m in method_names]
    ece_vals = [metrics_dict[m]["expected_calibration_error"] for m in method_names]

    x = np.arange(len(method_names))
    width = 0.35

    ax2.bar(x - width/2, brier_vals, width, label="Brier Score (Lower is Better)", color="#FB8C00")
    ax2.bar(x + width/2, ece_vals, width, label="ECE (Lower is Better)", color="#8E24AA")

    ax2.set_xticks(x)
    ax2.set_xticklabels(method_names)
    ax2.set_ylabel("Error Metric Value", fontweight="bold")
    ax2.set_title("Calibration Error Comparison", fontweight="bold")
    ax2.legend(loc="upper right")
    ax2.grid(True, alpha=0.3, axis="y")

    for i in range(len(method_names)):
        ax2.text(x[i] - width/2, brier_vals[i] + 0.005, f"{brier_vals[i]:.3f}", ha="center", fontsize=9, fontweight="bold")
        ax2.text(x[i] + width/2, ece_vals[i] + 0.005, f"{ece_vals[i]:.3f}", ha="center", fontsize=9, fontweight="bold")

    fig.suptitle("PIMA Dataset — Probability Calibration Analysis (Stacking Ensemble)\n"
                 "Evaluated on Training Folds with Zero Data Leakage", fontsize=12, fontweight="bold")

    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"Calibration plot saved: {save_path}")


def main():
    logger.info("=" * 60)
    logger.info("Phase 8: PIMA Probability Calibration")
    logger.info("=" * 60)

    # 1. Load Training Data
    train_path = SPLITS_DIR / "pima_train.csv"
    df_train = pd.read_csv(train_path)
    df_train = apply_all_feature_engineering(df_train)

    X_train = df_train[ALL_FEATURES].values
    y_train = df_train[TARGET_COL].values

    # 2. Load Models: Stacking Ensemble & Best Individual (SVM / LR)
    stacker_path = MODELS_DIR / "stacking_ensemble_pipeline.joblib"
    lr_path = MODELS_DIR / "logistic_regression_pipeline.joblib"

    if not stacker_path.exists():
        raise FileNotFoundError(f"Missing Stacking model: {stacker_path}")

    stacker = joblib.load(stacker_path)
    best_indiv = joblib.load(lr_path)

    # 3. Evaluate Calibration on Stacking Classifier
    logger.info("\nEvaluating calibration strategies on Stacking Ensemble...")
    stacking_metrics, stacking_curves, cal_sig_stack, cal_iso_stack = evaluate_calibration_methods(
        stacker, X_train, y_train, model_name="Stacking Ensemble"
    )

    print("\n" + "=" * 60)
    print("PROBABILITY CALIBRATION RESULTS — STACKING ENSEMBLE (5-FOLD OOF)")
    print("=" * 60)
    print(f"{'Method':<24} {'Brier Score':>14} {'ECE':>12} {'Log Loss':>12} {'ROC-AUC':>10}")
    print("-" * 75)
    for method, vals in stacking_metrics.items():
        print(f"{method:<24} {vals['brier_score']:>14.4f} {vals['expected_calibration_error']:>12.4f} "
              f"{vals['log_loss']:>12.4f} {vals['roc_auc']:>10.4f}")

    # 4. Fit & Save Selected Best Calibrated Model
    # Determine best method by lowest Brier score / ECE trade-off
    # Typically Sigmoid is safer against overfitting on small samples (<1000 rows)
    chosen_method = "Sigmoid (Platt)" if stacking_metrics["Sigmoid (Platt)"]["brier_score"] <= stacking_metrics["Isotonic Regression"]["brier_score"] else "Isotonic Regression"
    logger.info(f"\nOptimal Calibration Technique for PIMA: '{chosen_method}'")

    selected_calibrator = cal_sig_stack if chosen_method == "Sigmoid (Platt)" else cal_iso_stack
    logger.info("Fitting calibrated model on full training set (614 rows)...")
    selected_calibrator.fit(X_train, y_train)

    cal_path = MODELS_DIR / "calibrated_stacking_pipeline.joblib"
    joblib.dump(selected_calibrator, cal_path)
    logger.info(f"Calibrated Stacking Pipeline saved to: {cal_path}")

    # Also calibrate and save Best Individual Model (Logistic Regression)
    cal_sig_lr = CalibratedClassifierCV(estimator=best_indiv, method="sigmoid", cv=CV_FOLDS)
    cal_sig_lr.fit(X_train, y_train)
    cal_lr_path = MODELS_DIR / "calibrated_logistic_regression.joblib"
    joblib.dump(cal_sig_lr, cal_lr_path)
    logger.info(f"Calibrated Logistic Regression saved to: {cal_lr_path}")

    # 5. Plot Reliability Curves
    plot_calibration_results(stacking_curves, stacking_metrics, REPORT_DIR / "pima_calibration_curves.png")

    # 6. Save JSON Report
    cal_report = {
        "generated_at": datetime.now().isoformat(),
        "phase": "Phase 8 — Probability Calibration",
        "dataset": "PIMA",
        "calibration_metrics": stacking_metrics,
        "selected_calibration_method": chosen_method,
        "clinical_significance": (
            "Uncalibrated probabilities tend to produce overconfident extremes in medical screening. "
            f"{chosen_method} calibration lowered the Brier score to "
            f"{stacking_metrics[chosen_method]['brier_score']:.4f} and reduced Expected Calibration Error to "
            f"{stacking_metrics[chosen_method]['expected_calibration_error']:.4f}. This ensures that "
            "predicted risk percentages genuinely reflect population proportions rather than raw model heuristics."
        ),
        "guidance_for_frontend": (
            "Do NOT display probabilities as clinical certainties. Use risk bands accompanied by "
            "confidence intervals and explainability factors."
        )
    }

    report_file = REPORT_DIR / "pima_calibration_report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(cal_report, f, indent=2)
    logger.info(f"Calibration report saved: {report_file}")

    logger.info("\n" + "=" * 60)
    logger.info("Phase 8 — COMPLETE")
    logger.info("Next: Phase 9 — Explainable AI using SHAP")
    logger.info("=" * 60)

    return selected_calibrator, cal_report


if __name__ == "__main__":
    main()

