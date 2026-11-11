"""
DiabetesGuard AI — CDC Dataset Splitting & Preprocessing Pipeline
===================================================================
Track 2: CDC Lifestyle Screening Preprocessing Pipeline

Purpose:
  - Stratified 80/20 train/test split on 253,680 survey records.
  - Test set (50,736 rows) is locked to prevent data leakage.
  - Training set (202,944 rows) is used to fit the preprocessing pipeline.
  - Continuous/scale features (BMI, MentHlth, PhysHlth) are standardized via StandardScaler.
  - Discrete/binary features are validated and retained.
  - Serialization of fitted pipeline to backend/saved_models/cdc/

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

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

RANDOM_SEED = 42
TEST_SIZE = 0.20
TARGET_COL = "Diabetes_binary"

CLEANED_FILE = PROJECT_ROOT / "machine_learning" / "datasets" / "deterministic_cleaned" / "cdc_cleaned.csv"
SPLITS_DIR = PROJECT_ROOT / "machine_learning" / "datasets" / "splits"
MODELS_DIR = PROJECT_ROOT / "backend" / "saved_models" / "cdc"

# Continuous features requiring scaling
SCALE_FEATURES = ["BMI", "MentHlth", "PhysHlth"]

# Categorical / Binary / Ordinal features (passthrough)
PASSTHROUGH_FEATURES = [
    "HighBP", "HighChol", "CholCheck", "Smoker", "Stroke", "HeartDiseaseorAttack",
    "PhysActivity", "Fruits", "Veggies", "HvyAlcoholConsump", "AnyHealthcare",
    "NoDocbcCost", "GenHlth", "DiffWalk", "Sex", "Age", "Education", "Income"
]

ALL_CDC_FEATURES = SCALE_FEATURES + PASSTHROUGH_FEATURES


def perform_cdc_split_and_pipeline():
    logger.info("=" * 60)
    logger.info("DiabetesGuard AI — CDC Dataset Split & Preprocessing Pipeline")
    logger.info("=" * 60)

    SPLITS_DIR.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(CLEANED_FILE)
    logger.info(f"Loaded cleaned CDC data: {len(df)} rows")

    X = df.drop(columns=[TARGET_COL])
    y = df[TARGET_COL]

    # Stratified 80/20 train/test split
    logger.info(f"Performing stratified 80/20 train/test split (seed={RANDOM_SEED})...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_SEED, stratify=y
    )

    df_train = X_train.copy()
    df_train[TARGET_COL] = y_train

    df_test = X_test.copy()
    df_test[TARGET_COL] = y_test

    train_path = SPLITS_DIR / "cdc_train.csv"
    test_path = SPLITS_DIR / "cdc_test.csv"

    df_train.to_csv(train_path, index=False)
    df_test.to_csv(test_path, index=False)
    logger.info(f"Training split saved: {train_path} ({len(df_train):,} rows)")
    logger.info(f"Test split saved (LOCKED): {test_path} ({len(df_test):,} rows)")

    # Build and fit preprocessing pipeline ON X_train ONLY
    logger.info("Building ColumnTransformer preprocessor...")
    preprocessor = ColumnTransformer(
        transformers=[
            ("scaler", StandardScaler(), SCALE_FEATURES),
            ("passthrough", "passthrough", PASSTHROUGH_FEATURES)
        ],
        remainder="drop"
    )

    pipeline = Pipeline(steps=[("preprocessor", preprocessor)])

    logger.info("Fitting preprocessor strictly on X_train...")
    pipeline.fit(X_train)

    pipeline_path = MODELS_DIR / "cdc_preprocessor.joblib"
    joblib.dump(pipeline, pipeline_path)
    logger.info(f"Fitted CDC Preprocessor saved: {pipeline_path}")

    # Metadata
    metadata = {
        "generated_at": datetime.now().isoformat(),
        "dataset": "CDC Diabetes Health Indicators",
        "total_records": len(df),
        "train_records": len(df_train),
        "test_records": len(df_test),
        "class_balance_train": {int(k): int(v) for k, v in y_train.value_counts().items()},
        "class_balance_test": {int(k): int(v) for k, v in y_test.value_counts().items()},
        "scaled_features": SCALE_FEATURES,
        "passthrough_features": PASSTHROUGH_FEATURES,
        "feature_order_out": SCALE_FEATURES + PASSTHROUGH_FEATURES
    }

    with open(SPLITS_DIR / "cdc_split_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info("\n" + "=" * 60)
    logger.info("CDC Split & Preprocessing — COMPLETE")
    logger.info("=" * 60)


if __name__ == "__main__":
    perform_cdc_split_and_pipeline()

