"""
DiabetesGuard AI — PIMA Feature Engineering
=============================================
Phase 5a: Feature Engineering

Purpose:
  Create clinically motivated derived features to augment the PIMA
  feature set. These features capture non-linear relationships and
  domain-relevant interactions.

Design principle:
  Feature engineering formulas are DETERMINISTIC — they use only the
  values of the record itself, no population statistics. Therefore
  they can be applied identically to train and test data without
  leakage risk.

  However, any subsequent scaling or imputation of engineered features
  must still be fitted on training data only.

Engineered features:
  1. BMI_Age_Interaction    = BMI × Age
  2. Glucose_Insulin_Ratio  = Glucose / (Insulin + 1)  [+1 to avoid division by zero]
  3. Age_Group              = Categorical bins of Age (21-30, 31-40, 41-50, 51+)
  4. BMI_Category           = Clinical BMI categories (Underweight, Normal, Overweight, Obese)
  5. Glucose_Category       = Glucose tolerance categories (Normal, Impaired, Diabetic range)
  6. High_Risk_Indicators   = Count of simultaneous risk factors

Author: DiabetesGuard AI Project
"""

import sys
import logging
from pathlib import Path

import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


# =========================================================================
# Feature Engineering Functions — All Deterministic
# =========================================================================

def engineer_bmi_age_interaction(df: pd.DataFrame) -> pd.DataFrame:
    """
    BMI × Age interaction: captures the combined effect of higher BMI
    at older age, which is clinically associated with greater diabetes risk.
    Returns NaN where BMI or Age is NaN.
    """
    df = df.copy()
    df["BMI_Age_Interaction"] = df["BMI"] * df["Age"]
    return df


def engineer_glucose_insulin_ratio(df: pd.DataFrame) -> pd.DataFrame:
    """
    Glucose-to-Insulin ratio: crude proxy for insulin sensitivity/resistance.
    Higher values may suggest impaired insulin response.
    
    Note: This is a simplified ratio — clinical insulin resistance indices
    (e.g., HOMA-IR) require fasting glucose and fasting insulin, which
    may not be what this dataset measures (2-hour OGTT glucose, 2-hour insulin).
    
    The ratio is computed as Glucose / (Insulin + 1) to avoid division by zero
    when Insulin is NaN (imputed) or zero.
    """
    df = df.copy()
    df["Glucose_Insulin_Ratio"] = df["Glucose"] / (df["Insulin"] + 1)
    return df


def engineer_age_groups(df: pd.DataFrame) -> pd.DataFrame:
    """
    Bin Age into clinically meaningful groups.
    Encoded as integers for model compatibility.
    
    Groups:
      0 = Young adult (21-30)
      1 = Middle age (31-40)  
      2 = Older middle age (41-50)
      3 = Senior (51+)
    """
    df = df.copy()
    bins = [20, 30, 40, 50, 100]
    labels = [0, 1, 2, 3]
    df["Age_Group"] = pd.cut(df["Age"], bins=bins, labels=labels, right=True).astype(float)
    return df


