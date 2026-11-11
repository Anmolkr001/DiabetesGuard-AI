"""
DiabetesGuard AI — PIMA Dataset Loader and Validator
======================================================
Phase 1: Dataset Collection and Research

Purpose:
  - Load the PIMA Indians Diabetes Dataset from the raw data directory.
  - Validate the file against expected schema and known characteristics.
  - Produce a structured dataset profile report.
  - Identify zero-encoded missing values.
  - Save a deterministically cleaned version (no learned transformations).

Usage:
  python machine_learning/preprocessing/pima_loader.py

Output:
  - Console report of dataset characteristics.
  - reports/dataset_analysis/pima/pima_dataset_profile.json
  - machine_learning/datasets/deterministic_cleaned/pima_cleaned.csv

Data Leakage Prevention:
  This script performs ONLY deterministic operations:
  - Reading and schema validation.
  - Flagging impossible zero values as NaN.
  - No imputation, scaling, or any learned transformation.
  - Train/test split is NOT performed here.

Author: DiabetesGuard AI Project
"""

import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime

import pandas as pd
import numpy as np

# ---------------------------------------------------------------------------
# Path setup — make project root importable
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from machine_learning.datasets.dataset_registry import DATASETS, TASK_DISTINCTION_NOTE

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
# Paths
# ---------------------------------------------------------------------------
RAW_DIR = PROJECT_ROOT / "machine_learning" / "datasets" / "raw"
CLEANED_DIR = PROJECT_ROOT / "machine_learning" / "datasets" / "deterministic_cleaned"
REPORT_DIR = PROJECT_ROOT / "reports" / "dataset_analysis" / "pima"

RAW_FILE = RAW_DIR / "pima_diabetes.csv"
CLEANED_FILE = CLEANED_DIR / "pima_cleaned.csv"
PROFILE_FILE = REPORT_DIR / "pima_dataset_profile.json"

# ---------------------------------------------------------------------------
# PIMA Domain Knowledge — features with zero as invalid marker
# ---------------------------------------------------------------------------
ZERO_INVALID_FEATURES = [
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
]

EXPECTED_COLUMNS = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
    "Outcome",
]

EXPECTED_RECORDS = 768


def load_raw_pima() -> pd.DataFrame:
    """
    Load the raw PIMA dataset from the raw directory.
    Raises FileNotFoundError with download instructions if the file is missing.
    """
    if not RAW_FILE.exists():
        msg = (
            f"\n{'='*60}\n"
            f"PIMA dataset file not found at:\n  {RAW_FILE}\n\n"
            f"Download instructions:\n"
            f"  1. Go to: https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database\n"
            f"  2. Download 'diabetes.csv'\n"
            f"  3. Rename it to 'pima_diabetes.csv'\n"
            f"  4. Place it in: {RAW_DIR}\n"
            f"{'='*60}\n"
        )
        logger.error(msg)
        raise FileNotFoundError(msg)

    logger.info(f"Loading PIMA dataset from: {RAW_FILE}")
    df = pd.read_csv(RAW_FILE)
    logger.info(f"Loaded {len(df)} rows and {len(df.columns)} columns.")
    return df


def validate_schema(df: pd.DataFrame) -> dict:
    """
    Validate the loaded DataFrame against the expected PIMA schema.
    Returns a validation result dictionary.
    """
    result = {
        "schema_valid": True,
        "issues": []
    }

    # Check columns
    missing_cols = set(EXPECTED_COLUMNS) - set(df.columns)
    extra_cols = set(df.columns) - set(EXPECTED_COLUMNS)

    if missing_cols:
        result["schema_valid"] = False
        result["issues"].append(f"Missing expected columns: {sorted(missing_cols)}")

    if extra_cols:
        result["issues"].append(f"Unexpected extra columns (will be retained): {sorted(extra_cols)}")

    # Check record count
    if len(df) != EXPECTED_RECORDS:
        result["issues"].append(
            f"Record count mismatch: expected {EXPECTED_RECORDS}, found {len(df)}. "
            f"Verify the correct file version was downloaded."
        )

    # Check target column values
    if "Outcome" in df.columns:
        unexpected_targets = set(df["Outcome"].unique()) - {0, 1}
        if unexpected_targets:
            result["schema_valid"] = False
            result["issues"].append(f"Unexpected values in Outcome column: {unexpected_targets}")

    return result


