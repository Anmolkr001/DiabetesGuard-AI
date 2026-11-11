"""
DiabetesGuard AI — UCI Early Stage Diabetes Dataset Loader & Modeling
=======================================================================
Track 3: Symptom-Based Diabetes Classification (Independent Track)

CRITICAL RESEARCH & ETHICAL NOTICES:
  1. SYMPTOM REVERSE CAUSALITY / CONSEQUENCE:
     Symptoms such as excessive thirst (Polydipsia), frequent urination (Polyuria),
     and Sudden Weight Loss are direct physiological consequences of existing
     hyperglycemia, NOT pre-disease predictive risk indicators.
  2. NOT A FUTURE-RISK PREDICTION MODEL:
     This model must strictly be characterized as an acute SYMPTOM-BASED STATUS
     CLASSIFIER, and never conflated with future-risk or early lifestyle risk models.
  3. POPULATION BIAS:
     Collected from hospital outpatients at Sylhet Diabetes Hospital, Bangladesh (N=520).
     Exhibits high baseline positive prevalence (~61.5%).

Pipeline Implementation:
  - Download / Load raw dataset.
  - Deterministic binary mapping of symptoms ('Yes'/'No', 'Positive'/'Negative', 'Male'/'Female').
  - Stratified 80/20 train/test split.
  - Train Logistic Regression, Random Forest, and XGBoost with 5-fold CV.
  - Fit probability calibration.
  - Evaluate on held-out test split (N=104).
  - Serialize to backend/saved_models/uci/

Author: DiabetesGuard AI Project
"""

import sys
import json
import logging
import urllib.request
from pathlib import Path
from datetime import datetime

import pandas as pd
import numpy as np
import joblib

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    roc_auc_score, average_precision_score, accuracy_score,
    balanced_accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, brier_score_loss, classification_report
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from machine_learning.datasets.dataset_registry import TASK_DISTINCTION_NOTE
from machine_learning.training.pima_calibration import calculate_ece

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

RANDOM_SEED = 42
TEST_SIZE = 0.20
TARGET_COL = "class"

RAW_DIR = PROJECT_ROOT / "machine_learning" / "datasets" / "raw"
CLEANED_DIR = PROJECT_ROOT / "machine_learning" / "datasets" / "deterministic_cleaned"
SPLITS_DIR = PROJECT_ROOT / "machine_learning" / "datasets" / "splits"
MODELS_DIR = PROJECT_ROOT / "backend" / "saved_models" / "uci"
REPORT_DIR = PROJECT_ROOT / "reports" / "dataset_analysis" / "uci"

RAW_FILE = RAW_DIR / "uci_early_diabetes.csv"
CLEANED_FILE = CLEANED_DIR / "uci_early_cleaned.csv"

# UCI Early Stage Diabetes Dataset direct mirror
UCI_URL = "https://raw.githubusercontent.com/nadaalay/Early_Stage_Diabetes_Prediction/master/diabetes_data_upload.csv"
UCI_URL_ALT = "https://raw.githubusercontent.com/Sonalikhasyap15/Diabetes_Prediction/master/diabetes_data_upload.csv"


def download_uci():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    if RAW_FILE.exists() and RAW_FILE.stat().st_size > 1000:
        logger.info(f"UCI dataset already exists at: {RAW_FILE}")
        return True
    logger.info("Downloading UCI Early Stage Diabetes dataset...")
    try:
        urllib.request.urlretrieve(UCI_URL, RAW_FILE)
        logger.info("UCI dataset downloaded successfully from primary source.")
        return True
    except Exception as e:
        logger.warning(f"Primary download failed: {e}. Trying alternative...")
        try:
            urllib.request.urlretrieve(UCI_URL_ALT, RAW_FILE)
            logger.info("UCI dataset downloaded successfully from alternative source.")
            return True
        except Exception as e2:
            logger.error(f"Download failed: {e2}")
            return False


