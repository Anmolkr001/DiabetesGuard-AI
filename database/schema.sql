-- ============================================================
-- DiabetesGuard AI — Database Schema Definition (MySQL)
-- Phase 13: Database Architecture
-- ============================================================

CREATE DATABASE IF NOT EXISTS diabetesguard_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE diabetesguard_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'clinician', 'researcher', 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_username (username)
) ENGINE=InnoDB;

-- 2. Model Versions & Registry
CREATE TABLE IF NOT EXISTS model_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    track_code VARCHAR(30) NOT NULL, -- 'pima_clinical', 'cdc_lifestyle', 'uci_symptoms'
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    calibration_method VARCHAR(50) DEFAULT 'Sigmoid',
    test_roc_auc FLOAT,
    test_brier_score FLOAT,
    test_ece FLOAT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_track_version (track_code, version)
) ENGINE=InnoDB;

-- 3. Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    assessment_uuid VARCHAR(64) NOT NULL UNIQUE,
    track_code VARCHAR(30) NOT NULL, -- 'pima_clinical', 'cdc_lifestyle', 'uci_symptoms'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_assessment_uuid (assessment_uuid),
    INDEX idx_assessment_user (user_id),
    INDEX idx_assessment_track (track_code)
) ENGINE=InnoDB;

-- 4. Assessment Input Features (JSON representation for flexible track schemas)
CREATE TABLE IF NOT EXISTS assessment_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT NOT NULL,
    raw_inputs_json JSON NOT NULL,
    engineered_inputs_json JSON NULL,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    INDEX idx_feat_assessment (assessment_id)
) ENGINE=InnoDB;

-- 5. Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT NOT NULL,
    model_version_id INT NULL,
    calibrated_probability FLOAT NOT NULL,
    uncalibrated_probability FLOAT NULL,
    risk_category VARCHAR(30) NOT NULL, -- 'Low Probability', 'Moderate Attention', 'Elevated Screening Concern'
    binary_label INT NOT NULL,
    disclaimer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (model_version_id) REFERENCES model_versions(id) ON DELETE SET NULL,
    INDEX idx_pred_assessment (assessment_id)
) ENGINE=InnoDB;

-- 6. Explanations Table (SHAP Local Attribution & Top Factors)
CREATE TABLE IF NOT EXISTS explanations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_id INT NOT NULL,
    base_value FLOAT NULL,
    shap_values_json JSON NOT NULL,
    top_positive_factors JSON NULL, -- Top risk-increasing features
    top_negative_factors JSON NULL, -- Top protective / risk-reducing features
    explanation_summary TEXT NULL,
    FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE,
    INDEX idx_exp_prediction (prediction_id)
) ENGINE=InnoDB;

