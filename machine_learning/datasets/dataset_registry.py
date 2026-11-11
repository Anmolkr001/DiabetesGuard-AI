"""
DiabetesGuard AI — Dataset Metadata Registry
=============================================
Central registry of dataset sources, descriptions, limitations,
and expected schema for all three experimental tracks.

This file is the authoritative reference for dataset characteristics.
It must be updated if dataset files or schemas change.
"""

# =============================================================================
# DATASET REGISTRY
# =============================================================================

DATASETS = {
    "pima": {
        "name": "PIMA Indians Diabetes Dataset",
        "source_url": "https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database",
        "original_source": "National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)",
        "license": "CC0: Public Domain (via Kaggle/UCI)",
        "file_name": "diabetes.csv",
        "raw_path": "machine_learning/datasets/raw/pima_diabetes.csv",
        "cleaned_path": "machine_learning/datasets/deterministic_cleaned/pima_cleaned.csv",
        "n_records": 768,
        "n_features": 8,
        "target_column": "Outcome",
        "target_type": "binary",
        "target_description": {
            0: "No diabetes diagnosis",
            1: "Diabetes diagnosis (positive test result)"
        },
        "task": "EXISTING STATUS CLASSIFICATION — not future risk prediction",
        "population": "Women of Pima Indian heritage, aged 21 and above",
        "features": {
            "Pregnancies": {
                "dtype": "int",
                "unit": "count",
                "range": (0, 20),
                "description": "Number of times pregnant",
                "domain_note": "Physiologically improbable values above ~20"
            },
            "Glucose": {
                "dtype": "float",
                "unit": "mg/dL",
                "range": (0, 300),
                "description": "Plasma glucose concentration at 2 hours in an oral glucose tolerance test",
                "zero_invalid": True,
                "domain_note": "Zero glucose is physiologically impossible for a living subject; indicates missing data"
            },
            "BloodPressure": {
                "dtype": "float",
                "unit": "mm Hg",
                "range": (0, 200),
                "description": "Diastolic blood pressure",
                "zero_invalid": True,
                "domain_note": "Zero blood pressure is physiologically impossible; indicates missing data"
            },
            "SkinThickness": {
                "dtype": "float",
                "unit": "mm",
                "range": (0, 100),
                "description": "Triceps skinfold thickness",
                "zero_invalid": True,
                "domain_note": "Zero skin thickness is physiologically implausible; likely missing data"
            },
            "Insulin": {
                "dtype": "float",
                "unit": "mu U/ml",
                "range": (0, 1000),
                "description": "2-Hour serum insulin",
                "zero_invalid": True,
                "domain_note": "Zero insulin may indicate missing data or true physiological zero — context-dependent"
            },
            "BMI": {
                "dtype": "float",
                "unit": "kg/m^2",
                "range": (0, 70),
                "description": "Body mass index",
                "zero_invalid": True,
                "domain_note": "Zero BMI is physically impossible; indicates missing data"
            },
            "DiabetesPedigreeFunction": {
                "dtype": "float",
                "unit": "score",
                "range": (0.0, 3.0),
                "description": "Diabetes pedigree function (genetic family history score)",
                "domain_note": "Computed score; no known hard clinical limits but very high values are rare"
            },
            "Age": {
                "dtype": "int",
                "unit": "years",
                "range": (21, 100),
                "description": "Age of the subject",
                "domain_note": "Dataset is restricted to subjects aged 21+"
            }
        },
        "known_limitations": [
            "Population is restricted to Pima Indian women aged 21+. Results may not generalise to other populations.",
            "Zeros in Glucose, BloodPressure, SkinThickness, Insulin, and BMI almost certainly represent missing values, not true zero measurements.",
            "Class imbalance: approximately 65% negative, 35% positive.",
            "No temporal information: this is a cross-sectional classification of diabetes status at time of measurement.",
            "Cannot be used to predict future onset of diabetes without longitudinal follow-up data.",
            "Dataset is small (768 records) which limits statistical power of subgroup analyses.",
            "No information on medication use, prior diagnosis, or treatment history.",
            "DiabetesPedigreeFunction is a compound computed score — exact calculation methodology is not fully documented."
        ],
        "ethical_notes": [
            "Results from this dataset must NOT be generalised as representative of the Indian population.",
            "The model trained on this data is a research prototype and NOT a clinical diagnostic tool.",
            "Any probability estimates carry uncertainty and must be communicated with appropriate caveats."
        ]
    },

    "cdc": {
        "name": "CDC Diabetes Health Indicators Dataset",
        "source_url": "https://archive.ics.uci.edu/dataset/891/cdc+diabetes+health+indicators",
        "original_source": "Behavioral Risk Factor Surveillance System (BRFSS) 2015 Survey, CDC",
        "license": "CC BY 4.0",
        "file_name": "diabetes_binary_health_indicators_BRFSS2015.csv",
        "raw_path": "machine_learning/datasets/raw/cdc_diabetes_health_indicators.csv",
        "cleaned_path": "machine_learning/datasets/deterministic_cleaned/cdc_cleaned.csv",
        "n_records": "~253680 (verify after loading)",
        "n_features": 21,
        "target_column": "Diabetes_binary",
        "target_type": "binary",
        "target_description": {
            0: "No diabetes or prediabetes",
            1: "Diabetes (may include prediabetes depending on file variant — VERIFY)"
        },
        "task": "EXISTING STATUS CLASSIFICATION — survey-based, non-invasive indicators",
        "population": "US adult survey respondents (BRFSS 2015)",
        "investigation_required": [
            "Confirm target variable definition across the three available file variants.",
            "Determine whether prediabetes is merged into the positive class.",
            "Investigate class imbalance — the binary version may be balanced differently than the 3-class version.",
            "Investigate duplicate rows — BRFSS surveys may legitimately produce identical response patterns.",
            "Review survey methodology for self-report bias.",
            "Verify feature definitions against BRFSS codebook."
        ],
        "known_limitations": [
            "Self-reported survey data introduces recall bias and social desirability bias.",
            "Diabetes status is self-reported, not clinically verified.",
            "Population is limited to US adults with phone access (survey mode).",
            "Results may not generalise to populations without similar healthcare or survey infrastructure.",
            "Cannot be used for future risk prediction without longitudinal follow-up.",
            "Prediabetes classification may differ from clinical definitions used in other contexts."
        ]
    },

    "uci_early": {
        "name": "UCI Early Stage Diabetes Risk Prediction Dataset",
        "source_url": "https://archive.ics.uci.edu/dataset/529/early+stage+diabetes+risk+prediction+dataset",
        "original_source": "Collected via direct questionnaires at Sylhet Diabetes Hospital, Bangladesh",
        "license": "CC BY 4.0",
        "file_name": "diabetes_data_upload.csv",
        "raw_path": "machine_learning/datasets/raw/uci_early_diabetes.csv",
        "cleaned_path": "machine_learning/datasets/deterministic_cleaned/uci_early_cleaned.csv",
        "n_records": 520,
        "n_features": 16,
        "target_column": "class",
        "target_type": "binary",
        "target_description": {
            "Positive": "Diabetes diagnosis (positive)",
            "Negative": "No diabetes diagnosis (negative)"
        },
        "task": "SYMPTOM-BASED STATUS CLASSIFICATION — independent experimental track only",
        "population": "Patients at Sylhet Diabetes Hospital, Bangladesh",
        "critical_warnings": [
            "SYMPTOM CIRCULARITY WARNING: Many symptoms in this dataset (polyuria, polydipsia, sudden weight loss) are CONSEQUENCES of existing diabetes, not independent risk factors.",
            "This dataset CANNOT be used as a genuine early-warning or future-risk prediction tool.",
            "A model trained on this data captures the relationship between symptoms and existing diabetes status.",
            "Must be kept as a SEPARATE experimental track and must NOT be compared directly to PIMA or CDC models.",
            "The dataset name 'Early Stage Diabetes Risk Prediction' is misleading — treat it as symptom-status classification."
        ],
        "known_limitations": [
            "Small dataset (520 records) with high class imbalance (approximately 61% positive).",
            "Population is limited to hospital patients in Bangladesh — not representative of general population.",
            "Symptom data is self-reported and binary — lacks clinical severity information.",
            "Many symptoms overlap with other conditions and are not diabetes-specific.",
            "Cannot generalise across populations or symptom presentation patterns."
        ]
    }
}