def run_uci_pipeline():
    logger.info("=" * 60)
    logger.info("DiabetesGuard AI — UCI Symptom-Based Classification Pipeline")
    logger.info("=" * 60)

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    CLEANED_DIR.mkdir(parents=True, exist_ok=True)
    SPLITS_DIR.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    if not download_uci() or not RAW_FILE.exists():
        logger.error("Could not obtain UCI dataset.")
        sys.exit(1)

    df_raw = pd.read_csv(RAW_FILE)
    logger.info(f"Raw UCI dataset shape: {df_raw.shape}")

    # Binary deterministic mapping
    df = df_raw.copy()
    binary_cols = [c for c in df.columns if c not in ["Age", "Gender", "class"]]

    mapping = {"Yes": 1, "No": 0}
    for col in binary_cols:
        df[col] = df[col].map(mapping).astype(int)

    df["Gender"] = df["Gender"].map({"Male": 1, "Female": 0}).astype(int)
    df["class"] = df["class"].map({"Positive": 1, "Negative": 0}).astype(int)

    # Save cleaned
    df.to_csv(CLEANED_FILE, index=False)
    logger.info(f"Saved deterministically cleaned UCI data: {CLEANED_FILE}")

    # Explore class balance
    counts = df["class"].value_counts().to_dict()
    logger.info(f"Class Balance: Positive (1)={counts[1]} (61.5%), Negative (0)={counts[0]} (38.5%)")

    # Stratified 80/20 train/test split
    X = df.drop(columns=["class"])
    y = df["class"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_SEED, stratify=y
    )

    df_train = X_train.copy()
    df_train["class"] = y_train
    df_test = X_test.copy()
    df_test["class"] = y_test

    df_train.to_csv(SPLITS_DIR / "uci_train.csv", index=False)
    df_test.to_csv(SPLITS_DIR / "uci_test.csv", index=False)
    logger.info(f"Saved splits: Train={len(df_train)}, Test={len(df_test)}")

    # Models: Logistic Regression, Random Forest, XGBoost
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=RANDOM_SEED),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=RANDOM_SEED),
        "XGBoost": XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.05, eval_metric="logloss", random_state=RANDOM_SEED)
    }

    eval_results = {}
    print("\n" + "=" * 60)
    print("UCI SYMPTOM MODELS — LOCKED TEST SET EVALUATION (N = 104)")
    print("=" * 60)
    print(f"{'Model':<22} {'ROC-AUC':>10} {'PR-AUC':>10} {'F1':>8} {'Recall':>8} {'Precision':>10}")
    print("-" * 75)

    for name, clf in models.items():
        # Calibrate with 5-fold CV on X_train
        calibrator = CalibratedClassifierCV(estimator=clf, method="sigmoid", cv=5)
        calibrator.fit(X_train, y_train)

        probs = calibrator.predict_proba(X_test)[:, 1]
        preds = (probs >= 0.5).astype(int)

        roc = roc_auc_score(y_test, probs)
        pr = average_precision_score(y_test, probs)
        f1 = f1_score(y_test, preds)
        rec = recall_score(y_test, preds)
        prec = precision_score(y_test, preds)
        brier = brier_score_loss(y_test, probs)
        ece = calculate_ece(y_test, probs, n_bins=10)

        eval_results[name] = {
            "roc_auc": round(float(roc), 4),
            "pr_auc": round(float(pr), 4),
            "f1_score": round(float(f1), 4),
            "recall": round(float(rec), 4),
            "precision": round(float(prec), 4),
            "brier_score": round(float(brier), 4),
            "ece": round(float(ece), 4)
        }
        print(f"{name:<22} {roc:>10.4f} {pr:>10.4f} {f1:>8.4f} {rec:>8.4f} {prec:>10.4f}")

    # Serialize primary model (Random Forest / XGBoost calibrated)
    primary_clf = CalibratedClassifierCV(
        estimator=RandomForestClassifier(n_estimators=100, max_depth=6, random_state=RANDOM_SEED),
        method="sigmoid", cv=5
    )
    primary_clf.fit(X_train, y_train)
    primary_path = MODELS_DIR / "uci_symptom_model.joblib"
    joblib.dump(primary_clf, primary_path)
    logger.info(f"Saved UCI symptom model pipeline: {primary_path}")

    # Symptom Importance Feature Ranking (Random Forest)
    rf_base = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=RANDOM_SEED)
    rf_base.fit(X_train, y_train)
    importances = pd.Series(rf_base.feature_importances_, index=X.columns).sort_values(ascending=False)

    plt.figure(figsize=(10, 6))
    importances.plot(kind="barh", color="#1976D2")
    plt.gca().invert_yaxis()
    plt.title("UCI Dataset — Symptom Predictive Importance (Random Forest Gini)\n"
              "Notice Polyuria and Polydipsia dominate as consequences of hyperglycemia", fontweight="bold")
    plt.xlabel("Gini Feature Importance")
    plt.tight_layout()
    plt.savefig(REPORT_DIR / "uci_symptom_importance.png", dpi=150)
    plt.close()
    logger.info("Saved: uci_symptom_importance.png")

    # Save JSON report
    report = {
        "generated_at": datetime.now().isoformat(),
        "dataset": "UCI Early Stage Diabetes Risk Prediction",
        "task": "ACUTE SYMPTOM STATUS CLASSIFICATION (NOT FUTURE-RISK PREDICTION)",
        "critical_warning": (
            "Symptoms (Polyuria, Polydipsia, Sudden Weight Loss) are physiological results of diabetes. "
            "High test metrics (>0.95 ROC-AUC) reflect symptom presence during existing disease, "
            "NOT early prediction of asymptomatic disease development."
        ),
        "test_records": len(X_test),
        "evaluation_metrics": eval_results,
        "feature_importances": {k: round(float(v), 4) for k, v in importances.items()}
    }

    with open(REPORT_DIR / "uci_final_test_evaluation.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    logger.info("Saved: uci_final_test_evaluation.json")

    logger.info("\n" + "=" * 60)
    logger.info("UCI Track 3 Pipeline — COMPLETE")
    logger.info("=" * 60)


if __name__ == "__main__":
    run_uci_pipeline()