def compute_zero_analysis(df: pd.DataFrame) -> dict:
    """
    Identify zero values in features where zero is clinically invalid.
    These zeros represent missing data encoded as zero — a known characteristic
    of the PIMA dataset. They must be replaced with NaN in deterministic cleaning.

    This is a DETERMINISTIC operation: it applies domain knowledge, not
    statistics learned from the data.
    """
    zero_analysis = {}

    for col in ZERO_INVALID_FEATURES:
        if col not in df.columns:
            continue

        n_zeros = int((df[col] == 0).sum())
        pct_zeros = round(n_zeros / len(df) * 100, 2)

        zero_analysis[col] = {
            "n_zeros": n_zeros,
            "pct_zeros": pct_zeros,
            "domain_note": DATASETS["pima"]["features"][col]["domain_note"],
            "action": "Replace 0 with NaN (deterministic — domain knowledge)"
        }

        logger.info(f"  {col}: {n_zeros} zeros ({pct_zeros}%) — will be converted to NaN")

    return zero_analysis


def compute_dataset_profile(df: pd.DataFrame, zero_analysis: dict) -> dict:
    """
    Build a comprehensive profile of the raw PIMA dataset.
    All statistics are computed on the raw data for documentation purposes.
    """
    profile = {
        "generated_at": datetime.now().isoformat(),
        "dataset": "PIMA Indians Diabetes Dataset",
        "phase": "Phase 1 — Dataset Collection and Research",
        "task_distinction": TASK_DISTINCTION_NOTE.strip(),
        "shape": {"rows": int(df.shape[0]), "columns": int(df.shape[1])},
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "class_distribution": {
            "raw_counts": df["Outcome"].value_counts().to_dict(),
            "percentages": (df["Outcome"].value_counts(normalize=True) * 100).round(2).to_dict(),
            "note": "Class 0 = No diabetes diagnosis; Class 1 = Diabetes diagnosis"
        },
        "missing_values": {
            "genuine_nulls": df.isnull().sum().to_dict(),
            "genuine_null_pct": (df.isnull().sum() / len(df) * 100).round(2).to_dict(),
            "note": "These are actual NaN values. PIMA encodes missing data as 0 — see zero_analysis."
        },
        "zero_analysis": zero_analysis,
        "descriptive_statistics": df.describe().round(4).to_dict(),
        "known_limitations": DATASETS["pima"]["known_limitations"],
        "ethical_notes": DATASETS["pima"]["ethical_notes"],
        "population": DATASETS["pima"]["population"],
        "source_url": DATASETS["pima"]["source_url"],
    }

    return profile


def apply_deterministic_cleaning(df: pd.DataFrame, zero_analysis: dict) -> pd.DataFrame:
    """
    Apply ONLY deterministic data-cleaning operations.

    Operations performed:
    1. Replace physiologically impossible zero values with NaN in selected features.
       Justification: Domain knowledge — zeros in Glucose, BloodPressure, SkinThickness,
       Insulin, and BMI cannot represent valid clinical measurements.

    Operations NOT performed (require training data):
    - Imputation of NaN values.
    - Scaling or normalisation.
    - Outlier removal using statistical thresholds.
    - Any form of feature transformation.

    Returns a copy of the DataFrame with zero values replaced.
    """
    df_clean = df.copy()

    logger.info("Applying deterministic cleaning: replacing zero values with NaN...")

    for col in zero_analysis:
        if col in df_clean.columns:
            n_before = int((df_clean[col] == 0).sum())
            df_clean.loc[df_clean[col] == 0, col] = np.nan
            n_after = int(df_clean[col].isnull().sum())
            logger.info(f"  {col}: replaced {n_before} zeros → {n_after} NaN values")

    # Verify Pregnancies and Age — zero Pregnancies is valid (never pregnant);
    # zero Age is impossible but verify dataset does not contain it.
    if "Age" in df_clean.columns:
        n_zero_age = int((df_clean["Age"] == 0).sum())
        if n_zero_age > 0:
            logger.warning(f"  Age: found {n_zero_age} zero values — investigate!")

    if "Pregnancies" in df_clean.columns:
        n_zero_preg = int((df_clean["Pregnancies"] == 0).sum())
        logger.info(f"  Pregnancies: {n_zero_preg} zeros retained — zero pregnancies is clinically valid")

    return df_clean


def summarise_post_cleaning(df_raw: pd.DataFrame, df_clean: pd.DataFrame) -> dict:
    """
    Compare raw and cleaned datasets to document the effect of deterministic cleaning.
    """
    summary = {}
    for col in ZERO_INVALID_FEATURES:
        if col not in df_clean.columns:
            continue
        summary[col] = {
            "raw_missing": int(df_raw[col].isnull().sum()),
            "cleaned_missing": int(df_clean[col].isnull().sum()),
            "zeros_converted": int(df_clean[col].isnull().sum() - df_raw[col].isnull().sum())
        }
    return summary


