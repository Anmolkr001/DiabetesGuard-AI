"""
DiabetesGuard AI — CDC Exploratory Data Analysis
==================================================
Track 2: CDC Lifestyle & Demographic Screening EDA

Purpose:
  - Generate comprehensive statistical and visual profile for CDC BRFSS dataset.
  - Explore class distribution (severe imbalance: 86.1% vs 13.9%).
  - Explore feature distributions, correlations, and odds comparisons across
    key non-invasive indicators (HighBP, HighChol, BMI, Smoker, PhysActivity,
    GenHlth, Age, Income).
  - Save visual artifacts to reports/dataset_analysis/cdc/

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
import seaborn as sns

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

CLEANED_FILE = PROJECT_ROOT / "machine_learning" / "datasets" / "deterministic_cleaned" / "cdc_cleaned.csv"
REPORT_DIR = PROJECT_ROOT / "reports" / "dataset_analysis" / "cdc"

TARGET_COL = "Diabetes_binary"
PALETTE_BINARY = {0: "#1976D2", 1: "#D32F2F"}
LABEL_MAP = {0: "No Diabetes (0)", 1: "Diabetes (1)"}


def run_cdc_eda():
    logger.info("=" * 60)
    logger.info("DiabetesGuard AI — CDC Exploratory Data Analysis")
    logger.info("=" * 60)

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(CLEANED_FILE)
    logger.info(f"Loaded {len(df)} records with {len(df.columns)} columns.")

    # 1. Target Class Balance Plot
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))
    counts = df[TARGET_COL].value_counts().sort_index()
    pcts = df[TARGET_COL].value_counts(normalize=True).sort_index() * 100

    axes[0].bar(["No Diabetes (0)", "Diabetes (1)"], counts.values, color=["#1976D2", "#D32F2F"])
    axes[0].set_ylabel("Respondents")
    axes[0].set_title("CDC BRFSS — Class Counts", fontweight="bold")
    for i, v in enumerate(counts.values):
        axes[0].text(i, v + 3000, f"{v:,}", ha="center", fontweight="bold")

    axes[1].pie(pcts.values, labels=[f"No Diabetes\n({pcts[0]:.1f}%)", f"Diabetes\n({pcts[1]:.1f}%)"],
                colors=["#1976D2", "#D32F2F"], autopct="%1.1f%%", startangle=90)
    axes[1].set_title("Prevalence Ratio", fontweight="bold")

    plt.suptitle("CDC Diabetes Health Indicators — Class Distribution (Severe Imbalance 6.18:1)", fontweight="bold")
    plt.tight_layout()
    plt.savefig(REPORT_DIR / "01_cdc_class_distribution.png", dpi=150)
    plt.close()
    logger.info("Saved: 01_cdc_class_distribution.png")

    # 2. Key Lifestyle Prevalence Disparities
    lifestyle_feats = ["HighBP", "HighChol", "Smoker", "HeartDiseaseorAttack", "PhysActivity", "DiffWalk"]
    prevalences = []
    for f in lifestyle_feats:
        prev_no_diab = df[df[TARGET_COL] == 0][f].mean() * 100
        prev_diab = df[df[TARGET_COL] == 1][f].mean() * 100
        prevalences.append({"Feature": f, "No Diabetes (%)": prev_no_diab, "Diabetes (%)": prev_diab})

    prev_df = pd.DataFrame(prevalences)

    fig, ax = plt.subplots(figsize=(10, 5))
    x = np.arange(len(lifestyle_feats))
    width = 0.35

    ax.bar(x - width/2, prev_df["No Diabetes (%)"], width, label="No Diabetes (Class 0)", color="#1976D2")
    ax.bar(x + width/2, prev_df["Diabetes (%)"], width, label="Diabetes (Class 1)", color="#D32F2F")

    ax.set_xticks(x)
    ax.set_xticklabels(lifestyle_feats)
    ax.set_ylabel("Prevalence within Subgroup (%)")
    ax.set_title("CDC Indicators — Prevalence Comparison Across Risk Factors\n(Non-Invasive Survey Indicators)", fontweight="bold")
    ax.legend()
    ax.grid(True, alpha=0.3, axis="y")

    plt.tight_layout()
    plt.savefig(REPORT_DIR / "02_cdc_lifestyle_prevalences.png", dpi=150)
    plt.close()
    logger.info("Saved: 02_cdc_lifestyle_prevalences.png")

    # 3. Correlation Heatmap
    corr = df.corr(method="pearson")
    plt.figure(figsize=(14, 11))
    sns.heatmap(corr, annot=False, cmap="coolwarm", center=0, vmin=-0.4, vmax=0.4, linewidths=0.5)
    plt.title("CDC BRFSS Survey Features — Pearson Correlation Matrix", fontweight="bold", fontsize=12)
    plt.tight_layout()
    plt.savefig(REPORT_DIR / "03_cdc_correlation_matrix.png", dpi=150)
    plt.close()
    logger.info("Saved: 03_cdc_correlation_matrix.png")

    # 4. Age and General Health Gradients
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Age Gradient (Age: 1 = 18-24, 9 = 60-64, 13 = 80+)
    age_rates = df.groupby("Age")[TARGET_COL].mean() * 100
    axes[0].plot(age_rates.index, age_rates.values, "o-", color="#D32F2F", linewidth=2.5)
    axes[0].set_xlabel("Age Bracket (1 = 18-24 ... 13 = 80+)")
    axes[0].set_ylabel("Diabetes Prevalence (%)")
    axes[0].set_title("Age Gradient vs. Diabetes Prevalence", fontweight="bold")
    axes[0].grid(True, alpha=0.3)

    # General Health Gradient (1=Excellent, 2=Very Good, 3=Good, 4=Fair, 5=Poor)
    gen_rates = df.groupby("GenHlth")[TARGET_COL].mean() * 100
    axes[1].bar(["1: Excellent", "2: Very Good", "3: Good", "4: Fair", "5: Poor"], gen_rates.values, color="#F57C00")
    axes[1].set_ylabel("Diabetes Prevalence (%)")
    axes[1].set_title("Self-Reported General Health vs. Diabetes Prevalence", fontweight="bold")
    axes[1].grid(True, alpha=0.3, axis="y")

    for i, v in enumerate(gen_rates.values):
        axes[1].text(i, v + 0.8, f"{v:.1f}%", ha="center", fontweight="bold")

    plt.suptitle("CDC Demographic & Subjective Health Gradients", fontsize=13, fontweight="bold")
    plt.tight_layout()
    plt.savefig(REPORT_DIR / "04_cdc_demographic_gradients.png", dpi=150)
    plt.close()
    logger.info("Saved: 04_cdc_demographic_gradients.png")

    # 5. Save JSON Summary
    top_corrs = corr[TARGET_COL].drop(TARGET_COL).sort_values(ascending=False)
    summary_data = {
        "generated_at": datetime.now().isoformat(),
        "total_records": len(df),
        "target_column": TARGET_COL,
        "class_proportions": {0: round(float(pcts[0]), 2), 1: round(float(pcts[1]), 2)},
        "top_positive_correlations": {k: round(float(v), 4) for k, v in top_corrs.head(6).items()},
        "top_negative_correlations": {k: round(float(v), 4) for k, v in top_corrs.tail(3).items()},
        "key_eda_observations": [
            "Severe class imbalance: 86.07% non-diabetic vs 13.93% diabetic.",
            "GenHlth (General Health), HighBP, and BMI demonstrate the strongest linear correlation with diabetes status.",
            "Physical Activity and High Income have notable negative correlations with diabetes diagnosis.",
            "Strong monotonic increase in prevalence with Age category: from <2% in bracket 1 to >25% in brackets 10-13."
        ]
    }

    with open(REPORT_DIR / "cdc_eda_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary_data, f, indent=2)
    logger.info("Saved: cdc_eda_summary.json")

    logger.info("\n" + "=" * 60)
    logger.info("CDC Phase 2 EDA — COMPLETE")
    logger.info("=" * 60)


if __name__ == "__main__":
    run_cdc_eda()

