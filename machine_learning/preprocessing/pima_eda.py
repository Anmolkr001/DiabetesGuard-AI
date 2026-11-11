"""
DiabetesGuard AI — PIMA Exploratory Data Analysis
===================================================
Phase 2: EDA for the PIMA Indians Diabetes Dataset

Purpose:
  - Comprehensive statistical and visual exploration of the
    deterministically cleaned PIMA dataset.
  - Every finding is documented with a research note.
  - All visualisations are saved to reports/dataset_analysis/pima/.

Inputs:
  - machine_learning/datasets/deterministic_cleaned/pima_cleaned.csv
    (produced by pima_loader.py — zero-encoded NaNs already applied)

Outputs (all saved to reports/dataset_analysis/pima/):
  - 01_class_distribution.png
  - 02_feature_histograms.png
  - 03_feature_boxplots.png
  - 04_correlation_heatmap.png
  - 05_feature_by_outcome.png
  - 06_missing_values_heatmap.png
  - 07_outlier_investigation.png
  - pima_eda_summary.json

Data Leakage Note:
  This script operates ONLY on the cleaned dataset (before any split).
  Statistics computed here are for DOCUMENTATION PURPOSES only.
  No imputation, scaling, or transformation is applied.
  These insights inform preprocessing decisions but do NOT set
  parameters that will be applied to any split.

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
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for file saving
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns

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
# Paths
# ---------------------------------------------------------------------------
CLEANED_FILE = PROJECT_ROOT / "machine_learning" / "datasets" / "deterministic_cleaned" / "pima_cleaned.csv"
REPORT_DIR   = PROJECT_ROOT / "reports" / "dataset_analysis" / "pima"

# ---------------------------------------------------------------------------
# Style constants
# ---------------------------------------------------------------------------
PALETTE_BINARY = {0: "#2196F3", 1: "#F44336"}   # Blue = no diabetes, Red = diabetes
LABEL_MAP      = {0: "No Diabetes (0)", 1: "Diabetes (1)"}
FEATURE_COLS   = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
]
TARGET_COL = "Outcome"

# Feature units for axis labels
FEATURE_UNITS = {
    "Pregnancies":              "count",
    "Glucose":                  "mg/dL",
    "BloodPressure":            "mm Hg",
    "SkinThickness":            "mm",
    "Insulin":                  "mu U/ml",
    "BMI":                      "kg/m²",
    "DiabetesPedigreeFunction": "score",
    "Age":                      "years",
}


def set_plot_style():
    """Apply a consistent, clean plot style throughout EDA."""
    sns.set_theme(style="whitegrid", context="paper", font_scale=1.1)
    plt.rcParams.update({
        "figure.dpi":        150,
        "savefig.dpi":       150,
        "savefig.bbox":      "tight",
        "axes.titlesize":    13,
        "axes.labelsize":    11,
        "xtick.labelsize":   9,
        "ytick.labelsize":   9,
        "legend.fontsize":   9,
        "figure.facecolor":  "white",
        "axes.facecolor":    "white",
    })


# =============================================================================
# PLOT 1 — Class Distribution
# =============================================================================
def plot_class_distribution(df: pd.DataFrame, save_path: Path):
    """
    Show class balance in the target variable (Outcome).
    Research note: Class imbalance affects model training and threshold selection.
    """
    fig, axes = plt.subplots(1, 2, figsize=(10, 4))

    counts = df[TARGET_COL].value_counts().sort_index()
    labels = [LABEL_MAP[k] for k in counts.index]
    colors = [PALETTE_BINARY[k] for k in counts.index]

    # Bar chart
    bars = axes[0].bar(labels, counts.values, color=colors, edgecolor="white", linewidth=1.5)
    axes[0].set_title("Class Distribution — Absolute Counts", fontweight="bold")
    axes[0].set_xlabel("Diabetes Status")
    axes[0].set_ylabel("Number of Records")
    for bar, val in zip(bars, counts.values):
        axes[0].text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 5,
                     str(val), ha="center", va="bottom", fontweight="bold")

    # Pie chart
    pcts = df[TARGET_COL].value_counts(normalize=True).sort_index() * 100
    axes[1].pie(
        pcts.values,
        labels=[f"{LABEL_MAP[k]}\n({v:.1f}%)" for k, v in zip(pcts.index, pcts.values)],
        colors=colors,
        startangle=90,
        wedgeprops={"edgecolor": "white", "linewidth": 2},
        textprops={"fontsize": 10}
    )
    axes[1].set_title("Class Distribution — Proportions", fontweight="bold")

    fig.suptitle(
        "PIMA Dataset — Target Variable Distribution\n"
        "(Class 0 = No Diabetes Diagnosis | Class 1 = Diabetes Diagnosis)",
        fontsize=12, fontweight="bold", y=1.02
    )

    # Research annotation
    fig.text(0.5, -0.04,
             "Note: ~65% negative class vs ~35% positive class — moderate class imbalance.\n"
             "Class weighting or resampling strategies should be evaluated during model training.",
             ha="center", fontsize=9, style="italic", color="#555555")

    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    logger.info(f"Saved: {save_path.name}")


# =============================================================================
# PLOT 2 — Feature Histograms (with NaN note)
# =============================================================================
def plot_feature_histograms(df: pd.DataFrame, save_path: Path):
    """
    Distribution histograms for all 8 features, split by class.
    NaN values (from zero-correction) are excluded from the histogram
    but their count is annotated on each subplot.
    """
    fig, axes = plt.subplots(2, 4, figsize=(18, 9))
    axes = axes.flatten()

    for i, col in enumerate(FEATURE_COLS):
        ax = axes[i]
        unit = FEATURE_UNITS.get(col, "")
        n_missing = int(df[col].isnull().sum())

        for outcome, grp in df.groupby(TARGET_COL):
            vals = grp[col].dropna()
            ax.hist(
                vals, bins=25, alpha=0.6,
                color=PALETTE_BINARY[outcome],
                label=LABEL_MAP[outcome],
                edgecolor="white", linewidth=0.5
            )

        ax.set_title(f"{col}", fontweight="bold")
        ax.set_xlabel(unit if unit else col)
        ax.set_ylabel("Count")
        ax.legend(fontsize=8)

        if n_missing > 0:
            ax.text(0.98, 0.95,
                    f"Missing: {n_missing}",
                    transform=ax.transAxes,
                    ha="right", va="top",
                    fontsize=8, color="#E53935",
                    bbox={"boxstyle": "round,pad=0.3", "fc": "#FFEBEE", "ec": "#E53935", "alpha": 0.8})

    fig.suptitle(
        "PIMA Dataset — Feature Distributions by Diabetes Status\n"
        "(Red = Diabetes | Blue = No Diabetes | Missing values excluded from plot)",
        fontsize=13, fontweight="bold"
    )
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    logger.info(f"Saved: {save_path.name}")


# =============================================================================
# PLOT 3 — Feature Box Plots
# =============================================================================
def plot_feature_boxplots(df: pd.DataFrame, save_path: Path):
    """
    Box plots for each feature grouped by Outcome.
    Useful for identifying separation between classes and potential outliers.
    """
    fig, axes = plt.subplots(2, 4, figsize=(18, 9))
    axes = axes.flatten()

    df_plot = df.copy()
    df_plot["Diabetes Status"] = df_plot[TARGET_COL].map(LABEL_MAP)

    for i, col in enumerate(FEATURE_COLS):
        ax = axes[i]
        unit = FEATURE_UNITS.get(col, "")

        sns.boxplot(
            data=df_plot,
            x="Diabetes Status", y=col,
            hue="Diabetes Status",
            palette={v: PALETTE_BINARY[k] for k, v in LABEL_MAP.items()},
            order=[LABEL_MAP[0], LABEL_MAP[1]],
            legend=False,
            linewidth=1.2, fliersize=3,
            ax=ax
        )
        ax.set_title(f"{col}", fontweight="bold")
        ax.set_xlabel("")
        ax.set_ylabel(f"{col} ({unit})" if unit else col)
        ax.tick_params(axis="x", labelsize=8)

    fig.suptitle(
        "PIMA Dataset — Feature Box Plots by Diabetes Status\n"
        "(Outliers shown as individual points | NaN values excluded)",
        fontsize=13, fontweight="bold"
    )
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    logger.info(f"Saved: {save_path.name}")


# =============================================================================
# PLOT 4 — Correlation Heatmap
# =============================================================================
def plot_correlation_heatmap(df: pd.DataFrame, save_path: Path):
    """
    Pearson correlation matrix for all numeric features + target.
    Note: Correlations are computed on the cleaned dataset BEFORE imputation.
    Records with NaN values are excluded pairwise.
    This is for EDA documentation only — not used to drive feature removal.
    """
    numeric_cols = FEATURE_COLS + [TARGET_COL]
    corr_matrix = df[numeric_cols].corr(method="pearson")

    fig, ax = plt.subplots(figsize=(10, 8))

    mask = np.triu(np.ones_like(corr_matrix, dtype=bool), k=1)

    sns.heatmap(
        corr_matrix,
        annot=True, fmt=".2f",
        cmap="RdBu_r", center=0,
        vmin=-1, vmax=1,
        linewidths=0.5,
        square=True,
        ax=ax,
        cbar_kws={"shrink": 0.8, "label": "Pearson r"}
    )

    ax.set_title(
        "PIMA Dataset — Pearson Correlation Matrix\n"
        "(Features + Target | Computed pairwise, NaN excluded)",
        fontsize=12, fontweight="bold", pad=15
    )
    ax.set_xticklabels(ax.get_xticklabels(), rotation=45, ha="right")
    ax.set_yticklabels(ax.get_yticklabels(), rotation=0)

    fig.text(0.5, -0.02,
             "Research note: Correlation does not imply causation. "
             "Medically relevant features are retained regardless of low correlation with the target.",
             ha="center", fontsize=9, style="italic", color="#555555")

    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    logger.info(f"Saved: {save_path.name}")


# =============================================================================
# PLOT 5 — Feature Means by Class (Bar comparison)
# =============================================================================
def plot_feature_by_outcome(df: pd.DataFrame, save_path: Path):
    """
    Mean feature values by Outcome class with 95% CI error bars.
    Gives a quick visual of which features differ most between classes.
    Note: Computed on non-missing values only.
    """
    means  = df.groupby(TARGET_COL)[FEATURE_COLS].mean()
    stderr = df.groupby(TARGET_COL)[FEATURE_COLS].sem()

    fig, axes = plt.subplots(2, 4, figsize=(18, 9))
    axes = axes.flatten()

    for i, col in enumerate(FEATURE_COLS):
        ax = axes[i]
        unit = FEATURE_UNITS.get(col, "")
        x    = [0, 1]
        y    = [means.loc[0, col], means.loc[1, col]]
        err  = [stderr.loc[0, col] * 1.96, stderr.loc[1, col] * 1.96]
        colors = [PALETTE_BINARY[0], PALETTE_BINARY[1]]

        bars = ax.bar(
            [LABEL_MAP[0], LABEL_MAP[1]], y,
            color=colors, edgecolor="white", linewidth=1.5,
            yerr=err, capsize=5, error_kw={"elinewidth": 1.5, "ecolor": "#333"}
        )
        ax.set_title(f"{col}", fontweight="bold")
        ax.set_ylabel(f"Mean ({unit})" if unit else "Mean value")
        ax.set_xlabel("")
        ax.tick_params(axis="x", labelsize=8)

        for bar, val in zip(bars, y):
            ax.text(bar.get_x() + bar.get_width() / 2,
                    bar.get_height() + max(err) * 0.1,
                    f"{val:.1f}", ha="center", va="bottom", fontsize=8, fontweight="bold")

    fig.suptitle(
        "PIMA Dataset — Mean Feature Values by Diabetes Status\n"
        "(Error bars = 95% CI | Computed on non-missing values only)",
        fontsize=13, fontweight="bold"
    )
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    logger.info(f"Saved: {save_path.name}")


# =============================================================================
# PLOT 6 — Missing Values Heatmap
# =============================================================================
def plot_missing_values(df: pd.DataFrame, save_path: Path):
    """
    Visualise missingness pattern across features.
    Shows which records have missing values and in which features.
    Important for guiding imputation strategy (which is applied only on training data).
    """
    missing_flags = df[FEATURE_COLS].isnull().astype(int)
    missing_pct   = (df[FEATURE_COLS].isnull().sum() / len(df) * 100).round(1)

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Heatmap of missingness pattern (sample of 200 rows for visibility)
    sample = missing_flags.sample(min(200, len(missing_flags)), random_state=42)
    sns.heatmap(
        sample.T,
        cmap=["#E8F5E9", "#E53935"],
        cbar=False,
        linewidths=0, ax=axes[0],
        yticklabels=FEATURE_COLS
    )
    axes[0].set_title("Missingness Pattern (200-record sample)\nRed = Missing | Green = Present",
                       fontweight="bold")
    axes[0].set_xlabel("Sample records")
    axes[0].set_ylabel("Feature")

    # Bar chart of missing percentages
    bars = axes[1].barh(
        list(missing_pct.index),
        list(missing_pct.values),
        color=["#E53935" if v > 0 else "#4CAF50" for v in missing_pct.values],
        edgecolor="white"
    )
    axes[1].set_title("Missing Value Percentage per Feature\n(After zero→NaN conversion)",
                       fontweight="bold")
    axes[1].set_xlabel("Missing (%)")
    axes[1].set_xlim(0, 60)
    for bar, val in zip(bars, missing_pct.values):
        axes[1].text(val + 0.5, bar.get_y() + bar.get_height() / 2,
                     f"{val}%", va="center", fontsize=9, fontweight="bold")

    fig.suptitle(
        "PIMA Dataset — Missing Value Analysis\n"
        "(NaN values represent physiologically invalid zeros — see dataset registry)",
        fontsize=12, fontweight="bold"
    )
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    logger.info(f"Saved: {save_path.name}")


# =============================================================================
# PLOT 7 — Outlier Investigation
# =============================================================================
def plot_outlier_investigation(df: pd.DataFrame, save_path: Path):
    """
    Z-score-based outlier investigation (for documentation only).

    IMPORTANT: This chart is for EDA documentation only.
    Outlier removal decisions require domain justification.
    Z-score thresholds here are DESCRIPTIVE — not prescriptive.
    No records are removed in this script.
    Outlier handling (if any) is deferred to the training pipeline.
    """
    fig, axes = plt.subplots(2, 4, figsize=(18, 9))
    axes = axes.flatten()

    for i, col in enumerate(FEATURE_COLS):
        ax = axes[i]
        unit = FEATURE_UNITS.get(col, "")
        col_data = df[col].dropna()

        mean_val = col_data.mean()
        std_val  = col_data.std()
        z_scores = np.abs((col_data - mean_val) / std_val)

        n_mild     = int((z_scores > 2).sum())
        n_extreme  = int((z_scores > 3).sum())

        ax.scatter(range(len(col_data)), col_data.values,
                   c=["#E53935" if z > 3 else "#FF9800" if z > 2 else "#90CAF9"
                      for z in z_scores],
                   s=8, alpha=0.6)

        ax.axhline(mean_val + 2 * std_val, color="#FF9800", linewidth=1, linestyle="--", label="|z|>2")
        ax.axhline(mean_val - 2 * std_val, color="#FF9800", linewidth=1, linestyle="--")
        ax.axhline(mean_val + 3 * std_val, color="#E53935", linewidth=1, linestyle="--", label="|z|>3")
        ax.axhline(mean_val - 3 * std_val, color="#E53935", linewidth=1, linestyle="--")

        ax.set_title(f"{col}\n|z|>2: {n_mild}  |z|>3: {n_extreme}", fontweight="bold", fontsize=10)
        ax.set_xlabel("Record index")
        ax.set_ylabel(f"{unit}" if unit else col)
        ax.legend(fontsize=7, loc="upper right")

    fig.suptitle(
        "PIMA Dataset — Outlier Investigation (Z-Score, EDA Only)\n"
        "Orange = |z|>2 | Red = |z|>3 | Note: No records are removed — domain review required",
        fontsize=12, fontweight="bold"
    )
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    logger.info(f"Saved: {save_path.name}")


# =============================================================================
# EDA Summary Statistics (JSON)
# =============================================================================
def compute_eda_summary(df: pd.DataFrame) -> dict:
    """Compute comprehensive EDA statistics for JSON export."""

    # Per-class statistics
    class_stats = {}
    for outcome in [0, 1]:
        subset = df[df[TARGET_COL] == outcome][FEATURE_COLS]
        class_stats[str(outcome)] = {
            "label": LABEL_MAP[outcome],
            "n": int((df[TARGET_COL] == outcome).sum()),
            "mean": subset.mean().round(3).to_dict(),
            "std":  subset.std().round(3).to_dict(),
            "median": subset.median().round(3).to_dict(),
            "min":  subset.min().round(3).to_dict(),
            "max":  subset.max().round(3).to_dict(),
        }

    # Missing value analysis
    missing_analysis = {}
    for col in FEATURE_COLS:
        n_miss = int(df[col].isnull().sum())
        missing_analysis[col] = {
            "n_missing": n_miss,
            "pct_missing": round(n_miss / len(df) * 100, 2)
        }

    # Outlier counts (z-score, for documentation)
    outlier_analysis = {}
    for col in FEATURE_COLS:
        col_data = df[col].dropna()
        z = np.abs((col_data - col_data.mean()) / col_data.std())
        outlier_analysis[col] = {
            "n_mild_outliers_z2":    int((z > 2).sum()),
            "n_extreme_outliers_z3": int((z > 3).sum()),
            "note": "EDA documentation only. No removal performed. Domain review required."
        }

    # Correlations with target
    corr_with_target = df[FEATURE_COLS + [TARGET_COL]].corr(method="pearson")[TARGET_COL].drop(TARGET_COL)

    return {
        "generated_at": datetime.now().isoformat(),
        "dataset": "PIMA Indians Diabetes Dataset (Deterministically Cleaned)",
        "phase": "Phase 2 — Exploratory Data Analysis",
        "n_records": int(len(df)),
        "n_features": len(FEATURE_COLS),
        "target_column": TARGET_COL,
        "class_distribution": {
            "counts": df[TARGET_COL].value_counts().sort_index().to_dict(),
            "percentages": (df[TARGET_COL].value_counts(normalize=True).sort_index() * 100).round(2).to_dict()
        },
        "overall_statistics": df[FEATURE_COLS].describe().round(4).to_dict(),
        "per_class_statistics": class_stats,
        "missing_value_analysis": missing_analysis,
        "outlier_investigation": outlier_analysis,
        "pearson_correlation_with_target": corr_with_target.round(4).to_dict(),
        "research_notes": [
            "Missing values in Glucose, BloodPressure, SkinThickness, Insulin, BMI represent"
            " zero-encoded missing data, converted to NaN in deterministic cleaning.",
            "Glucose and BMI show the strongest positive correlations with the Outcome.",
            "Insulin has the highest missingness rate (~49%) — imputation strategy must be"
            " determined carefully and applied only on training data.",
            "No records were removed during EDA. All cleaning decisions are deferred to the"
            " training pipeline.",
            "Outlier investigation is for documentation purposes only."
            " No outliers were removed based solely on z-score.",
        ]
    }


# =============================================================================
# MAIN
# =============================================================================
def main():
    logger.info("=" * 60)
    logger.info("DiabetesGuard AI — Phase 2: PIMA EDA")
    logger.info("=" * 60)

    # Ensure output directory exists
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    # Load deterministically cleaned dataset
    if not CLEANED_FILE.exists():
        logger.error(
            f"Cleaned file not found: {CLEANED_FILE}\n"
            "Run machine_learning/preprocessing/pima_loader.py first."
        )
        sys.exit(1)

    logger.info(f"Loading cleaned PIMA dataset from: {CLEANED_FILE}")
    df = pd.read_csv(CLEANED_FILE)
    logger.info(f"Loaded {len(df)} rows, {len(df.columns)} columns.")

    set_plot_style()

    # --- Generate all plots ---
    logger.info("\nGenerating EDA visualisations...")

    plot_class_distribution(df, REPORT_DIR / "01_class_distribution.png")
    plot_feature_histograms(df, REPORT_DIR / "02_feature_histograms.png")
    plot_feature_boxplots(df, REPORT_DIR / "03_feature_boxplots.png")
    plot_correlation_heatmap(df, REPORT_DIR / "04_correlation_heatmap.png")
    plot_feature_by_outcome(df, REPORT_DIR / "05_feature_by_outcome.png")
    plot_missing_values(df, REPORT_DIR / "06_missing_values.png")
    plot_outlier_investigation(df, REPORT_DIR / "07_outlier_investigation.png")

    # --- Compute and save EDA summary ---
    logger.info("\nComputing EDA summary statistics...")
    summary = compute_eda_summary(df)

    summary_path = REPORT_DIR / "pima_eda_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, default=str)
    logger.info(f"EDA summary saved to: {summary_path}")

    # --- Print key findings ---
    print("\n" + "=" * 60)
    print("PIMA EDA — KEY FINDINGS")
    print("=" * 60)
    print(f"\nRecords: {summary['n_records']}  |  Features: {summary['n_features']}")
    print(f"\nClass Balance:")
    for cls, cnt in summary["class_distribution"]["counts"].items():
        pct = summary["class_distribution"]["percentages"][cls]
        print(f"  Class {cls}: {cnt} records ({pct}%)")

    print(f"\nMissing Values (after zero→NaN conversion):")
    for col, info in summary["missing_value_analysis"].items():
        if info["n_missing"] > 0:
            print(f"  {col}: {info['n_missing']} ({info['pct_missing']}%)")

    print(f"\nPearson Correlation with Outcome (absolute, descending):")
    corr = summary["pearson_correlation_with_target"]
    for col, val in sorted(corr.items(), key=lambda x: abs(x[1]), reverse=True):
        bar = "█" * int(abs(val) * 20)
        print(f"  {col:<30} {val:+.3f}  {bar}")

    print(f"\nVisualisations saved to: {REPORT_DIR}")
    print(f"\nResearch notes:")
    for note in summary["research_notes"]:
        print(f"  • {note}")

    logger.info("\n" + "=" * 60)
    logger.info("Phase 2 PIMA EDA — COMPLETE")
    logger.info("Next step: Review EDA outputs, then run train/test split (Phase 3)")
    logger.info("=" * 60)

    return df, summary


if __name__ == "__main__":
    df, summary = main()
