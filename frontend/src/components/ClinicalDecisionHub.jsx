import React, { useState } from 'react';
import {
  Stethoscope, HeartPulse, FileText, CheckCircle2, AlertTriangle,
  Activity, ShieldCheck, ChevronRight, HelpCircle, Pill, Utensils,
  Footprints, Clock, ArrowRight, Sparkles, BookOpen, UserCheck
} from 'lucide-react';
import GlassButton from './GlassButton';
import { DiaCareAvatar } from './DiaCareChatbot';

/**
 * ═══════════════════════════════════════════════════════════════════
 * ClinicalDecisionHub Component
 * ═══════════════════════════════════════════════════════════════════
 * Provides 3 core clinical capabilities directly on the Dashboard:
 * 1. Clinical Diagnoses & Evaluation (ADA 2024 & ICMR Criteria)
 * 2. Evidence-Based Medical Advice & Complication Monitoring
 * 3. Comprehensive Multi-Tier Treatment & Care Plans
 */
const ClinicalDecisionHub = () => {
  const [activeTab, setActiveTab] = useState('diagnoses'); // 'diagnoses' | 'advice' | 'treatment'

  // Interactive Diagnostic Evaluator State
  const [fastingGlucose, setFastingGlucose] = useState('');
  const [hba1cVal, setHba1cVal] = useState('');
  const [ogttVal, setOgttVal] = useState('');
  const [hasSymptoms, setHasSymptoms] = useState(false);

  // Compute live diagnostic classification
  const evaluateDiagnosis = () => {
    const f = parseFloat(fastingGlucose);
    const a = parseFloat(hba1cVal);
    const o = parseFloat(ogttVal);

    if (isNaN(f) && isNaN(a) && isNaN(o)) {
      return null;
    }

    // Check for Diabetes thresholds (ADA 2024)
    if (f >= 126 || a >= 6.5 || o >= 200 || (hasSymptoms && (f >= 200 || o >= 200))) {
      return {
        status: 'Type 2 Diabetes Mellitus (T2DM) Criteria Met',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        alertLevel: 'high',
        summary: 'Your submitted lab values meet the established clinical diagnostic thresholds defined by the American Diabetes Association (ADA 2024) and ICMR.',
        criteria: [
          f >= 126 ? `Fasting Plasma Glucose (${f} mg/dL) ≥ 126 mg/dL` : null,
          a >= 6.5 ? `HbA1c (${a}%) ≥ 6.5%` : null,
          o >= 200 ? `2-Hour Oral Glucose Tolerance (${o} mg/dL) ≥ 200 mg/dL` : null,
        ].filter(Boolean),
        nextSteps: 'Clinical confirmation requires a repeat test on a subsequent day (unless unequivocal acute symptoms of hyperglycemia are present). Schedule a confirmatory appointment with your physician.'
      };
    }

    // Check for Pre-Diabetes thresholds
    if ((f >= 100 && f <= 125) || (a >= 5.7 && a <= 6.4) || (o >= 140 && o <= 199)) {
      return {
        status: 'Pre-Diabetes / Impaired Fasting Glucose (IFG)',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        alertLevel: 'moderate',
        summary: 'Your biomarker values are elevated above normal metabolic baselines but have not reached the diagnostic threshold for full diabetes.',
        criteria: [
          (f >= 100 && f <= 125) ? `Fasting Glucose (${f} mg/dL) within 100–125 mg/dL` : null,
          (a >= 5.7 && a <= 6.4) ? `HbA1c (${a}%) within 5.7%–6.4%` : null,
          (o >= 140 && o <= 199) ? `2-Hr OGTT (${o} mg/dL) within 140–199 mg/dL` : null,
        ].filter(Boolean),
        nextSteps: 'High potential for reversal via intensive lifestyle intervention (Medical Nutrition Therapy + 150 min/wk exercise can reduce progression to T2DM by 58%).'
      };
    }

    // Normal
    return {
      status: 'Normal Glycemic Profile (Normoglycemia)',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      alertLevel: 'low',
      summary: 'All provided biomarkers are within healthy metabolic reference ranges established by clinical guidelines.',
      criteria: [
        f < 100 ? `Fasting Glucose (${f} mg/dL) < 100 mg/dL` : null,
        a < 5.7 ? `HbA1c (${a}%) < 5.7%` : null,
        o < 140 ? `2-Hr OGTT (${o} mg/dL) < 140 mg/dL` : null,
      ].filter(Boolean),
      nextSteps: 'Maintain routine annual screening and heart-healthy lifestyle habits.'
    };
  };

  const evalResult = evaluateDiagnosis();

  const handleAskMedoAbout = (prompt) => {
    window.dispatchEvent(new CustomEvent('open-medo'));
    window.dispatchEvent(new CustomEvent('open-diacare'));
  };

  return (
    <section className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all">
      {/* Decorative Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-sky-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header & Feature Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-bold mb-2.5">
            <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
            <span>Clinical Decision Support Engine</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Clinical Diagnoses, Medical Advice & Treatment Plans
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Evidence-based clinical guidelines grounded in the <strong>American Diabetes Association (ADA 2024 Standards of Care)</strong> and <strong>ICMR Diabetes Protocols</strong>.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('diagnoses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'diagnoses'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>1. Clinical Diagnoses</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('advice')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'advice'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>2. Medical Advice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('treatment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'treatment'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Treatment Plans</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: CLINICAL DIAGNOSES & EVALUATION
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'diagnoses' && (
        <div className="pt-6 space-y-6 animate-fade-in-down">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">1. Normoglycemia</span>
              <h4 className="font-extrabold text-slate-900 text-sm mt-1">Normal Metabolic Health</h4>
              <ul className="mt-2.5 space-y-1 text-xs text-slate-700">
                <li>• <strong>Fasting Glucose:</strong> &lt; 100 mg/dL</li>
                <li>• <strong>2-Hr OGTT:</strong> &lt; 140 mg/dL</li>
                <li>• <strong>HbA1c:</strong> &lt; 5.7%</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">2. Impaired Glucose</span>
              <h4 className="font-extrabold text-slate-900 text-sm mt-1">Pre-Diabetes (IFG / IGT)</h4>
              <ul className="mt-2.5 space-y-1 text-xs text-slate-700">
                <li>• <strong>Fasting Glucose:</strong> 100 – 125 mg/dL</li>
                <li>• <strong>2-Hr OGTT:</strong> 140 – 199 mg/dL</li>
                <li>• <strong>HbA1c:</strong> 5.7% – 6.4%</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/70">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-800">3. Diabetes Threshold</span>
              <h4 className="font-extrabold text-slate-900 text-sm mt-1">Type 2 Diabetes Mellitus</h4>
              <ul className="mt-2.5 space-y-1 text-xs text-slate-700">
                <li>• <strong>Fasting Glucose:</strong> ≥ 126 mg/dL</li>
                <li>• <strong>2-Hr OGTT:</strong> ≥ 200 mg/dL</li>
                <li>• <strong>HbA1c:</strong> ≥ 6.5%</li>
              </ul>
            </div>
          </div>

          {/* Interactive Diagnostic Evaluation Calculator */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Interactive Clinical Diagnostic Evaluator
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter your latest laboratory measurements to evaluate against ADA 2024 diagnostic thresholds:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Fasting Blood Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 110"
                  value={fastingGlucose}
                  onChange={(e) => setFastingGlucose(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  HbA1c Level (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 6.2"
                  value={hba1cVal}
                  onChange={(e) => setHba1cVal(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  2-Hr OGTT Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 155"
                  value={ogttVal}
                  onChange={(e) => setOgttVal(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center space-x-2">
              <input
                type="checkbox"
                id="symptomsCheck"
                checked={hasSymptoms}
                onChange={(e) => setHasSymptoms(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-400 cursor-pointer"
              />
              <label htmlFor="symptomsCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                Presenting classic hyperglycemia symptoms (Frequent urination, excessive thirst, rapid unexplained weight loss)
              </label>
            </div>

            {/* Diagnostic Evaluation Result Output */}
            {evalResult && (
              <div className="mt-5 p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm animate-fade-in-down">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${evalResult.badge}`}>
                    {evalResult.status}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-2 font-medium">
                  {evalResult.summary}
                </p>

                {evalResult.criteria.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-800">Triggered Criteria:</span>
                    <ul className="mt-1 space-y-0.5 text-slate-600">
                      {evalResult.criteria.map((c, idx) => (
                        <li key={idx}>✓ {c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-700">Clinical Recommendation: </span>
                  {evalResult.nextSteps}
                </div>
              </div>
            )}
          </div>

          {/* Differential Diagnoses & Clinical Rules */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 space-y-2">
            <h4 className="font-bold flex items-center text-indigo-900">
              <HelpCircle className="w-4 h-4 mr-1.5 text-indigo-600" />
              Clinical Differential Considerations
            </h4>
            <p className="text-slate-600 leading-relaxed">
              • <strong>LADA (Latent Autoimmune Diabetes in Adults):</strong> Patient presentation may resemble T2DM but includes autoantibodies (anti-GAD) with rapid progression to insulin dependency.<br />
              • <strong>Steroid-Induced Hyperglycemia:</strong> Corticosteroid therapy elevates postprandial glucose markedly.<br />
              • <strong>Confirmatory Standard:</strong> Unless acute symptomatic crisis occurs, diagnosis requires 2 abnormal test results from either the same sample or 2 separate test samples.
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: EVIDENCE-BASED MEDICAL ADVICE
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'advice' && (
        <div className="pt-6 space-y-6 animate-fade-in-down">
          {/* Glycemic Targets Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <div className="bg-slate-900 text-white px-4 py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>ADA 2024 Clinical Glycemic Targets for Non-Pregnant Adults</span>
              <span className="text-slate-400 font-normal">Individualize as needed</span>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-2.5 px-4">Biomarker / Timing</th>
                  <th className="py-2.5 px-4">Clinical Target</th>
                  <th className="py-2.5 px-4">Clinical Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-4 font-semibold">HbA1c</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">&lt; 7.0% (53 mmol/mol)</td>
                  <td className="py-2.5 px-4 text-slate-500">Significantly reduces microvascular complications (retinopathy, nephropathy).</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold">Fasting & Pre-Meal Glucose</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">80 – 130 mg/dL</td>
                  <td className="py-2.5 px-4 text-slate-500">Limits baseline liver glucose output throughout day and night.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold">Postprandial (1-2 hr post-meal)</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">&lt; 180 mg/dL</td>
                  <td className="py-2.5 px-4 text-slate-500">Reduces acute glycemic variability and oxidative vascular damage.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold">Blood Pressure</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">&lt; 130 / 80 mmHg</td>
                  <td className="py-2.5 px-4 text-slate-500">Protects renal glomerular filtration and lowers stroke risk.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Complication Screening Checklist & Emergency Rule of 15 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Screening Schedule */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center text-indigo-700">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Annual Complication Screening Protocol
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start">
                  <span className="font-bold text-slate-800 mr-2">👁️ Retinopathy:</span>
                  Annual dilated eye exam by an optometrist or ophthalmologist.
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-slate-800 mr-2">🧪 Nephropathy:</span>
                  Annual urinary albumin-to-creatinine ratio (uACR) and eGFR check.
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-slate-800 mr-2">🦶 Neuropathy:</span>
                  10g monofilament sensory examination and daily home foot checks.
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-slate-800 mr-2">❤️ Cardiovascular:</span>
                  Annual lipid panel (target LDL &lt; 70 mg/dL with ASCVD risk).
                </li>
              </ul>
            </div>

            {/* Hypoglycemia Rule of 15 */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2.5">
              <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600" />
                Acute Hypoglycemia Protocol: "Rule of 15"
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                If blood sugar drops below <strong>70 mg/dL</strong> or patient experiences shakiness, cold sweat, or dizziness:
              </p>
              <ol className="space-y-1 text-xs text-slate-700 list-decimal list-inside font-medium">
                <li>Consume <strong>15g fast-acting carbohydrates</strong> (1/2 cup fruit juice, 3-4 glucose candies).</li>
                <li>Wait <strong>15 minutes</strong> and recheck blood glucose.</li>
                <li>If still &lt; 70 mg/dL, consume another 15g and recheck.</li>
                <li>Once normalized, eat a small protein-rich snack to sustain levels.</li>
              </ol>
            </div>
          </div>

          {/* 5 High-Yield Doctor Consultation Questions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5 text-indigo-600" />
              Doctor Consultation Preparation Checklist:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                1. "What is my personalized HbA1c target based on my age and medical history?"
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                2. "Do any of my medications carry hypoglycemia risk or need kidney dose adjustments?"
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                3. "Am I a candidate for cardiorenal protective therapies (e.g. SGLT2i or GLP-1 RA)?"
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                4. "How often should I log fasting and post-meal glucose at home?"
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: COMPREHENSIVE MULTI-TIER TREATMENT PLANS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'treatment' && (
        <div className="pt-6 space-y-6 animate-fade-in-down">
          {/* Tier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tier 1: Medical Nutrition Therapy */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700">Tier 1 • Nutrition</span>
                  <h4 className="font-extrabold text-slate-900 text-sm">Medical Nutrition Therapy (MNT)</h4>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                • <strong>The Indian Plate Method:</strong> 50% non-starchy green vegetables (palak, methi, lauki, bhindi, cucumber); 25% plant/lean protein (sprouted moong, dal, rajma, low-fat paneer, tofu); 25% low-GI whole grains (jowar, ragi, bajra, brown rice).<br />
                • <strong>Fiber Target:</strong> 35–45g daily to delay carbohydrate absorption and suppress postprandial glucose spikes.<br />
                • <strong>Avoid:</strong> Refined flour (maida), packaged fruit juices, sweetened sodas, and fried namkeen.
              </p>
            </div>

            {/* Tier 2: Exercise & GLUT4 Activation */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-sky-100 text-sky-800 rounded-xl">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-sky-700">Tier 2 • Physical Activity</span>
                  <h4 className="font-extrabold text-slate-900 text-sm">Exercise & GLUT4 Muscle Uptake</h4>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                • <strong>Weekly Prescription:</strong> Minimum 150 minutes/week of moderate aerobic activity (brisk walking, cycling) spread over at least 3 days with no more than 2 consecutive rest days.<br />
                • <strong>Resistance Training:</strong> 2–3 sessions/week of light strength exercise.<br />
                • <strong>Post-Meal 15-Minute Stroll:</strong> Direct muscle contractions stimulate <strong>insulin-independent GLUT4 glucose uptake</strong>, blunting post-meal spikes by up to 30%.
              </p>
            </div>

            {/* Tier 3: Pharmacological Management Overview */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-700">Tier 3 • Pharmacotherapy</span>
                  <h4 className="font-extrabold text-slate-900 text-sm">Medication & Clinical Management</h4>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                • <strong>First-Line Foundational Therapy:</strong> Metformin (reduces hepatic glucose output, improves insulin sensitivity).<br />
                • <strong>Cardiorenal Protection:</strong> SGLT2 inhibitors (Empagliflozin/Dapagliflozin) for patients with heart failure or CKD; GLP-1 receptor agonists for ASCVD or weight reduction.<br />
                • <em>Note: Medication adjustments should strictly be prescribed and supervised by your endocrinologist.</em>
              </p>
            </div>

            {/* Tier 4: Self-Monitoring Schedule */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-700">Tier 4 • Monitoring</span>
                  <h4 className="font-extrabold text-slate-900 text-sm">Blood Glucose Monitoring (SMBG)</h4>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                • <strong>Fasting Check:</strong> Measure upon waking before breakfast (Target: 80–130 mg/dL).<br />
                • <strong>Postprandial Check:</strong> Measure 2 hours after the start of lunch or dinner (Target: &lt; 180 mg/dL).<br />
                • <strong>Log Review:</strong> Maintain a 14-day log to review trends with your doctor.
              </p>
            </div>

          </div>

          {/* Interactive CTA to Dr. Medo AI */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-pink-500/10 border border-indigo-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <DiaCareAvatar size={42} className="shadow-md" />
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Need a Personalized Breakdown of this Treatment Plan?
                </h4>
                <p className="text-[11px] text-slate-600">
                  Ask Dr. Medo to tailor this nutrition, exercise, and medication plan to your daily routine.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleAskMedoAbout('Can you explain a customized diabetes treatment plan for my lifestyle?')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-pink-500 hover:scale-105 transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              Ask Dr. Medo AI →
            </button>
          </div>
        </div>
      )}

      {/* Safety Notice Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
        <span>
          ⚕️ Clinical Decision Support protocols follow ADA 2024 Standards of Care & ICMR Guidelines for Type 2 Diabetes.
        </span>
        <span className="font-semibold text-slate-600">
          Educational guidance; always review with a qualified physician.
        </span>
      </div>
    </section>
  );
};

export default ClinicalDecisionHub;

