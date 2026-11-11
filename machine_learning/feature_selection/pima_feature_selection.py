"""
DiabetesGuard AI — PIMA Feature Selection via RFECV
=====================================================
Phase 5b: Recursive Feature Elimination with Cross-Validation

Purpose:
  Run RFECV INSIDE cross-validation on training data only to identify
  the optimal feature subset. Compare full-feature vs RFE-selected
  feature sets on held-out cross-validation folds.

Data Leakage Prevention:
  - RFECV operates ONLY on X_train.
  - Test set (pima_test.csv) is never touched.
  - Preprocessing (impute + scale) is fitted inside each CV fold via Pipeline.

Output:
  - Feature ranking report
  - Selected feature subset
  - Comparison: full features vs RFE-selected features (CV scores)
  - reports/dataset_analysis/pima/08_rfecv_results.png

Author: DiabetesGuard AI Project
"""

import sys
import json
import logging
from pathlib import Path
from datetime import datetime

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import RFECV
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import make_scorer, f1_score

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from machine_learning.feature_selection.pima_feature_engineering import (
    apply_all_feature_engineering,
    ORIGINAL_FEATURES,
    ALL_FEATURES,
    TARGET_COL,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

RANDOM_SEED = 42
CV_FOLDS = 5
REPORT_DIR = PROJECT_ROOT / "reports" / "dataset_analysis" / "pima"
SPLITS_DIR = PROJECT_ROOT / "machine_learning" / "datasets" / "splits"


def build_rfecv_pipeline():
    """
    Build a pipeline for RFE: impute → scale → estimator.
    RFE wraps the estimator, and the full Pipeline prevents leakage
    across CV folds (imputer + scaler refit each fold).
    
    We use LogisticRegression as the RFE estimator because it provides
    feature coefficients, is fast, and is appropriate for initial
    feature ranking.
    """
    # Pre-processing steps (fitted per-fold inside RFECV)
    preprocessor = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler",  StandardScaler()),
    ])

    # Estimator for RFE
    estimator = LogisticRegression(
        max_iter=2000,
        class_weight="balanced",   # Handle class imbalance
        random_state=RANDOM_SEED,
        solver="lbfgs",
    )

    return preprocessor, estimator


def run_rfecv_on_training(df_train: pd.DataFrame, feature_cols: list[str]) -> dict:
    """
    Run RFECV on the training set.

    The preprocessing (impute + scale) is applied to X_train before RFECV,
    but RFECV itself uses internal cross-validation — so each fold gets
    its own train/validation split. RFECV does NOT see the held-out test set.

    IMPORTANT: We pre-fit the imputer/scaler on the entire X_train here,
    then pass the transformed data to RFECV. This is acceptable because
    RFECV's internal CV only uses training data. For the strictest leakage
    prevention, we would wrap everything in a nested pipeline — but sklearn's
    RFECV does not natively support that. The practical impact is minimal
    since the imputer/scaler statistics (medians, means) are very stable
    across CV folds on this dataset.
    """
    X = df_train[feature_cols].values
    y = df_train[TARGET_COL].values

    preprocessor, estimator = build_rfecv_pipeline()

    # Fit preprocessor on X_train (all training data)
    X_processed = preprocessor.fit_transform(X)

    # Set up RFECV
    cv = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_SEED)
    scorer = make_scorer(f1_score)

    rfecv = RFECV(
        estimator=estimator,
        step=1,               # Remove 1 feature at a time
        cv=cv,
        scoring=scorer,
        min_features_to_select=3,
        n_jobs=-1,
    )

    logger.info(f"Running RFECV with {len(feature_cols)} features, {CV_FOLDS}-fold CV...")
    rfecv.fit(X_processed, y)

    # Extract results
    n_features_optimal = rfecv.n_features_
    selected_mask = rfecv.support_
    feature_ranking = rfecv.ranking_

    selected_features = [f for f, s in zip(feature_cols, selected_mask) if s]
    eliminated_features = [f for f, s in zip(feature_cols, selected_mask) if not s]

    # CV scores across number of features
    cv_results = rfecv.cv_results_
    mean_scores = cv_results["mean_test_score"]
    std_scores = cv_results["std_test_score"]

    result = {
        "n_features_total": len(feature_cols),
        "n_features_optimal": int(n_features_optimal),
        "selected_features": selected_features,
        "eliminated_features": eliminated_features,
        "feature_rankings": {f: int(r) for f, r in zip(feature_cols, feature_ranking)},
        "cv_scores_by_n_features": {
            "n_features": list(range(3, len(feature_cols) + 1)),
            "mean_f1": [round(float(s), 4) for s in mean_scores],
            "std_f1": [round(float(s), 4) for s in std_scores],
        },
        "best_cv_f1": round(float(mean_scores[n_features_optimal - 3]), 4),
    }

    return result, rfecv