def engineer_bmi_category(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clinical BMI categories (WHO classification).
    Encoded as ordinal integers.
    
    Categories:
      0 = Underweight (BMI < 18.5)
      1 = Normal (18.5 ≤ BMI < 25.0)
      2 = Overweight (25.0 ≤ BMI < 30.0)
      3 = Obese (BMI ≥ 30.0)
    """
    df = df.copy()
    conditions = [
        df["BMI"] < 18.5,
        (df["BMI"] >= 18.5) & (df["BMI"] < 25.0),
        (df["BMI"] >= 25.0) & (df["BMI"] < 30.0),
        df["BMI"] >= 30.0
    ]
    choices = [0, 1, 2, 3]
    df["BMI_Category"] = np.select(conditions, choices, default=np.nan)
    # If BMI was NaN, the category should also be NaN
    df.loc[df["BMI"].isna(), "BMI_Category"] = np.nan
    return df


def engineer_glucose_category(df: pd.DataFrame) -> pd.DataFrame:
    """
    Glucose tolerance categories based on 2-hour OGTT threshold guidance.
    (Based on ADA criteria, though the PIMA data context may vary.)

    Categories:
      0 = Normal (Glucose < 140)
      1 = Impaired glucose tolerance (140 ≤ Glucose < 200)
      2 = Diabetic range (Glucose ≥ 200)
      
    Note: These thresholds are applied as feature engineering
    for model input. They do NOT constitute a clinical diagnosis.
    """
    df = df.copy()
    conditions = [
        df["Glucose"] < 140,
        (df["Glucose"] >= 140) & (df["Glucose"] < 200),
        df["Glucose"] >= 200
    ]
    choices = [0, 1, 2]
    df["Glucose_Category"] = np.select(conditions, choices, default=np.nan)
    df.loc[df["Glucose"].isna(), "Glucose_Category"] = np.nan
    return df


def engineer_high_risk_count(df: pd.DataFrame) -> pd.DataFrame:
    """
    Count of simultaneous risk indicators per record.
    Each of the following is a binary flag (1 if present):
      - BMI ≥ 30 (Obese)
      - Glucose ≥ 140 (Impaired or Diabetic range)
      - Age ≥ 40
      - Pregnancies ≥ 4 (high parity)
      - DiabetesPedigreeFunction ≥ 0.5 (elevated family history score)
    
    The count ranges from 0 to 5.
    """
    df = df.copy()
    risk_flags = pd.DataFrame({
        "obese":       (df["BMI"] >= 30).astype(float),
        "high_glucose": (df["Glucose"] >= 140).astype(float),
        "older":       (df["Age"] >= 40).astype(float),
        "high_parity": (df["Pregnancies"] >= 4).astype(float),
        "family_hx":   (df["DiabetesPedigreeFunction"] >= 0.5).astype(float),
    })
    # NaN in source → NaN in flag → sum skips NaN
    risk_flags[df["BMI"].isna()] = np.nan
    df["High_Risk_Count"] = risk_flags.sum(axis=1, skipna=True)
    return df


def apply_all_feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply all feature engineering transformations.
    
    All operations are deterministic (no statistics from the dataset),
    so they can be applied to train, test, or inference data identically.
    
    Returns: DataFrame with original + engineered features.
    """
    df = engineer_bmi_age_interaction(df)
    df = engineer_glucose_insulin_ratio(df)
    df = engineer_age_groups(df)
    df = engineer_bmi_category(df)
    df = engineer_glucose_category(df)
    df = engineer_high_risk_count(df)
    
    return df


# =========================================================================
# Feature sets for downstream use
# =========================================================================

ORIGINAL_FEATURES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
]

ENGINEERED_FEATURES = [
    "BMI_Age_Interaction",
    "Glucose_Insulin_Ratio",
    "Age_Group",
    "BMI_Category",
    "Glucose_Category",
    "High_Risk_Count"
]

ALL_FEATURES = ORIGINAL_FEATURES + ENGINEERED_FEATURES

TARGET_COL = "Outcome"


# =========================================================================
# Main — demonstrate on training data
# =========================================================================
def main():
    logger.info("=" * 60)
    logger.info("Phase 5a: PIMA Feature Engineering")
    logger.info("=" * 60)

    splits_dir = PROJECT_ROOT / "machine_learning" / "datasets" / "splits"
    df_train = pd.read_csv(splits_dir / "pima_train.csv")
    df_test  = pd.read_csv(splits_dir / "pima_test.csv")

    logger.info(f"Training set: {len(df_train)} records, {len(df_train.columns)} columns")
    logger.info(f"Test set    : {len(df_test)} records, {len(df_test.columns)} columns")

    # Apply feature engineering
    df_train_eng = apply_all_feature_engineering(df_train)
    df_test_eng  = apply_all_feature_engineering(df_test)

    logger.info(f"\nAfter feature engineering:")
    logger.info(f"Training set: {len(df_train_eng)} records, {len(df_train_eng.columns)} columns")
    logger.info(f"Test set    : {len(df_test_eng)} records, {len(df_test_eng.columns)} columns")
    logger.info(f"\nNew features: {ENGINEERED_FEATURES}")

    print("\n" + "=" * 60)
    print("PIMA Feature Engineering — Summary")
    print("=" * 60)
    print(f"Original features     : {len(ORIGINAL_FEATURES)}")
    print(f"Engineered features   : {len(ENGINEERED_FEATURES)}")
    print(f"Total features        : {len(ALL_FEATURES)}")
    print(f"\nEngineered feature statistics (training set):")
    print(df_train_eng[ENGINEERED_FEATURES].describe().round(2).to_string())

    # Save engineered datasets
    eng_dir = splits_dir
    df_train_eng.to_csv(eng_dir / "pima_train_engineered.csv", index=False)
    df_test_eng.to_csv(eng_dir / "pima_test_engineered.csv", index=False)
    logger.info(f"\nEngineered datasets saved to: {eng_dir}")

    return df_train_eng, df_test_eng


if __name__ == "__main__":
    main()

