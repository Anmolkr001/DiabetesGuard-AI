"""
DiabetesGuard AI — Pydantic Schemas
=====================================
Phase 12: Request & Response Data Contracts
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# -------------------------------------------------------------
# 1. PIMA Clinical Input Contract
# -------------------------------------------------------------
class PimaClinicalInput(BaseModel):
    pregnancies: int = Field(..., ge=0, le=25, description="Number of pregnancies (valid count >= 0)")
    glucose: float = Field(..., ge=40, le=350, description="2-hour oral glucose tolerance test plasma glucose (mg/dL)")
    blood_pressure: float = Field(..., ge=30, le=200, description="Diastolic blood pressure (mm Hg)")
    skin_thickness: float = Field(..., ge=5, le=100, description="Triceps skinfold thickness (mm)")
    insulin: float = Field(..., ge=5, le=900, description="2-hour serum insulin (mu U/ml)")
    bmi: float = Field(..., ge=12.0, le=70.0, description="Body Mass Index (kg/m²)")
    diabetes_pedigree: float = Field(..., ge=0.05, le=3.0, description="Diabetes pedigree function score")
    age: int = Field(..., ge=21, le=100, description="Age in years (PIMA cohort restricted to >=21)")
    gender: Optional[str] = Field("female", description="Biological sex ('female' or 'male')")


# -------------------------------------------------------------
# 2. CDC Lifestyle Screening Input Contract
# -------------------------------------------------------------
class CDCLifestyleInput(BaseModel):
    high_bp: int = Field(..., ge=0, le=1, description="High Blood Pressure history: 0=No, 1=Yes")
    high_chol: int = Field(..., ge=0, le=1, description="High Cholesterol history: 0=No, 1=Yes")
    chol_check: int = Field(1, ge=0, le=1, description="Cholesterol checked in past 5 years: 0=No, 1=Yes")
    bmi: float = Field(..., ge=12.0, le=75.0, description="Body Mass Index (kg/m²)")
    smoker: int = Field(..., ge=0, le=1, description="Smoked >=100 cigarettes in lifetime: 0=No, 1=Yes")
    stroke: int = Field(0, ge=0, le=1, description="History of stroke: 0=No, 1=Yes")
    heart_disease: int = Field(0, ge=0, le=1, description="Coronary heart disease or myocardial infarction: 0=No, 1=Yes")
    phys_activity: int = Field(..., ge=0, le=1, description="Physical activity in past 30 days: 0=No, 1=Yes")
    fruits: int = Field(1, ge=0, le=1, description="Consumes fruit >=1 time/day: 0=No, 1=Yes")
    veggies: int = Field(1, ge=0, le=1, description="Consumes vegetables >=1 time/day: 0=No, 1=Yes")
    heavy_alcohol: int = Field(0, ge=0, le=1, description="Heavy alcohol consumption: 0=No, 1=Yes")
    any_healthcare: int = Field(1, ge=0, le=1, description="Has health care coverage: 0=No, 1=Yes")
    no_doc_cost: int = Field(0, ge=0, le=1, description="Could not see doctor due to cost: 0=No, 1=Yes")
    gen_hlth: int = Field(..., ge=1, le=5, description="Self-reported general health: 1=Excellent, 2=Very Good, 3=Good, 4=Fair, 5=Poor")
    ment_hlth: int = Field(0, ge=0, le=30, description="Days of poor mental health in past 30 days")
    phys_hlth: int = Field(0, ge=0, le=30, description="Days of poor physical health in past 30 days")
    diff_walk: int = Field(0, ge=0, le=1, description="Serious difficulty walking/climbing stairs: 0=No, 1=Yes")
    sex: int = Field(..., ge=0, le=1, description="Biological sex: 0=Female, 1=Male")
    age_bracket: int = Field(..., ge=1, le=13, description="13-level age bracket: 1=18-24, 9=60-64, 13=80+")
    education: int = Field(4, ge=1, le=6, description="Education level: 1=None/Kindergarten to 6=College 4+ yrs")
    income: int = Field(5, ge=1, le=8, description="Income scale: 1=<$10k to 8=>$75k")


# -------------------------------------------------------------
# 3. UCI Symptom Input Contract
# -------------------------------------------------------------
class UCISymptomInput(BaseModel):
    age: int = Field(..., ge=16, le=95, description="Age in years")
    gender: int = Field(..., ge=0, le=1, description="0=Female, 1=Male")
    polyuria: int = Field(..., ge=0, le=1, description="Excessive urination: 0=No, 1=Yes")
    polydipsia: int = Field(..., ge=0, le=1, description="Excessive thirst: 0=No, 1=Yes")
    sudden_weight_loss: int = Field(..., ge=0, le=1, description="Unexplained rapid weight loss: 0=No, 1=Yes")
    weakness: int = Field(0, ge=0, le=1, description="Generalized muscle weakness: 0=No, 1=Yes")
    polyphagia: int = Field(0, ge=0, le=1, description="Excessive hunger: 0=No, 1=Yes")
    genital_thrush: int = Field(0, ge=0, le=1, description="Genital yeast infection: 0=No, 1=Yes")
    visual_blurring: int = Field(0, ge=0, le=1, description="Blurry vision: 0=No, 1=Yes")
    itching: int = Field(0, ge=0, le=1, description="Persistent skin itching: 0=No, 1=Yes")
    irritability: int = Field(0, ge=0, le=1, description="Unusual irritability: 0=No, 1=Yes")
    delayed_healing: int = Field(0, ge=0, le=1, description="Slow wound healing: 0=No, 1=Yes")
    partial_paresis: int = Field(0, ge=0, le=1, description="Muscle weakness / paresis: 0=No, 1=Yes")
    muscle_stiffness: int = Field(0, ge=0, le=1, description="Muscle stiffness: 0=No, 1=Yes")
    alopecia: int = Field(0, ge=0, le=1, description="Hair loss: 0=No, 1=Yes")
    obesity: int = Field(0, ge=0, le=1, description="Clinical obesity diagnosis: 0=No, 1=Yes")


# -------------------------------------------------------------
# 4. Standard Response Schemas
# -------------------------------------------------------------
class FeatureContribution(BaseModel):
    feature: str
    feature_label: str
    value: Any
    contribution: float
    direction: str  # 'increases_risk' or 'decreases_risk'
    clinical_interpretation: str


class PredictionResult(BaseModel):
    assessment_id: str
    track_code: str
    model_name: str
    model_version: str
    calibrated_probability: float
    probability_percentage: float
    risk_category: str  # 'Low Estimated Risk', 'Moderate Screening Concern', 'High Screening Concern'
    binary_label: int
    confidence_interval: Dict[str, float]
    disclaimer: str
    recommended_next_steps: List[str]
    created_at: datetime
    top_contributing_factors: Optional[List[FeatureContribution]] = None
    shap_base_value: Optional[float] = None


class ModelMetricsResponse(BaseModel):
    track_code: str
    model_name: str
    algorithm: str
    test_roc_auc: float
    test_pr_auc: Optional[float] = None
    test_brier_score: Optional[float] = None
    test_ece: Optional[float] = None
    test_accuracy: Optional[float] = None
    test_recall: Optional[float] = None
    test_precision: Optional[float] = None
    training_sample_size: int
    test_sample_size: int
    task_scope: str


class AssessmentHistoryItem(BaseModel):
    assessment_uuid: str
    track_code: str
    calibrated_probability: float
    risk_category: str
    created_at: datetime
    summary: Optional[str] = None


# -------------------------------------------------------------
# 5. Auth & User Schemas
# -------------------------------------------------------------
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    role: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
