# DiabetesGuard AI — Viva & Examination Defense Guide
### Master Reference for Project Presentation and Oral Defense

---

## 1. Project Concept & Motivation

### Q1: What is the core problem DiabetesGuard AI solves?
**Answer:**
Most student machine learning diabetes projects build a simple predictor using the PIMA dataset with raw default classifiers and claim high "accuracy". However, they suffer from critical scientific flaws:
1. **Conflating existing diagnosis with future risk:** Predicting current diabetes from blood glucose is a cross-sectional screening task, not a longitudinal future-risk forecast.
2. **Uncalibrated probabilities:** Modern algorithms (e.g. Random Forest or XGBoost) output uncalibrated scores that do not reflect empirical disease frequencies.
3. **Data leakage:** Imputing or scaling before train/test splits leads to optimistic, ungeneralizable metrics.
4. **Lack of Explainability:** Clinicians cannot trust "black box" decisions without understanding why a prediction was made.

DiabetesGuard AI addresses every one of these issues by implementing a multi-track, calibrated, leak-free, explainable platform.

---

## 2. Machine Learning Methodology

### Q2: Why did you use three separate datasets?
**Answer:**
Each dataset represents a completely different clinical scenario:
- **PIMA Indians Dataset (Clinical Lab):** 8 invasive laboratory measurements (OGTT 2-hr glucose, insulin, etc.). Used when patient blood test results are available.
- **CDC BRFSS 2015 (Lifestyle Screening):** 21 survey variables (General Health, High BP, physical activity, BMI). Completely non-invasive for population triage where blood draws are not feasible.
- **UCI Early Stage (Acute Symptoms):** Clinical outpatient symptom complaints (Polyuria, Polydipsia, sudden weight loss). Used for acute triage to prompt immediate clinical testing.

### Q3: How did you prevent Data Leakage?
**Answer:**
We enforced a strict boundary between deterministic preprocessing and learned preprocessing:
- **Deterministic Cleaning:** Converting physiologically impossible values (like 0 Glucose, 0 BP, 0 Insulin in PIMA) to `NaN` using documented clinical rules was done prior to splitting because it learns zero parameters from the dataset.
- **Learned Transformations:** Imputation medians, standard scaler means/variances, and RFECV feature selection were **fitted strictly on $X_{train}$** and then applied (transform-only) to the locked test split.
- **Resampling inside Cross-Validation:** Any class weighting or resampling occurred strictly within the training folds of cross-validation via `imblearn.pipeline.Pipeline`.

### Q4: Why Stacking Ensemble Learning?
**Answer:**
Stacking leverages multiple distinct functional forms:
- Linear boundary: **Logistic Regression** (L2)
- Bagged orthogonal axis splits: **Random Forest**
- Sequential gradient boosting: **XGBoost**
- Maximum margin hyperplane in Hilbert space: **SVM (RBF Kernel)**

To prevent leakage, the base models generated **out-of-fold probability predictions** across 5 folds. The meta-model (L2 Logistic Regression) was trained strictly on these out-of-fold vectors. On the locked test set, Stacking achieved an **ROC-AUC of 0.8144** and balanced generalization.

---

## 3. Probability Calibration & Explainability

### Q5: What is Probability Calibration and why is it essential in healthcare?
**Answer:**
A model is well-calibrated if, among instances predicted to have a risk $p$, the empirical fraction of positives is approximately $p$. Uncalibrated models produce overconfident extremes.
We implemented **Sigmoid (Platt Scaling)** calibration:
$$\hat{P}(Y=1 | f(x)) = \frac{1}{1 + \exp(A \cdot f(x) + B)}$$
Evaluated using:
- **Brier Score:** Mean squared difference between predicted probabilities and actual binary outcomes: $\frac{1}{N} \sum (\hat{p}_i - y_i)^2$.
- **Expected Calibration Error (ECE):** Weighted average gap between bin confidence and bin accuracy across 10 probability intervals.
Sigmoid calibration reduced PIMA ECE from **0.1015 to 0.0505** (a 50.2% improvement).

### Q6: How does SHAP work in this platform?
**Answer:**
SHAP (SHapley Additive exPlanations) is grounded in cooperative game theory. It calculates the unique, additive marginal contribution of each feature to the model's prediction:
$$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i$$
Where $\phi_0$ is the baseline expected value, and $\phi_i$ is the feature attribution.
- In our PIMA pipeline, **Glucose** ($\phi = 0.6526$), **BMI-Age Interaction** ($\phi = 0.2998$), and **BMI** ($\phi = 0.2087$) were the top positive contributors.
- **Crucial Viva Note:** SHAP explains **statistical attribution to the model**, not medical etiology or clinical causation.

---

## 4. Subgroup Fairness & Disparities

### Q7: What did your Fairness Audit reveal?
**Answer:**
We audited the calibrated model across demographic subgroups on the locked test set:
- **Age Disparity ($<35$ vs $\ge 35$):**
  - Younger cohort sensitivity was $38.46\%$, while older cohort sensitivity was $75.00\%$. The older cohort also experienced higher False Positive Rates ($34.6\%$ vs $13.5\%$) due to higher baseline prevalence ($51.8\%$ vs $26.0\%$).
- **BMI Disparity ($<30$ vs $\ge 30$):**
  - Obese individuals had a recall of $65.91\%$, while non-obese individuals had a recall of only $20.00\%$.
- **Clinical Conclusion:** Because classifiers rely heavily on adiposity and age as risk proxies, non-obese young patients with diabetes risk being missed if discrete binary cutoffs are used. This proves why screening platforms must provide **calibrated continuous risk bands and confidence intervals**, not simplistic binary labels.

---

## 5. Software Architecture & Implementation

### Q8: Describe your technical stack and system architecture.
**Answer:**
- **Frontend:** React 18 with Tailwind CSS, Lucide icons, and Recharts for interactive risk gauges and SHAP waterfall charts.
- **Backend:** FastAPI with Pydantic v2 data validation schemas, enforcing type safety and range boundaries on all medical inputs.
- **Persistence:** Relational database schema with SQLAlchemy ORM, managing `users`, `assessments`, `predictions`, `explanations`, and `model_versions`.
- **Testing:** Pytest with HTTPX AsyncClient and ASGITransport for automated end-to-end endpoint verification.

