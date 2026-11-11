# DiabetesGuard AI — Final Year B.Tech Project Report
### An Explainable AI-Based Diabetes Risk Assessment and Screening System

**Degree:** Bachelor of Technology in Information Technology  
**Academic Year:** 2025–2026  
**Document Classification:** Comprehensive Engineering & Research Project Report  

---

## 1. Introduction & Background
Diabetes mellitus is a global metabolic epidemic characterized by chronic hyperglycemia resulting from defects in insulin secretion, insulin action, or both. Early detection and risk stratification are paramount to preventing irreversible microvascular and macrovascular complications, including nephropathy, retinopathy, neuropathy, and cardiovascular disease.

While machine learning has gained widespread attention in medical informatics, typical student and introductory projects suffer from severe methodological pitfalls:
1. **Conflating Existing Disease Status with Future Risk:** Existing status classification analyzes current clinical laboratory tests, lifestyle questionnaires, or acute symptoms to identify undetected active disease. In contrast, genuine prospective risk prediction requires longitudinal tracking of disease-free cohorts across multi-year intervals.
2. **Uncalibrated Model Confidence:** Standard classifiers minimize cross-entropy or Gini impurity, yielding uncalibrated probability scores that distort clinical triage.
3. **Data Leakage in Feature Pipelines:** Normalizing or imputing data prior to train/test splitting inflates validation metrics.
4. **Opaque Decisions:** Clinicians and patients cannot safely act on "black box" decisions lacking interpretable feature attribution.

**DiabetesGuard AI** addresses these gaps by establishing a scientifically sound, leak-free, explainable, and multi-track screening system.

---

## 2. Methodology & Multi-Track Architecture

### 2.1 Dataset Strategy & Task Isolation
To avoid the fallacy of forcing disparate healthcare contexts into an artificial unified feature space, the platform maintains three dedicated screening modules:

1. **Track 1: Clinical Laboratory Diagnostic Model (PIMA Indians Dataset, N=768)**
   - *Invasiveness:* Invasive (Laboratory venous blood draws).
   - *Features:* Fasting / 2-hr OGTT plasma glucose, 2-hr serum insulin, diastolic blood pressure, triceps skinfold thickness, BMI, pedigree function, age, pregnancies.
   - *Modeling:* Stacking Ensemble (Logistic Regression, Random Forest, XGBoost, Support Vector Machine) with Platt Sigmoid probability calibration.
   - *Explainability:* Real-time local SHAP TreeExplainer attribution.

2. **Track 2: Non-Invasive Lifestyle Screener (CDC BRFSS 2015, N=253,680)**
   - *Invasiveness:* Completely Non-Invasive (Public health telephone survey).
   - *Features:* Self-reported General Health, High BP, High Cholesterol, BMI, Physical Activity, Smoking history, Diet, Demographics (Age bracket, Income, Education).
   - *Modeling:* Calibrated XGBoost with cost-sensitive class weighting to resolve the 6.18:1 severe negative-to-positive imbalance.

3. **Track 3: Acute Symptom Triage Screener (UCI Early Stage Dataset, N=520)**
   - *Invasiveness:* Non-Invasive (Symptom intake questionnaire).
   - *Features:* Polyuria, Polydipsia, Sudden Weight Loss, Polyphagia, Weakness, Genital Thrush, Blurry Vision, Itching.
   - *Scientific Finding:* Classic osmotic symptoms (polyuria, polydipsia) are physiological consequences of active hyperglycemia rather than pre-disease risk factors.

---

## 3. Data Leakage Prevention & Engineering Standards
1. **Deterministic Preprocessing:** Domain-driven conversion of impossible measurements (0 Glucose, 0 BP, 0 Insulin) into missing values was performed before splitting, as it learns zero dataset statistics.
2. **Learned Transformations:** Median imputers, StandardScalers, and RFECV feature selection algorithms were fitted exclusively on the 80% training partition ($X_{train}$) and transformed onto the locked 20% test partition ($X_{test}$).
3. **Resampling Control:** Any oversampling or class re-weighting was conducted strictly within cross-validation folds using `imblearn.pipeline.Pipeline`.

---

## 4. Experimental Results & Benchmarks

### 4.1 Locked Test Set Discrimination Metrics
| Model Track | Locked Test N | ROC-AUC | PR-AUC | Balanced Accuracy | Brier Score | ECE |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Track 1: Calibrated Stacking (PIMA)** | 154 | **0.8144** | **0.7054** | **0.6920** | **0.1698** | **0.0653** |
| Track 1: Tuned Random Forest | 154 | 0.8163 | 0.7093 | 0.7354 | 0.1700 | 0.0702 |
| Track 1: Tuned XGBoost | 154 | 0.8094 | 0.6921 | 0.7717 | 0.1751 | 0.1009 |
| **Track 2: Calibrated XGBoost (CDC)** | 50,736 | **0.8273** | **0.4243** | **0.5600** | **0.0975** | **0.0077** |
| **Track 3: Calibrated Random Forest (UCI)**| 104 | **0.9996** | **0.9998** | **0.9844** | **0.0211** | **0.0150** |

### 4.2 Probability Calibration Impact
Applying Sigmoid (Platt Scaling) calibration to the Stacking model reduced Expected Calibration Error (ECE) from **0.1015 to 0.0505**, a **50.2% improvement**, ensuring that an estimated probability of 70% reflects an empirical 7-in-10 outcome probability in patient cohorts.

### 4.3 Subgroup Fairness Audit
Audit on the locked PIMA test set highlighted critical disparities:
- **Age Disparity:** Older individuals ($\ge 35\text{y}$) exhibited higher recall ($75.0\%$) and higher False Positive Rates ($34.6\%$) compared to younger cohorts ($38.5\%$ recall, $13.5\%$ FPR).
- **BMI Disparity:** Obese individuals ($BMI \ge 30$) experienced $65.9\%$ sensitivity versus $20.0\%$ in non-obese individuals.
- **Clinical Implication:** Relying on binary diagnostic labels would systematically under-screen non-obese, younger individuals who develop metabolic dysfunction. Continuous calibrated risk bands with confidence intervals mitigate this bias.

---

## 5. Software & Database Engineering
- **FastAPI Backend:** Fully asynchronous ASGI service with Pydantic contracts, CORS middleware, JWT authentication, and automated OpenAPI documentation.
- **Relational MySQL Database:** Normalized schema managing `users`, `model_versions`, `assessments`, `assessment_features`, `predictions`, and `explanations`.
- **React Frontend:** Interactive healthcare portal featuring custom radial risk gauges, Recharts-based SHAP waterfall bars, audit logs, and technical analytics.

---

## 6. Indian Population Data Availability Limitation
Our research surveyed Indian diabetes datasets, including **ICMR-INDIAB** and the **National Family Health Survey (NFHS)**. While aggregate prevalence data is published, institutionally verified clinical microdata with paired glucose-insulin curves remains restricted under data-sharing agreements. Furthermore, foreign cohorts (such as Pima Native Americans) possess distinct genetic and environmental characteristics and must not be treated as representative of the Indian population. This is explicitly documented as a research limitation and an avenue for future institutional partnership.

---

## 7. Conclusion
DiabetesGuard AI delivers an end-to-end, scientifically defensible healthcare screening system. By combining multi-track task separation, leak-free pipeline architecture, stacking ensembles, probability calibration, and game-theoretic SHAP explainability, this project bridges the critical gap between academic machine learning and responsible clinical communication.

