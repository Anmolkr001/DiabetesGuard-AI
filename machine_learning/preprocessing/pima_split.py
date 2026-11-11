"""
DiabetesGuard AI — PIMA Train/Test Split
==========================================
Phase 3: Deterministic Data Cleaning & Splitting

Purpose:
  - Perform stratified 80/20 train/test split on the deterministically
    cleaned PIMA dataset.
  - Save split indices and split datasets for reproducible downstream use.
  - Document the split configuration as metadata.

Data Leakage Prevention Rules:
  - The test set is saved and must NOT be used during model development,
    feature selection, imputation fitting, or hyperparameter tuning.
  - ALL learned transformations (imputation, scaling, encoding) are fitted
    only on X_train and applied to X_test/X_val.
  - This script saves raw (unimputed, unscaled) split files.

Outputs:
  - machine_learning/datasets/splits/pima_train.csv
  - machine_learning/datasets/splits/pima_test.csv
  - machine_learning/datasets/splits/pima_split_metadata.json

Author: DiabetesGuard AI Project
"""

import sys
import json
import logging
from pathlib import Path
from datetime import datetime

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

# ---------------------------------------------------------------------------
# Path setup
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
RANDOM_SEED   = 42          # Fixed seed for reproducibility
TEST_SIZE     = 0.20        # 20% held-out test set
TARGET_COL    = "Outcome"
CLEANED_FILE  = PROJECT_ROOT / "machine_learning" / "datasets" / "deterministic_cleaned" / "pima_cleaned.csv"
SPLITS_DIR    = PROJECT_ROOT / "machine_learning" / "datasets" / "splits"


def perform_split(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Stratified train/test split to maintain class proportions.

    Stratification ensures the class balance in the full dataset
    is preserved in both train and test partitions.

    Returns: (df_train, df_test)
    """
    X = df.drop(columns=[TARGET_COL])
    y = df[TARGET_COL]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=TEST_SIZE,
        random_state=RANDOM_SEED,
        stratify=y          # Stratify by class — prevents imbalanced splits
    )

    df_train = X_train.copy()
    df_train[TARGET_COL] = y_train

    df_test = X_test.copy()
    df_test[TARGET_COL] = y_test

    return df_train, df_test


def verify_split_balance(df_full: pd.DataFrame, df_train: pd.DataFrame, df_test: pd.DataFrame) -> dict:
    """
    Verify that stratification preserved class proportions.
    Returns a report dictionary.
    """
    def class_pcts(df):
        return (df[TARGET_COL].value_counts(normalize=True) * 100).round(2).to_dict()

    report = {
        "full_dataset":    {"n": len(df_full),  "class_pct": class_pcts(df_full)},
        "train_set":       {"n": len(df_train), "class_pct": class_pcts(df_train)},
        "test_set":        {"n": len(df_test),  "class_pct": class_pcts(df_test)},
        "stratification_check": "PASS",
        "issues": []
    }

    # Check that proportions are within 1% tolerance
    for cls in [0, 1]:
        full_pct  = class_pcts(df_full).get(cls, 0)
        train_pct = class_pcts(df_train).get(cls, 0)
        test_pct  = class_pcts(df_test).get(cls, 0)
        if abs(full_pct - train_pct) > 1.5 or abs(full_pct - test_pct) > 1.5:
            report["stratification_check"] = "WARN"
            report["issues"].append(
                f"Class {cls}: full={full_pct}%, train={train_pct}%, test={test_pct}%"
            )

    return report


def main():
    logger.info("=" * 60)
    logger.info("DiabetesGuard AI — Phase 3: PIMA Train/Test Split")
    logger.info("=" * 60)

    SPLITS_DIR.mkdir(parents=True, exist_ok=True)

    # Load cleaned data
    if not CLEANED_FILE.exists():
        logger.error(f"Cleaned file not found: {CLEANED_FILE}")
        logger.error("Run pima_loader.py first.")
        sys.exit(1)

    df = pd.read_csv(CLEANED_FILE)
    logger.info(f"Loaded cleaned PIMA dataset: {len(df)} rows")

    # Perform split
    logger.info(f"\nPerforming stratified {int((1-TEST_SIZE)*100)}/{int(TEST_SIZE*100)} split "
                f"(seed={RANDOM_SEED})...")
    df_train, df_test = perform_split(df)

    # Verify
    balance_report = verify_split_balance(df, df_train, df_test)
    logger.info(f"Stratification check: {balance_report['stratification_check']}")

    if balance_report["issues"]:
        for issue in balance_report["issues"]:
            logger.warning(f"  WARN: {issue}")
    else:
        logger.info("  Class proportions preserved correctly in both splits.")

    # Print split summary
    print("\n" + "=" * 60)
    print("PIMA — TRAIN / TEST SPLIT SUMMARY")
    print("=" * 60)
    print(f"Full dataset  : {len(df):>4} records")
    print(f"Training set  : {len(df_train):>4} records ({len(df_train)/len(df)*100:.1f}%)")
    print(f"Test set      : {len(df_test):>4} records ({len(df_test)/len(df)*100:.1f}%)")
    print(f"\nClass balance (train) :")
    for cls, pct in sorted(balance_report["train_set"]["class_pct"].items()):
        n = int(pct * len(df_train) / 100)
        print(f"  Class {cls}: ~{n} records ({pct}%)")
    print(f"\nClass balance (test)  :")
    for cls, pct in sorted(balance_report["test_set"]["class_pct"].items()):
        n = int(pct * len(df_test) / 100)
        print(f"  Class {cls}: ~{n} records ({pct}%)")

    print(f"\n⚠  TEST SET IS NOW LOCKED.")
    print(f"   Do NOT use pima_test.csv during feature engineering,")
    print(f"   model training, or hyperparameter tuning.")

    # Save splits
    train_path = SPLITS_DIR / "pima_train.csv"
    test_path  = SPLITS_DIR / "pima_test.csv"
    df_train.to_csv(train_path, index=False)
    df_test.to_csv(test_path, index=False)
    logger.info(f"\nTraining set saved  : {train_path}")
    logger.info(f"Test set saved      : {test_path}")

    # Save metadata
    metadata = {
        "generated_at":     datetime.now().isoformat(),
        "source_file":      str(CLEANED_FILE),
        "random_seed":      RANDOM_SEED,
        "test_size":        TEST_SIZE,
        "stratified":       True,
        "stratify_column":  TARGET_COL,
        "split_balance":    balance_report,
        "train_file":       str(train_path),
        "test_file":        str(test_path),
        "leakage_warning": (
            "The test set must NOT be used for any fitting operation. "
            "Imputers, scalers, and feature selectors must be fitted on X_train only "
            "and then applied to X_test for evaluation."
        )
    }

    meta_path = SPLITS_DIR / "pima_split_metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, default=str)
    logger.info(f"Split metadata saved: {meta_path}")

    logger.info("\n" + "=" * 60)
    logger.info("Phase 3 PIMA Split — COMPLETE")
    logger.info("Next: Phase 4 — Reusable Preprocessing Pipeline")
    logger.info("=" * 60)

    return df_train, df_test, metadata


if __name__ == "__main__":
    df_train, df_test, metadata = main()