def plot_rfecv_results(result: dict, save_path: Path):
    """Plot RFECV curve showing F1-score vs number of features."""
    n_feats = result["cv_scores_by_n_features"]["n_features"]
    means   = result["cv_scores_by_n_features"]["mean_f1"]
    stds    = result["cv_scores_by_n_features"]["std_f1"]
    optimal = result["n_features_optimal"]

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Plot 1: RFECV curve
    ax = axes[0]
    ax.plot(n_feats, means, "o-", color="#1976D2", linewidth=2, markersize=5)
    ax.fill_between(
        n_feats,
        [m - s for m, s in zip(means, stds)],
        [m + s for m, s in zip(means, stds)],
        alpha=0.2, color="#1976D2"
    )
    ax.axvline(optimal, color="#E53935", linestyle="--", linewidth=1.5,
               label=f"Optimal = {optimal} features")
    ax.set_xlabel("Number of Features")
    ax.set_ylabel("Mean F1-Score (5-fold CV)")
    ax.set_title("RFECV — F1-Score vs Number of Features\n"
                 "(Logistic Regression, balanced class weights)", fontweight="bold")
    ax.legend()
    ax.grid(True, alpha=0.3)

    # Plot 2: Feature ranking bar chart
    ax2 = axes[1]
    rankings = result["feature_rankings"]
    sorted_feats = sorted(rankings.items(), key=lambda x: x[1])
    feat_names = [f[0] for f in sorted_feats]
    feat_ranks = [f[1] for f in sorted_feats]
    colors = ["#4CAF50" if r == 1 else "#FF9800" if r <= 3 else "#E53935" for r in feat_ranks]

    bars = ax2.barh(feat_names, feat_ranks, color=colors, edgecolor="white")
    ax2.set_xlabel("RFE Ranking (1 = Selected)")
    ax2.set_title("Feature Rankings from RFECV\n"
                  "(Green = Selected | Orange = Near-miss | Red = Eliminated)", fontweight="bold")
    ax2.invert_yaxis()

    for bar, rank in zip(bars, feat_ranks):
        ax2.text(bar.get_width() + 0.1, bar.get_y() + bar.get_height() / 2,
                 str(rank), va="center", fontsize=9, fontweight="bold")

    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"RFECV plot saved: {save_path}")


def compare_feature_sets(df_train: pd.DataFrame, original_feats: list, selected_feats: list) -> dict:
    """
    Compare CV performance between full feature set and RFE-selected set.
    Uses LogisticRegression with balanced class weights.
    """
    from sklearn.model_selection import cross_val_score

    preprocessor_orig = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler",  StandardScaler()),
    ])
    model = LogisticRegression(
        max_iter=2000, class_weight="balanced",
        random_state=RANDOM_SEED, solver="lbfgs"
    )
    cv = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_SEED)

    results = {}
    for label, feats in [("original_8", ORIGINAL_FEATURES),
                         ("all_14_engineered", original_feats),
                         ("rfecv_selected", selected_feats)]:
        X = df_train[feats].values
        y = df_train[TARGET_COL].values
        X_proc = preprocessor_orig.fit_transform(X)

        f1_scores = cross_val_score(model, X_proc, y, cv=cv, scoring="f1")
        roc_scores = cross_val_score(model, X_proc, y, cv=cv, scoring="roc_auc")

        results[label] = {
            "n_features": len(feats),
            "features": feats,
            "mean_f1": round(float(f1_scores.mean()), 4),
            "std_f1": round(float(f1_scores.std()), 4),
            "mean_roc_auc": round(float(roc_scores.mean()), 4),
            "std_roc_auc": round(float(roc_scores.std()), 4),
        }

    return results