# =============================================================================
# TASK DISTINCTION — CRITICAL RESEARCH NOTE
# =============================================================================

TASK_DISTINCTION_NOTE = """
IMPORTANT DISTINCTION FOR RESEARCH DOCUMENTATION:
==================================================

EXISTING STATUS CLASSIFICATION (implemented in this project):
- Uses current clinical measurements, survey responses, or symptoms.
- Classifies whether a subject currently has or does not have diabetes.
- All three datasets in this project are used for status classification.

FUTURE RISK PREDICTION (NOT implemented — requires longitudinal data):
- Requires repeated measurements over time.
- Requires a defined follow-up period with confirmed outcomes.
- Requires subjects who were diabetes-free at baseline.
- None of the three datasets used in this project are longitudinal.
- Genuine future risk prediction is listed as a future research opportunity.

This distinction must be preserved in all code comments, notebooks,
API responses, frontend display text, and research documentation.
"""

# =============================================================================
# INDIAN POPULATION DATA AVAILABILITY NOTES
# =============================================================================

INDIAN_DATA_NOTES = """
Investigation: Indian Diabetes Dataset Availability
====================================================

Sources investigated:
- ICMR-INDIAB (Indian Council of Medical Research — India Diabetes Study):
  Large-scale cross-sectional study; published aggregate results.
  Individual-level data: Restricted. Requires institutional data-sharing agreement.
  Reference: Anjana RM et al., Lancet Diabetes Endocrinol, 2017.

- NFHS (National Family Health Survey):
  Contains self-reported chronic disease data.
  Individual-level microdata: Publicly available via DHS Program.
  Limitations: Self-reported, not clinical diagnosis; limited diabetes-specific features.

- SPRING India / CINDI:
  Regional clinical studies. Data access typically requires institutional agreement.

- Kaggle Indian Diabetes Datasets:
  Several user-uploaded datasets claim Indian population origin.
  Provenance, collection methodology, and institutional review status are unclear.
  Cannot be used without verified provenance for a research project.

Conclusion:
  No freely available, institutionally verified, individual-level Indian
  diabetes dataset with compatible features was identified for this project.
  
  This is documented as:
  (a) A known research limitation.
  (b) A future-work opportunity — institutional data access agreement required.
  
  PIMA dataset does NOT represent the Indian population and must not be used
  to draw conclusions about Indian-population diabetes risk.
"""

