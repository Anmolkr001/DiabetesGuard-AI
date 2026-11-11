"""
DiabetesGuard AI — SQLAlchemy ORM Entities
============================================
Phase 13: Database Models
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
)
from sqlalchemy.orm import relationship

from backend.app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(String(20), default="user")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    track_code = Column(String(30), nullable=False)  # pima_clinical, cdc_lifestyle, uci_symptoms
    model_name = Column(String(100), nullable=False)
    version = Column(String(20), nullable=False)
    algorithm = Column(String(50), nullable=False)
    calibration_method = Column(String(50), default="Sigmoid")
    test_roc_auc = Column(Float, nullable=True)
    test_brier_score = Column(Float, nullable=True)
    test_ece = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    predictions = relationship("Prediction", back_populates="model_version")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assessment_uuid = Column(String(64), unique=True, nullable=False, index=True, default=lambda: str(uuid.uuid4()))
    track_code = Column(String(30), nullable=False, index=True)  # pima_clinical, cdc_lifestyle, uci_symptoms
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")
    features = relationship("AssessmentFeatures", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    prediction = relationship("Prediction", back_populates="assessment", uselist=False, cascade="all, delete-orphan")


class AssessmentFeatures(Base):
    __tablename__ = "assessment_features"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    raw_inputs_json = Column(JSON, nullable=False)
    engineered_inputs_json = Column(JSON, nullable=True)

    assessment = relationship("Assessment", back_populates="features")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    model_version_id = Column(Integer, ForeignKey("model_versions.id", ondelete="SET NULL"), nullable=True)
    calibrated_probability = Column(Float, nullable=False)
    uncalibrated_probability = Column(Float, nullable=True)
    risk_category = Column(String(40), nullable=False)  # 'Low Risk Indicator', 'Moderate Risk Marker', 'Elevated Screening Concern'
    binary_label = Column(Integer, nullable=False)
    disclaimer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    assessment = relationship("Assessment", back_populates="prediction")
    model_version = relationship("ModelVersion", back_populates="predictions")
    explanation = relationship("Explanation", back_populates="prediction", uselist=False, cascade="all, delete-orphan")


class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False, index=True)
    base_value = Column(Float, nullable=True)
    shap_values_json = Column(JSON, nullable=False)
    top_positive_factors = Column(JSON, nullable=True)
    top_negative_factors = Column(JSON, nullable=True)
    explanation_summary = Column(Text, nullable=True)

    prediction = relationship("Prediction", back_populates="explanation")