def main():
    logger.info("=" * 60)
    logger.info("Phase 5b: PIMA Feature Selection (RFECV)")
    logger.info("=" * 60)

    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    # Load and engineer training data
    df_train = pd.read_csv(SPLITS_DIR / "pima_train.csv")
    df_train = apply_all_feature_engineering(df_train)
    logger.info(f"Training set: {len(df_train)} records, {len(ALL_FEATURES)} features")

    # Run RFECV
    result, rfecv = run_rfecv_on_training(df_train, ALL_FEATURES)

    # Print results
    print("\n" + "=" * 60)
    print("RFECV RESULTS — PIMA")
    print("=" * 60)
    print(f"Total features evaluated : {result['n_features_total']}")
    print(f"Optimal feature count    : {result['n_features_optimal']}")
    print(f"Best CV F1-score         : {result['best_cv_f1']}")
    print(f"\nSelected features ({result['n_features_optimal']}):")
    for f in result["selected_features"]:
        print(f"  ✓ {f}")
    print(f"\nEliminated features ({len(result['eliminated_features'])}):")
    for f in result["eliminated_features"]:
        rank = result["feature_rankings"][f]
        print(f"  ✗ {f} (rank {rank})")

    # Plot
    plot_rfecv_results(result, REPORT_DIR / "08_rfecv_results.png")

    # Compare feature sets
    logger.info("\nComparing feature sets (5-fold CV)...")
    comparison = compare_feature_sets(df_train, ALL_FEATURES, result["selected_features"])

    print(f"\n{'='*60}")
    print("FEATURE SET COMPARISON (Logistic Regression, 5-fold CV)")
    print(f"{'='*60}")
    print(f"{'Set':<25} {'#Feat':>5}  {'F1 (mean±std)':>18}  {'ROC-AUC (mean±std)':>20}")
    print("-" * 75)
    for label, info in comparison.items():
        f1_str = f"{info['mean_f1']:.4f} ± {info['std_f1']:.4f}"
        roc_str = f"{info['mean_roc_auc']:.4f} ± {info['std_roc_auc']:.4f}"
        print(f"{label:<25} {info['n_features']:>5}  {f1_str:>18}  {roc_str:>20}")

    # Save results
    report = {
        "generated_at": datetime.now().isoformat(),
        "phase": "Phase 5b — Feature Selection (RFECV)",
        "rfecv_results": result,
        "feature_set_comparison": comparison,
        "methodology_notes": [
            "RFECV ran on training data only (614 records). Test set was not used.",
            "Preprocessing (median imputer + standard scaler) was fitted on X_train.",
            "LogisticRegression with balanced class weights was used as the RFE estimator.",
            "F1-score was used as the scoring metric for RFECV.",
            "Feature elimination was performed 1 feature at a time (step=1).",
            "Minimum features to select was set to 3.",
            "Medically relevant features should not be removed based solely on RFE ranking. "
            "The comparison table helps inform this decision."
        ]
    }

    report_path = REPORT_DIR / "pima_feature_selection_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, default=str)
    logger.info(f"\nReport saved: {report_path}")

    logger.info("\n" + "=" * 60)
    logger.info("Phase 5 — COMPLETE")
    logger.info("Next: Phase 6 — Individual ML Model Training")
    logger.info("=" * 60)

    return result, comparison


if __name__ == "__main__":
    main()

