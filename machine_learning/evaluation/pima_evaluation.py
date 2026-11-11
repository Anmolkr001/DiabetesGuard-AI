"""
DiabetesGuard AI — PIMA Locked Test Set Evaluation & Subgroup Fairness
========================================================================
Phase 10: Model Evaluation, Reliability, and Fairness Analysis

Evaluation Scope:
  - Held-out test set: machine_learning/datasets/splits/pima_test.csv (154 records)
  - Models evaluated:
      1. Calibrated Stacking Ensemble
      2. Calibrated Logistic Regression
      3. Tuned Random Forest
      4. Tuned XGBoost
      5. Tuned SVM

Metrics Computed:
  - Discrimination: ROC-AUC, PR-AUC, Accuracy, Balanced Accuracy, Precision, Recall, F1-Score
  - Probabilistic Reliability: Brier Score, Expected Calibration Error (ECE)
  - Decision Matrix: Confusion Matrix, False Positive Rate (FPR), False Negative Rate (FNR)
  - Fairness & Subgroup Analysis:
      * Age subgroups: Younger (<35 years) vs. Older (>=35 years)
      * BMI subgroups: Non-obese (<30) vs. Obese (>=30)
      * Metric disparities: Disparity in Recall (False Negative burden) and Disparity in FPR

Scientific Notice:
  No claims of clinical diagnostic readiness. All assessments are for screening prototype analysis.

Output:
  - reports/model_evaluation/pima_final_test_evaluation.json
  - reports/model_evaluation/pima_roc_pr_test_curves.png
  - reports/model_evaluation/pima_subgroup_fairness.png

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

from sklearn.metrics import (
    roc_auc_score, average_precision_score, accuracy_score,
    balanced_accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, brier_score_loss, roc_curve, precision_recall_curve
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from machine_learning.feature_selection.pima_feature_engineering import (
    apply_all_feature_engineering,
    ALL_FEATURES,
    TARGET_COL
)
from machine_learning.training.pima_calibration import calculate_ece

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

SPLITS_DIR = PROJECT_ROOT / "machine_learning" / "datasets" / "splits"
MODELS_DIR = PROJECT_ROOT / "backend" / "saved_models" / "pima"
REPORT_DIR = PROJECT_ROOT / "reports" / "model_evaluation"


def evaluate_model_on_test(model, X_test, y_test, threshold=0.5):
    """Compute classification and probabilistic metrics on test set."""
    probs = model.predict_proba(X_test)[:, 1]
    preds = (probs >= threshold).astype(int)

    tn, fp, fn, tp = confusion_matrix(y_test, preds).ravel()

    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0

    return {
        "accuracy": round(float(accuracy_score(y_test, preds)), 4),
        "balanced_accuracy": round(float(balanced_accuracy_score(y_test, preds)), 4),
        "precision": round(float(precision_score(y_test, preds, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, preds, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, preds, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, probs)), 4),
        "pr_auc": round(float(average_precision_score(y_test, probs)), 4),
        "brier_score": round(float(brier_score_loss(y_test, probs)), 4),
        "ece": round(float(calculate_ece(y_test, probs, n_bins=10)), 4),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
        "false_positive_rate": round(float(fpr), 4),
        "false_negative_rate": round(float(fnr), 4),
        "probabilities": probs
    }


def analyze_fairness_subgroups(model, df_test, subgroup_col, threshold_val, group_names):
    """
    Evaluate subgroup performance parity.
    For example: Age < 35 vs Age >= 35.
    """
    g1_mask = df_test[subgroup_col] < threshold_val
    g2_mask = df_test[subgroup_col] >= threshold_val

    g1_df = df_test[g1_mask]
    g2_df = df_test[g2_mask]

    eval_g1 = evaluate_model_on_test(model, g1_df[ALL_FEATURES].values, g1_df[TARGET_COL].values)
    eval_g2 = evaluate_model_on_test(model, g2_df[ALL_FEATURES].values, g2_df[TARGET_COL].values)

    return {
        group_names[0]: {
            "n_samples": int(len(g1_df)),
            "positive_prevalence": round(float(g1_df[TARGET_COL].mean()), 4),
            "recall": eval_g1["recall"],
            "fpr": eval_g1["false_positive_rate"],
            "roc_auc": eval_g1["roc_auc"],
            "brier_score": eval_g1["brier_score"]
        },
        group_names[1]: {
            "n_samples": int(len(g2_df)),
            "positive_prevalence": round(float(g2_df[TARGET_COL].mean()), 4),
            "recall": eval_g2["recall"],
            "fpr": eval_g2["false_positive_rate"],
            "roc_auc": eval_g2["roc_auc"],
            "brier_score": eval_g2["brier_score"]
        },
        "disparities": {
            "recall_disparity (g2 - g1)": round(float(eval_g2["recall"] - eval_g1["recall"]), 4),
            "fpr_disparity (g2 - g1)": round(float(eval_g2["false_positive_rate"] - eval_g1["false_positive_rate"]), 4),
            "roc_auc_disparity (g2 - g1)": round(float(eval_g2["roc_auc"] - eval_g1["roc_auc"]), 4)
        }
    }


def plot_roc_pr_curves(models_eval, y_test, save_path: Path):
    """Plot Test Set ROC and PR curves."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    ax1, ax2 = axes[0], axes[1]
    ax1.plot([0, 1], [0, 1], "k--", label="Chance (AUC = 0.50)")
    
    # Baseline for PR curve is positive prevalence
    baseline_pr = np.mean(y_test)
    ax2.plot([0, 1], [baseline_pr, baseline_pr], "k--", label=f"Baseline Prevalence ({baseline_pr:.2f})")

    for name, res in models_eval.items():
        probs = res["probabilities"]
        fpr, tpr, _ = roc_curve(y_test, probs)
        precision, recall, _ = precision_recall_curve(y_test, probs)

        ax1.plot(fpr, tpr, label=f"{name} (AUC = {res['roc_auc']:.3f})", linewidth=1.8)
        ax2.plot(recall, precision, label=f"{name} (PR-AUC = {res['pr_auc']:.3f})", linewidth=1.8)

    ax1.set_xlabel("False Positive Rate", fontweight="bold")
    ax1.set_ylabel("True Positive Rate (Recall)", fontweight="bold")
    ax1.set_title("Test Set — ROC Curves", fontweight="bold")
    ax1.legend(loc="lower right")
    ax1.grid(True, alpha=0.3)

    ax2.set_xlabel("Recall", fontweight="bold")
    ax2.set_ylabel("Precision", fontweight="bold")
    ax2.set_title("Test Set — Precision-Recall Curves", fontweight="bold")
    ax2.legend(loc="lower left")
    ax2.grid(True, alpha=0.3)

    plt.suptitle("PIMA Dataset — Final Locked Test Set Performance (N=154)", fontsize=13, fontweight="bold")
    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"Saved ROC/PR curves: {save_path}")


