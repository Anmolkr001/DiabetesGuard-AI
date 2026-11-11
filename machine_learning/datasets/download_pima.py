"""
DiabetesGuard AI — PIMA Dataset Download Helper
=================================================
Downloads the PIMA Indians Diabetes Dataset directly from UCI ML Repository
using the ucimlrepo package (optional) or provides clear manual instructions.

Usage:
  python machine_learning/datasets/download_pima.py

Alternatively, manual download:
  1. Visit: https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database
  2. Download diabetes.csv
  3. Rename to pima_diabetes.csv
  4. Place in: machine_learning/datasets/raw/

The UCI version of the dataset is also available at:
  https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.csv
  (Note: verify column headers match expected schema)

Author: DiabetesGuard AI Project
"""

import sys
import logging
import urllib.request
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR      = PROJECT_ROOT / "machine_learning" / "datasets" / "raw"
PIMA_FILE    = RAW_DIR / "pima_diabetes.csv"

# Jason Brownlee's mirror of the PIMA dataset — widely used, matches Kaggle version
# Column headers are added manually since this URL returns header-less data.
PIMA_URL_HEADERLESS = (
    "https://raw.githubusercontent.com/jbrownlee/Datasets/master/"
    "pima-indians-diabetes.csv"
)

EXPECTED_COLUMNS = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome"
]


def download_with_headers():
    """
    Attempt to download the PIMA dataset and add column headers.
    Falls back to Kaggle manual download instructions on failure.
    """
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    if PIMA_FILE.exists():
        logger.info(f"PIMA file already exists at: {PIMA_FILE}")
        logger.info("Skipping download. Delete the file and re-run to force re-download.")
        return True

    logger.info(f"Attempting to download PIMA dataset from:\n  {PIMA_URL_HEADERLESS}")
    logger.info("NOTE: This requires internet/network access.")

    try:
        with urllib.request.urlopen(PIMA_URL_HEADERLESS, timeout=15) as response:
            raw_content = response.read().decode("utf-8")

        lines = raw_content.strip().split("\n")
        header = ",".join(EXPECTED_COLUMNS)
        content_with_header = header + "\n" + "\n".join(lines)

        with open(PIMA_FILE, "w", encoding="utf-8") as f:
            f.write(content_with_header)

        logger.info(f"Download successful. File saved to: {PIMA_FILE}")
        logger.info(f"Records downloaded: {len(lines)}")
        return True

    except Exception as e:
        logger.error(f"Download failed: {e}")
        print_manual_instructions()
        return False


def print_manual_instructions():
    print("\n" + "=" * 60)
    print("MANUAL DOWNLOAD INSTRUCTIONS — PIMA DATASET")
    print("=" * 60)
    print("\nOption 1 (Kaggle — recommended):")
    print("  1. Go to: https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database")
    print("  2. Click 'Download' (requires free Kaggle account)")
    print("  3. Extract the ZIP file")
    print("  4. Find 'diabetes.csv'")
    print("  5. Rename it to 'pima_diabetes.csv'")
    print(f"  6. Place it in: {RAW_DIR}")
    print("\nOption 2 (Direct URL — may require internet access):")
    print(f"  URL: {PIMA_URL_HEADERLESS}")
    print(f"  Then add this header row as the first line:")
    print(f"  {','.join(EXPECTED_COLUMNS)}")
    print(f"\nExpected file location: {PIMA_FILE}")
    print("=" * 60)


def verify_downloaded_file():
    """Verify the downloaded file has the correct structure."""
    import pandas as pd
    df = pd.read_csv(PIMA_FILE)
    missing = set(EXPECTED_COLUMNS) - set(df.columns)
    if missing:
        logger.error(f"Missing columns: {missing}")
        return False
    logger.info(f"File verified: {len(df)} rows, columns match expected schema.")
    return True


if __name__ == "__main__":
    success = download_with_headers()
    if success and PIMA_FILE.exists():
        verify_downloaded_file()
    else:
        sys.exit(1)

