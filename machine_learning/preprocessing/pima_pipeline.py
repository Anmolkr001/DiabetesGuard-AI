"""
DiabetesGuard AI — PIMA Reusable Preprocessing Pipeline
=========================================================
Phase 4: Modular Preprocessing Pipeline

Purpose:
  Provides a scikit-learn Pipeline that handles all LEARNED transformations
  for the PIMA dataset. This pipeline is:
    - Fitted ONLY on training data (X_train)
    - Applied (transformed) to both train and test data
    - Saved to disk using joblib for reuse in backend inference

Transformations included:
  1. Median imputation for features with NaN (from zero-correction)
     — Median is preferred over mean due to skewed distributions in PIMA.
  2. Standard scaling (zero-mean, unit-variance) for all numeric features.

What is NOT in this pipeline:
  - Feature selection (handled separately in Phase 5)
  - SMOTE / resampling (applied inside cross-validation in Phase 6)
  - Target encoding

Design principle:
  Any transformation that "learns" a parameter from data (median, mean, std)
  MUST be learned from X_train only. This module enforces that constraint.

Usage:
  from machine_learning.preprocessing.pima_pipeline import build_pima_pipeline, fit_and_save_pipeline

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
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer

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
# Feature definitions
# ---------------------------------------------------------------------------
TARGET_COL = "Outcome"

# All 8 PIMA features are numeric — no categorical features in this dataset
NUMERIC_FEATURES = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]

# Features that have NaN values (from zero-correction in pima_loader.py)
# Imputation strategy: median (robust to outliers, appropriate for skewed data)
IMPUTE_FEATURES = [
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
]

# Features without missing values — no imputation needed, but still scaled
NO_IMPUTE_FEATURES = [
    "Pregnancies",
    "DiabetesPedigreeFunction",
    "Age",
]

# Pipeline save path
PIPELINE_SAVE_DIR = PROJECT_ROOT / "backend" / "saved_models" / "pima"
SPLITS_DIR        = PROJECT_ROOT / "machine_learning" / "datasets" / "splits"


def build_pima_pipeline() -> Pipeline:
    """
    Build the PIMA preprocessing pipeline.

    Architecture:
    - ColumnTransformer applies different steps to different feature groups.
    - For features with NaN: MedianImputer → StandardScaler
    - For features without NaN: StandardScaler only
    - All numeric features are returned in a consistent order.

    Returns:
        sklearn Pipeline (unfitted)
    """
    # Impute + scale for features with known missing values
    impute_and_scale = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler",  StandardScaler())
    ])

    # Scale only for features without missing values
    scale_only = Pipeline(steps=[
        ("scaler", StandardScaler())
    ])

    # ColumnTransformer combines both sub-pipelines
    preprocessor = ColumnTransformer(
        transformers=[
            ("impute_scale", impute_and_scale, IMPUTE_FEATURES),
            ("scale_only",   scale_only,       NO_IMPUTE_FEATURES),
        ],
        remainder="drop",        # Drop any unlisted columns (e.g. target)
        verbose_feature_names_out=False
    )

    # Wrap in a Pipeline for compatibility with cross-validation and stacking
    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor)
    ])

    return pipeline


def fit_and_save_pipeline(
    df_train: pd.DataFrame,
    pipeline: Pipeline = None,
    save: bool = True
) -> tuple[Pipeline, np.ndarray]:
    """
    Fit the preprocessing pipeline on training data and return
    the fitted pipeline and the transformed training array.

    Args:
        df_train: Training DataFrame (includes target column)
        pipeline: Optional pre-built pipeline; builds one if None
        save: Whether to save the fitted pipeline to disk

    Returns:
        (fitted_pipeline, X_train_transformed)
    """
    if pipeline is None:
        pipeline = build_pima_pipeline()

    X_train = df_train.drop(columns=[TARGET_COL])
    y_train = df_train[TARGET_COL].values

    logger.info("Fitting preprocessing pipeline on training data...")
    pipeline.fit(X_train)
    X_train_transformed = pipeline.transform(X_train)

    # Retrieve transformed feature names (preserving order)
    feature_names_out = get_feature_names_out(pipeline)
    logger.info(f"Pipeline fitted. Output features ({len(feature_names_out)}): {feature_names_out}")

    # Log imputed medians learned from training data
    preprocessor = pipeline.named_steps["preprocessor"]
    imputer = preprocessor.named_transformers_["impute_scale"].named_steps["imputer"]
    logger.info("Learned medians (training set):")
    for feat, median_val in zip(IMPUTE_FEATURES, imputer.statistics_):
        logger.info(f"  {feat}: {median_val:.4f}")

    # Log learned scaling parameters
    for group_name, features in [("impute_scale", IMPUTE_FEATURES), ("scale_only", NO_IMPUTE_FEATURES)]:
        scaler = preprocessor.named_transformers_[group_name].named_steps["scaler"]
        logger.info(f"\nLearned scaling ({group_name}):")
        for feat, mean_val, std_val in zip(features, scaler.mean_, scaler.scale_):
            logger.info(f"  {feat}: mean={mean_val:.4f}, std={std_val:.4f}")

    if save:
        PIPELINE_SAVE_DIR.mkdir(parents=True, exist_ok=True)
        pipeline_path = PIPELINE_SAVE_DIR / "pima_preprocessor.joblib"
        joblib.dump(pipeline, pipeline_path)
        logger.info(f"\nPipeline saved to: {pipeline_path}")

        # Save pipeline configuration metadata
        meta = {
            "generated_at": datetime.now().isoformat(),
            "dataset": "PIMA",
            "pipeline_file": str(pipeline_path),
            "impute_features": IMPUTE_FEATURES,
            "no_impute_features": NO_IMPUTE_FEATURES,
            "imputation_strategy": "median",
            "scaling": "StandardScaler (zero-mean, unit-variance)",
            "feature_order_out": feature_names_out,
            "leakage_note": (
                "This pipeline was fitted on X_train only. "
                "Learned parameters (medians, mean, std) must NOT be recomputed on the full dataset."
            ),
            "learned_medians": dict(zip(IMPUTE_FEATURES, [float(v) for v in imputer.statistics_])),
        }
        meta_path = PIPELINE_SAVE_DIR / "pima_preprocessor_metadata.json"
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)
        logger.info(f"Pipeline metadata saved to: {meta_path}")

    return pipeline, X_train_transformed


def transform_data(pipeline: Pipeline, df: pd.DataFrame) -> np.ndarray:
    """
    Apply a fitted pipeline to new data (e.g., validation, test, or inference input).
    The pipeline must already be fitted via fit_and_save_pipeline.

    Args:
        pipeline: Fitted sklearn Pipeline
        df: DataFrame to transform (may or may not include target column)

    Returns:
        Transformed numpy array
    """
    if TARGET_COL in df.columns:
        X = df.drop(columns=[TARGET_COL])
    else:
        X = df.copy()

    return pipeline.transform(X)


def get_feature_names_out(pipeline: Pipeline) -> list[str]:
    """
    Retrieve the ordered list of output feature names from the fitted pipeline.
    Feature order: IMPUTE_FEATURES first, then NO_IMPUTE_FEATURES.
    """
    return IMPUTE_FEATURES + NO_IMPUTE_FEATURES


def load_fitted_pipeline(pipeline_path: Path = None) -> Pipeline:
    """Load a previously fitted pipeline from disk."""
    if pipeline_path is None:
        pipeline_path = PIPELINE_SAVE_DIR / "pima_preprocessor.joblib"

    if not pipeline_path.exists():
        raise FileNotFoundError(
            f"Pipeline not found at {pipeline_path}. "
            "Run fit_and_save_pipeline() first."
        )

    return joblib.load(pipeline_path)


# =============================================================================
# MAIN — Demonstrate pipeline fitting on PIMA training split
# =============================================================================
def main():
    logger.info("=" * 60)
    logger.info("DiabetesGuard AI — Phase 4: PIMA Preprocessing Pipeline")
    logger.info("=" * 60)

    train_path = SPLITS_DIR / "pima_train.csv"
    test_path  = SPLITS_DIR / "pima_test.csv"

    if not train_path.exists() or not test_path.exists():
        logger.error("Split files not found. Run pima_split.py first.")
        sys.exit(1)

    df_train = pd.read_csv(train_path)
    df_test  = pd.read_csv(test_path)
    logger.info(f"Training set : {len(df_train)} records")
    logger.info(f"Test set     : {len(df_test)} records")

    # Build and fit pipeline on training data only
    pipeline, X_train_transformed = fit_and_save_pipeline(df_train, save=True)

    # Apply (transform-only) to test data
    X_test_transformed = transform_data(pipeline, df_test)
    y_test = df_test[TARGET_COL].values

    logger.info(f"\nX_train_transformed shape : {X_train_transformed.shape}")
    logger.info(f"X_test_transformed shape  : {X_test_transformed.shape}")

    # Verify no NaN after transformation
    n_nan_train = int(np.isnan(X_train_transformed).sum())
    n_nan_test  = int(np.isnan(X_test_transformed).sum())
    logger.info(f"\nNaN in X_train_transformed: {n_nan_train} (expected 0)")
    logger.info(f"NaN in X_test_transformed : {n_nan_test} (expected 0)")

    if n_nan_train == 0 and n_nan_test == 0:
        logger.info("✓ Pipeline output is clean — no NaN values.")
    else:
        logger.warning("⚠ NaN values found in transformed output — investigate!")

    print("\n" + "=" * 60)
    print("PIMA PREPROCESSING PIPELINE — COMPLETE")
    print("=" * 60)
    print(f"Features in pipeline output: {get_feature_names_out(pipeline)}")
    print(f"Training array shape : {X_train_transformed.shape}")
    print(f"Test array shape     : {X_test_transformed.shape}")
    print(f"Pipeline saved to    : {PIPELINE_SAVE_DIR / 'pima_preprocessor.joblib'}")

    logger.info("\n" + "=" * 60)
    logger.info("Phase 4 Pipeline — COMPLETE")
    logger.info("Next: Phase 5 — Feature Engineering and Feature Selection")
    logger.info("=" * 60)

    return pipeline, X_train_transformed, X_test_transformed, y_test


if __name__ == "__main__":
    main()