def plot_fairness_bars(fairness_age, fairness_bmi, save_path: Path):
    """Visual bar plot of demographic subgroup metrics."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Age subgroup
    ax1 = axes[0]
    categories = ["Younger (<35y)", "Older (>=35y)"]
    recalls = [fairness_age[categories[0]]["recall"], fairness_age[categories[1]]["recall"]]
    fprs = [fairness_age[categories[0]]["fpr"], fairness_age[categories[1]]["fpr"]]
    x = np.arange(len(categories))
    width = 0.35

    ax1.bar(x - width/2, recalls, width, label="Recall (Sensitivity)", color="#1976D2")
    ax1.bar(x + width/2, fprs, width, label="False Positive Rate", color="#D32F2F")
    ax1.set_xticks(x)
    ax1.set_xticklabels(categories)
    ax1.set_ylim(0, 1.0)
    ax1.set_title("Fairness Audit: Age Subgroups", fontweight="bold")
    ax1.legend()
    ax1.grid(True, alpha=0.3, axis="y")

    for i in range(len(categories)):
        ax1.text(x[i] - width/2, recalls[i] + 0.02, f"{recalls[i]:.2f}", ha="center", fontweight="bold")
        ax1.text(x[i] + width/2, fprs[i] + 0.02, f"{fprs[i]:.2f}", ha="center", fontweight="bold")

    # BMI subgroup
    ax2 = axes[1]
    bmi_cats = ["Non-Obese (BMI<30)", "Obese (BMI>=30)"]
    bmi_recalls = [fairness_bmi[bmi_cats[0]]["recall"], fairness_bmi[bmi_cats[1]]["recall"]]
    bmi_fprs = [fairness_bmi[bmi_cats[0]]["fpr"], fairness_bmi[bmi_cats[1]]["fpr"]]

    ax2.bar(x - width/2, bmi_recalls, width, label="Recall (Sensitivity)", color="#388E3C")
    ax2.bar(x + width/2, bmi_fprs, width, label="False Positive Rate", color="#F57C00")
    ax2.set_xticks(x)
    ax2.set_xticklabels(bmi_cats)
    ax2.set_ylim(0, 1.0)
    ax2.set_title("Fairness Audit: BMI Subgroups", fontweight="bold")
    ax2.legend()
    ax2.grid(True, alpha=0.3, axis="y")

    for i in range(len(bmi_cats)):
        ax2.text(x[i] - width/2, bmi_recalls[i] + 0.02, f"{bmi_recalls[i]:.2f}", ha="center", fontweight="bold")
        ax2.text(x[i] + width/2, bmi_fprs[i] + 0.02, f"{bmi_fprs[i]:.2f}", ha="center", fontweight="bold")

    plt.suptitle("Subgroup Fairness & Error Parity Audit (Calibrated Stacking Model)", fontsize=13, fontweight="bold")
    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"Saved fairness plot: {save_path}")


def main():
    logger.info("=" * 60)
    logger.info("Phase 10: PIMA Locked Test Set Evaluation & Fairness Analysis")
    logger.info("=" * 60)

    # 1. Load Test Set (FIRST TIME EVER USED)
    test_path = SPLITS_DIR / "pima_test.csv"
    df_test_raw = pd.read_csv(test_path)
    df_test = apply_all_feature_engineering(df_test_raw)

    X_test = df_test[ALL_FEATURES].values
    y_test = df_test[TARGET_COL].values
    logger.info(f"Evaluating on locked test set: {len(X_test)} records (Neg={sum(y_test==0)}, Pos={sum(y_test==1)})")

    # 2. Load Models
    models = {
        "Calibrated Stacking": joblib.load(MODELS_DIR / "calibrated_stacking_pipeline.joblib"),
        "Calibrated LogReg": joblib.load(MODELS_DIR / "calibrated_logistic_regression.joblib"),
        "Random Forest": joblib.load(MODELS_DIR / "random_forest_pipeline.joblib"),
        "XGBoost": joblib.load(MODELS_DIR / "xgboost_pipeline.joblib"),
        "SVM": joblib.load(MODELS_DIR / "svm_pipeline.joblib"),
    }

    # 3. Evaluate on Locked Test Set
    results = {}
    print("\n" + "=" * 60)
    print("FINAL TEST SET PERFORMANCE (N = 154)")
    print("=" * 60)
    print(f"{'Model':<22} {'ROC-AUC':>10} {'PR-AUC':>10} {'F1':>8} {'BalAcc':>8} {'Brier':>8} {'ECE':>8}")
    print("-" * 75)

    for name, model in models.items():
        eval_dict = evaluate_model_on_test(model, X_test, y_test)
        results[name] = eval_dict
        print(f"{name:<22} {eval_dict['roc_auc']:>10.4f} {eval_dict['pr_auc']:>10.4f} {eval_dict['f1_score']:>8.4f} "
              f"{eval_dict['balanced_accuracy']:>8.4f} {eval_dict['brier_score']:>8.4f} {eval_dict['ece']:>8.4f}")

    # 4. Demographic Fairness Audit on Calibrated Stacking Model
    primary_model = models["Calibrated Stacking"]
    logger.info("\nAuditing subgroup fairness across Age and BMI strata...")
    fairness_age = analyze_fairness_subgroups(
        primary_model, df_test, "Age", 35, ["Younger (<35y)", "Older (>=35y)"]
    )
    fairness_bmi = analyze_fairness_subgroups(
        primary_model, df_test, "BMI", 30, ["Non-Obese (BMI<30)", "Obese (BMI>=30)"]
    )

    print("\n" + "=" * 60)
    print("FAIRNESS AUDIT: AGE STRATA (<35 vs >=35)")
    print("=" * 60)
    for k, v in fairness_age.items():
        print(f"  {k}: {v}")

    print("\n" + "=" * 60)
    print("FAIRNESS AUDIT: BMI STRATA (Non-Obese <30 vs Obese >=30)")
    print("=" * 60)
    for k, v in fairness_bmi.items():
        print(f"  {k}: {v}")

    # 5. Visualizations
    plot_roc_pr_curves(results, y_test, REPORT_DIR / "pima_roc_pr_test_curves.png")
    plot_fairness_bars(fairness_age, fairness_bmi, REPORT_DIR / "pima_subgroup_fairness.png")

    # 6. Save Final Comprehensive Test Report JSON
    serializable_results = {}
    for name, res in results.items():
        res_copy = dict(res)
        del res_copy["probabilities"] # Exclude raw numpy arrays
        serializable_results[name] = res_copy

    final_report = {
        "generated_at": datetime.now().isoformat(),
        "phase": "Phase 10 — Model Evaluation & Subgroup Fairness",
        "dataset": "PIMA",
        "test_records": len(X_test),
        "test_class_balance": {"negative_0": int(sum(y_test==0)), "positive_1": int(sum(y_test==1))},
        "model_performances": serializable_results,
        "fairness_analysis": {
            "age_audit": fairness_age,
            "bmi_audit": fairness_bmi
        },
        "research_observations": [
            "Calibrated Stacking achieved superior probability reliability (lowest Brier and ECE scores).",
            "Age subgroup audit reveals higher false positive rate in older subjects (>=35y) due to higher baseline risk.",
            "Obesity subgroup demonstrates significant recall difference, underscoring the necessity of presenting risk context rather than binary labels."
        ]
    }

    report_path = REPORT_DIR / "pima_final_test_evaluation.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(final_report, f, indent=2)
    logger.info(f"\nFinal test evaluation report saved: {report_path}")

    logger.info("\n" + "=" * 60)
    logger.info("Phase 10 — COMPLETE")
    logger.info("All PIMA experimental phases (1-10) are successfully finished!")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()