def main():
    """
    Main execution: Load → Validate → Profile → Clean → Save
    """
    logger.info("=" * 60)
    logger.info("DiabetesGuard AI — Phase 1: PIMA Dataset Loader")
    logger.info("=" * 60)
    logger.info(f"Project root: {PROJECT_ROOT}")

    # Ensure output directories exist
    CLEANED_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    # --- Step 1: Load ---
    df_raw = load_raw_pima()

    # --- Step 2: Validate Schema ---
    logger.info("\nValidating dataset schema...")
    validation = validate_schema(df_raw)
    if validation["schema_valid"]:
        logger.info("  Schema validation PASSED.")
    else:
        logger.warning("  Schema validation FAILED — review issues below:")

    for issue in validation["issues"]:
        logger.warning(f"  ISSUE: {issue}")

    # --- Step 3: Zero Analysis ---
    logger.info("\nAnalysing zero values (domain knowledge — deterministic)...")
    zero_analysis = compute_zero_analysis(df_raw)

    # --- Step 4: Dataset Profile ---
    logger.info("\nComputing dataset profile...")
    profile = compute_dataset_profile(df_raw, zero_analysis)
    profile["schema_validation"] = validation

    # Print readable summary
    print("\n" + "=" * 60)
    print("PIMA DATASET — SUMMARY")
    print("=" * 60)
    print(f"Records     : {profile['shape']['rows']}")
    print(f"Features    : {profile['shape']['columns'] - 1}  (+1 target)")
    print(f"Target      : Outcome (0=No diabetes, 1=Diabetes)")
    print(f"\nClass Distribution:")
    for cls, count in profile["class_distribution"]["raw_counts"].items():
        pct = profile["class_distribution"]["percentages"][cls]
        label = "No Diabetes" if cls == 0 else "Diabetes    "
        print(f"  Class {cls} ({label}): {count} records ({pct}%)")

    print(f"\nTrue NaN values (before zero-correction):")
    for col, n in profile["missing_values"]["genuine_nulls"].items():
        if n > 0:
            print(f"  {col}: {n}")
        else:
            print(f"  {col}: 0")

    print(f"\nZero-encoded missing values (domain knowledge):")
    for col, info in zero_analysis.items():
        print(f"  {col}: {info['n_zeros']} zeros ({info['pct_zeros']}%)")

    print("\nKnown Limitations:")
    for i, lim in enumerate(profile["known_limitations"], 1):
        print(f"  {i}. {lim}")

    # --- Step 5: Save Profile ---
    with open(PROFILE_FILE, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2, default=str)
    logger.info(f"\nDataset profile saved to: {PROFILE_FILE}")

    # --- Step 6: Deterministic Cleaning ---
    logger.info("\nApplying deterministic cleaning...")
    df_cleaned = apply_deterministic_cleaning(df_raw, zero_analysis)

    # --- Step 7: Post-Cleaning Summary ---
    post_summary = summarise_post_cleaning(df_raw, df_cleaned)
    logger.info("\nPost-cleaning missing value counts:")
    for col, counts in post_summary.items():
        logger.info(f"  {col}: {counts['zeros_converted']} zeros converted to NaN "
                    f"(total missing now: {counts['cleaned_missing']})")

    # --- Step 8: Save Cleaned Dataset ---
    df_cleaned.to_csv(CLEANED_FILE, index=False)
    logger.info(f"\nDeterministically cleaned dataset saved to: {CLEANED_FILE}")

    # Save post-cleaning profile
    post_clean_profile = {
        "generated_at": datetime.now().isoformat(),
        "source": "pima_cleaned.csv",
        "shape": {"rows": int(df_cleaned.shape[0]), "columns": int(df_cleaned.shape[1])},
        "missing_after_cleaning": df_cleaned.isnull().sum().to_dict(),
        "missing_pct_after_cleaning": (df_cleaned.isnull().sum() / len(df_cleaned) * 100).round(2).to_dict(),
        "cleaning_operations": [
            f"Replaced 0 with NaN in {col} ({info['n_zeros']} values) — domain knowledge: "
            f"{info['domain_note']}"
            for col, info in zero_analysis.items()
        ],
        "note": (
            "This file contains ONLY deterministically cleaned data. "
            "No imputation, scaling, or any learned transformation has been applied. "
            "Train/test split and learned preprocessing must be applied separately."
        )
    }

    post_profile_file = REPORT_DIR / "pima_post_deterministic_cleaning.json"
    with open(post_profile_file, "w", encoding="utf-8") as f:
        json.dump(post_clean_profile, f, indent=2, default=str)
    logger.info(f"Post-cleaning profile saved to: {post_profile_file}")

    logger.info("\n" + "=" * 60)
    logger.info("Phase 1 PIMA Loader — COMPLETE")
    logger.info("Next step: Run pima_eda.py for exploratory data analysis")
    logger.info("=" * 60)

    return df_raw, df_cleaned, profile


if __name__ == "__main__":
    df_raw, df_cleaned, profile = main()

